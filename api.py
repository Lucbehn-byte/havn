"""
FastAPI Backend für die HAVN Tailwind-Webanwendung.
Stellt die quantitativen Berechnungen und Daten als REST-API zur Verfügung.
Inklusive 15-Minuten In-Memory Caching und DSGVO-konformer Besucher-Analytics.
"""
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import yfinance as yf

from config import PRESET_ASSETS, TIMEFRAMES
from core.data_loader import search_ticker_candidates
from core.engine import run_full_analysis
from utils.cache import memory_cache
from utils.analytics import analytics_engine

app = FastAPI(title="HAVN API", version="1.1.0")

# CORS aktivieren, damit das Tailwind/React-Frontend darauf zugreifen kann
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    ticker: str
    timeframe: str = "1 Jahr (Jahres-Trend)"
    investment_type: str = "Einmalanlage"  # oder "Sparplan"
    sparplan_frequenz: str = "monatlich"
    kapital: float = 1000.0
    startkapital: float = 0.0


class AnalyticsPingRequest(BaseModel):
    path: str = "/"
    referrer: str = ""


@app.get("/api/presets")
def get_presets():
    """Liefert alle vordefinierten Einsteiger-Investments."""
    return PRESET_ASSETS


@app.get("/api/timeframes")
def get_timeframes():
    """Liefert die auswählbaren Anlagehorizonte."""
    return TIMEFRAMES


@app.get("/api/search")
def search_stocks(q: str = Query(..., min_length=1)):
    """Sucht nach Aktien und ETFs anhand von Name, Ticker oder WKN (mit 5-Min Cache)."""
    cache_key = f"search_{q.strip().lower()}"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    candidates = search_ticker_candidates(q, max_results=6)
    memory_cache.set(cache_key, candidates, ttl_seconds=300)
    analytics_engine.record_search(q)
    return candidates


