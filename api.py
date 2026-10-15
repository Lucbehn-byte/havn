"""
FastAPI Backend für die HAVN Tailwind-Webanwendung.
Stellt die quantitativen Berechnungen und Daten als REST-API zur Verfügung.
"""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os

from config import PRESET_ASSETS, TIMEFRAMES
from core.data_loader import search_ticker_candidates
from core.engine import run_full_analysis

app = FastAPI(title="HAVN API", version="1.0.0")

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
    """Sucht nach Aktien und ETFs anhand von Name, Ticker oder WKN."""
    candidates = search_ticker_candidates(q, max_results=6)
    return candidates


@app.post("/api/analyze")
def analyze_stock(req: AnalysisRequest):
    """Führt die ganzheitliche Quant-Analyse über alle 6 Modelle durch."""
    try:
        res = run_full_analysis(
            ticker_symbol=req.ticker,
            timeframe_label=req.timeframe,
            investment_type=req.investment_type,
            sparplan_frequenz=req.sparplan_frequenz,
            kapital=req.kapital
        )

        if "error" in res and res["error"]:
            raise HTTPException(status_code=400, detail=res["error"])

        # Pandas DataFrame für JSON-Serialisierung aufbereiten (letzte 380 Tage)
        df_hist = res.pop("history_df", None)
        chart_history = []
        if df_hist is not None and not df_hist.empty:
            plot_df = df_hist.iloc[-380:].copy() if len(df_hist) > 380 else df_hist.copy()
            ma50 = plot_df['Close'].rolling(window=50).mean()
            ma200 = plot_df['Close'].rolling(window=200).mean() if len(df_hist) >= 200 else pd.Series(index=plot_df.index)
            dc_high = plot_df['High'].rolling(window=20).max()
            dc_low = plot_df['Low'].rolling(window=20).min()

            for idx, row in plot_df.iterrows():
                date_str = idx.strftime("%Y-%m-%d") if hasattr(idx, 'strftime') else str(idx)
                m50_val = float(ma50.loc[idx]) if (idx in ma50.index and not np.isnan(ma50.loc[idx])) else None
                m200_val = float(ma200.loc[idx]) if (idx in ma200.index and not np.isnan(ma200.loc[idx])) else None
                dch_val = float(dc_high.loc[idx]) if (idx in dc_high.index and not np.isnan(dc_high.loc[idx])) else None
                dcl_val = float(dc_low.loc[idx]) if (idx in dc_low.index and not np.isnan(dc_low.loc[idx])) else None

                chart_history.append({
                    "date": date_str,
                    "close": round(float(row["Close"]), 2),
                    "ma50": round(m50_val, 2) if m50_val is not None else None,
                    "ma200": round(m200_val, 2) if m200_val is not None else None,
                    "dc_high": round(dch_val, 2) if dch_val is not None else None,
                    "dc_low": round(dcl_val, 2) if dcl_val is not None else None,
                })

        res["chart_history"] = chart_history

        # hist_score_series aus dem chart_model entfernen (ist pd.Series)
        if "chart_model" in res and "hist_score_series" in res["chart_model"]:
            res["chart_model"].pop("hist_score_series", None)

        return res
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Berechnungsfehler für '{req.ticker}': {str(e)}")


from fastapi.responses import FileResponse

# Direkte Routen für Apple Touch Icon und Favicons (für iOS Safari & PWA)
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

# Statische Frontend-Dateien einbinden, falls dist gebaut wurde
frontend_dist_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