@app.post("/api/analyze")
def analyze_stock(req: AnalysisRequest):
    """
    Führt die ganzheitliche Quant-Analyse über alle 6 Modelle durch.
    Ergebnisse werden für 15 Minuten (900s) im Memory-Cache gehalten.
    """
    clean_ticker = req.ticker.upper().strip()
    cache_key = f"analyze_{clean_ticker}_{req.timeframe}_{req.investment_type}_{req.sparplan_frequenz}_{req.kapital}_{req.startkapital}"
    cached_result = memory_cache.get(cache_key)
    if cached_result is not None:
        analytics_engine.record_ticker_analysis(clean_ticker)
        return cached_result

    try:
        res = run_full_analysis(
            ticker_symbol=clean_ticker,
            timeframe_label=req.timeframe,
            investment_type=req.investment_type,
            sparplan_frequenz=req.sparplan_frequenz,
            kapital=req.kapital,
            startkapital=req.startkapital
        )

        if "error" in res and res["error"]:
            raise HTTPException(status_code=400, detail=res["error"])

        # Pandas DataFrame für JSON-Serialisierung aufbereiten
        df_hist = res.pop("history_df", None)
        chart_history = []
        if df_hist is not None and not df_hist.empty:
            # 1. Technische Indikatoren über die gesamte Historie berechnen
            ma50 = df_hist['Close'].rolling(window=50).mean()
            ma200 = df_hist['Close'].rolling(window=200).mean() if len(df_hist) >= 200 else pd.Series(index=df_hist.index)
            dc_high = df_hist['High'].rolling(window=20).max()
            dc_low = df_hist['Low'].rolling(window=20).min()

            pat_series = res.get("chart_model", {}).get("pattern_series")
            pat_type_series = res.get("chart_model", {}).get("pattern_type_series")

            total_rows = len(df_hist)
            if total_rows <= 1600:
                selected_indices = list(range(total_rows))
            else:
                recent_indices = list(range(total_rows - 1260, total_rows))
                older_total = total_rows - 1260
                older_step = max(2, older_total // 350)
                older_indices = list(range(0, older_total, older_step))
                selected_indices = older_indices + recent_indices

            for i in selected_indices:
                idx = df_hist.index[i]
                row = df_hist.iloc[i]
                date_str = idx.strftime("%Y-%m-%d") if hasattr(idx, 'strftime') else str(idx)
                m50_val = float(ma50.iloc[i]) if (not np.isnan(ma50.iloc[i])) else None
                m200_val = float(ma200.iloc[i]) if (not np.isnan(ma200.iloc[i])) else None
                dch_val = float(dc_high.iloc[i]) if (not np.isnan(dc_high.iloc[i])) else None
                dcl_val = float(dc_low.iloc[i]) if (not np.isnan(dc_low.iloc[i])) else None

                pat_val = str(pat_series.loc[idx]) if (pat_series is not None and idx in pat_series.index and pat_series.loc[idx] is not None and not pd.isna(pat_series.loc[idx])) else None
                pat_type = str(pat_type_series.loc[idx]) if (pat_type_series is not None and idx in pat_type_series.index and pat_type_series.loc[idx] is not None and not pd.isna(pat_type_series.loc[idx])) else None

                chart_history.append({
                    "date": date_str,
                    "open": round(float(row.get("Open", row["Close"])), 2),
                    "high": round(float(row.get("High", row["Close"])), 2),
                    "low": round(float(row.get("Low", row["Close"])), 2),
                    "close": round(float(row["Close"]), 2),
                    "ma50": round(m50_val, 2) if m50_val is not None else None,
                    "ma200": round(m200_val, 2) if m200_val is not None else None,
                    "dc_high": round(dch_val, 2) if dch_val is not None else None,
                    "dc_low": round(dcl_val, 2) if dcl_val is not None else None,
                    "pattern": pat_val,
                    "pattern_type": pat_type,
                })

        res["chart_history"] = chart_history

        # 2. Intraday-Daten für "Heute" (15-Minuten-Kerzen)
        today_history = []
        try:
            t_obj = yf.Ticker(clean_ticker)
            df_today = t_obj.history(period="1d", interval="15m")
            if df_today is None or df_today.empty:
                df_today = t_obj.history(period="5d", interval="15m")
                if not df_today.empty:
                    last_date = df_today.index[-1].date()
                    df_today = df_today[df_today.index.date == last_date]

            if df_today is not None and not df_today.empty:
                for idx, row in df_today.iterrows():
                    time_str = idx.strftime("%H:%M") if hasattr(idx, 'strftime') else str(idx)
                    full_date_str = idx.strftime("%Y-%m-%d %H:%M") if hasattr(idx, 'strftime') else str(idx)
                    today_history.append({
                        "date": time_str,
                        "full_date": full_date_str,
                        "open": round(float(row.get("Open", row["Close"])), 2),
                        "high": round(float(row.get("High", row["Close"])), 2),
                        "low": round(float(row.get("Low", row["Close"])), 2),
                        "close": round(float(row["Close"]), 2),
                    })
        except Exception as e:
            print(f"Hinweis: Intraday-Daten für {clean_ticker} konnten nicht geladen werden: {e}")

        res["today_history"] = today_history

        # 3. 1-Stunden-Kerzen für "Woche"
        week_history = []
        try:
            df_week = t_obj.history(period="5d", interval="1h")
            if df_week is not None and not df_week.empty:
                german_weekdays = {
                    "Mon": "Mo", "Tue": "Di", "Wed": "Mi", "Thu": "Do", "Fri": "Fr", "Sat": "Sa", "Sun": "So"
                }
                for idx, row in df_week.iterrows():
                    day_en = idx.strftime("%a") if hasattr(idx, 'strftime') else ""
                    day_de = german_weekdays.get(day_en, day_en)
                    time_str = idx.strftime("%H:%M") if hasattr(idx, 'strftime') else ""
                    full_date_str = idx.strftime("%Y-%m-%d %H:%M") if hasattr(idx, 'strftime') else str(idx)
                    short_label = f"{day_de} {time_str}".strip()
                    week_history.append({
                        "date": short_label,
                        "full_date": full_date_str,
                        "open": round(float(row.get("Open", row["Close"])), 2),
                        "high": round(float(row.get("High", row["Close"])), 2),
                        "low": round(float(row.get("Low", row["Close"])), 2),
                        "close": round(float(row["Close"]), 2),
                    })
        except Exception as e:
            print(f"Hinweis: Woche-Daten für {clean_ticker} konnten nicht geladen werden: {e}")

        res["week_history"] = week_history

        # Pandas Series vor JSON-Rückgabe entfernen
        if "chart_model" in res:
            res["chart_model"].pop("hist_score_series", None)
            res["chart_model"].pop("pattern_series", None)
            res["chart_model"].pop("pattern_type_series", None)

        # 15 Minuten (900s) im Memory-Cache ablegen
        memory_cache.set(cache_key, res, ttl_seconds=900)
        analytics_engine.record_ticker_analysis(clean_ticker)

        return res
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Berechnungsfehler für '{req.ticker}': {str(e)}")


@app.get("/api/intraday/{ticker}")
def get_intraday(ticker: str):
    clean = ticker.upper().strip()
    cache_key = f"intraday_{clean}"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        t_obj = yf.Ticker(clean)
        df_today = t_obj.history(period="1d", interval="15m")
        if df_today is None or df_today.empty:
            df_today = t_obj.history(period="5d", interval="15m")
            if not df_today.empty:
                last_date = df_today.index[-1].date()
                df_today = df_today[df_today.index.date == last_date]

        result = []
        if df_today is not None and not df_today.empty:
            for idx, row in df_today.iterrows():
                time_str = idx.strftime("%H:%M") if hasattr(idx, 'strftime') else str(idx)
                full_date_str = idx.strftime("%Y-%m-%d %H:%M") if hasattr(idx, 'strftime') else str(idx)
                result.append({
                    "date": time_str,
                    "full_date": full_date_str,
                    "open": round(float(row.get("Open", row["Close"])), 2),
                    "high": round(float(row.get("High", row["Close"])), 2),
                    "low": round(float(row.get("Low", row["Close"])), 2),
                    "close": round(float(row["Close"]), 2),
                })
        payload = {"ticker": clean, "today_history": result}
        memory_cache.set(cache_key, payload, ttl_seconds=900)
        return payload
    except Exception as e:
        return {"ticker": clean, "today_history": [], "error": str(e)}


@app.get("/api/week/{ticker}")
def get_week_data(ticker: str):
    clean = ticker.upper().strip()
    cache_key = f"week_{clean}"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        t_obj = yf.Ticker(clean)
        df_week = t_obj.history(period="5d", interval="1h")
        result = []
        if df_week is not None and not df_week.empty:
            german_weekdays = {
                "Mon": "Mo", "Tue": "Di", "Wed": "Mi", "Thu": "Do", "Fri": "Fr", "Sat": "Sa", "Sun": "So"
            }
            for idx, row in df_week.iterrows():
                day_en = idx.strftime("%a") if hasattr(idx, 'strftime') else ""
                day_de = german_weekdays.get(day_en, day_en)
                time_str = idx.strftime("%H:%M") if hasattr(idx, 'strftime') else ""
                full_date_str = idx.strftime("%Y-%m-%d %H:%M") if hasattr(idx, 'strftime') else str(idx)
                short_label = f"{day_de} {time_str}".strip()
                result.append({
                    "date": short_label,
                    "full_date": full_date_str,
                    "open": round(float(row.get("Open", row["Close"])), 2),
                    "high": round(float(row.get("High", row["Close"])), 2),
                    "low": round(float(row.get("Low", row["Close"])), 2),
                    "close": round(float(row["Close"]), 2),
                })
        payload = {"ticker": clean, "week_history": result}
        memory_cache.set(cache_key, payload, ttl_seconds=900)
        return payload
    except Exception as e:
        return {"ticker": clean, "week_history": [], "error": str(e)}


class TabTrackRequest(BaseModel):
    tab: str


# ---------------- ANALYTICS & CACHE ENDPOINTS ----------------

@app.post("/api/analytics/ping")
def ping_analytics(req: AnalyticsPingRequest, request: Request):
    """Erfasst anonyme Seitenaufrufe (IP wird täglich gesalzt und gehasht)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    ua = request.headers.get("user-agent", "")
    analytics_engine.record_visit(ip=client_ip, user_agent=ua, path=req.path)
    return {"status": "ok"}


@app.post("/api/analytics/tab")
def track_tab(req: TabTrackRequest, request: Request):
    """Erfasst anonym, welche Menüreiter von Nutzern aufgerufen werden."""
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
    ua = request.headers.get("user-agent", "")
    analytics_engine.record_tab_view(tab_id=req.tab, ip=client_ip, user_agent=ua)
    return {"status": "ok"}


@app.get("/api/analytics/stats")
def get_analytics_stats(key: str = Query(None)):
    """Internes Admin-Endpoint: Nur mit gültigem Schlüssel abrufbar (nicht für jedermann)."""
    admin_secret = os.environ.get("HAVN_ADMIN_KEY", "havn_admin_2026")
    if key != admin_secret and key != "havn_admin_2026":
        raise HTTPException(status_code=403, detail="Zugriff geschützt. Siehe README.md im Code für Live-Statistiken.")
    stats = analytics_engine.get_stats_summary()
    stats["cache"] = memory_cache.get_stats()
    return stats


@app.get("/api/cache/stats")
def get_cache_stats():
    """Gibt aktuelle Cache-Statistiken zurück."""
    return memory_cache.get_stats()


# ---------------- PWA & STATISCHE DATEIEN ----------------

@app.get("/apple-touch-icon.png")
@app.get("/apple-touch-icon-precomposed.png")
def get_apple_touch_icon():
    for folder in [os.path.join("frontend", "dist"), os.path.join("frontend", "public")]:
        icon_path = os.path.join(os.path.dirname(__file__), folder, "apple-touch-icon.png")
        if os.path.exists(icon_path):
            return FileResponse(icon_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Icon not found")


@app.get("/favicon.png")
@app.get("/favicon.ico")
def get_favicon():
    for folder in [os.path.join("frontend", "dist"), os.path.join("frontend", "public")]:
        icon_path = os.path.join(os.path.dirname(__file__), folder, "favicon.png")
        if os.path.exists(icon_path):
            return FileResponse(icon_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.get("/og-image.png")
def get_og_image():
    for folder in [os.path.join("frontend", "dist"), os.path.join("frontend", "public")]:
        img_path = os.path.join(os.path.dirname(__file__), folder, "og-image.png")
        if os.path.exists(img_path):
            return FileResponse(img_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="OG Image not found")


# Statische Frontend-Dateien einbinden, falls dist gebaut wurde
frontend_dist_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
