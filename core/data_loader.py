"""
Datenbeschaffung und -vorbereitung über yfinance.
Lädt Kursdaten und Metadaten zuverlässig und bereinigt Spaltenformate.
"""
import yfinance as yf
import pandas as pd
from config import PRESET_ASSETS


def get_asset_info(ticker_symbol: str) -> dict:
    """
    Ermittelt lesbare Metadaten zum Ticker (Name, Währung, ISIN, WKN).
    Prüft zuerst die hinterlegten Presets, andernfalls yfinance.
    """
    clean_ticker = ticker_symbol.upper().strip()
    
    # 1. Zuerst prüfen, ob es ein bekanntes Preset ist
    for name, data in PRESET_ASSETS.items():
        if data["ticker"].upper() == clean_ticker:
            return {
                "name": name,
                "ticker": clean_ticker,
                "wkn": data["wkn"],
                "isin": data["isin"],
                "typ": data["typ"],
                "beschreibung": data["beschreibung"]
            }

    # 2. Falls nicht, über yfinance abfragen
    try:
        t = yf.Ticker(clean_ticker)
        short_name = clean_ticker
        try:
            info = t.info or {}
            short_name = info.get("shortName") or info.get("longName") or clean_ticker
            quote_type = info.get("quoteType", "EQUITY")
            typ_str = "ETF / Fonds" if quote_type == "ETF" else "Aktie"
            isin_val = info.get("isin", "Über Broker suchen")
            desc = info.get("longBusinessSummary", "")
        except Exception:
            # Fallback über fast_info falls Yahoo den Crumb blockiert
            quote_type = "EQUITY"
            typ_str = "Wertpapier"
            isin_val = "Über Broker suchen"
            desc = ""
        
        return {
            "name": short_name,
            "ticker": clean_ticker,
            "wkn": "Über Broker suchen",
            "isin": isin_val,
            "typ": typ_str,
            "beschreibung": (desc[:200] + "...") if desc else "Automatisch analysiertes Wertpapier."
        }
    except Exception:
        return {
            "name": clean_ticker,
            "ticker": clean_ticker,
            "wkn": "Über Broker suchen",
            "isin": "Über Broker suchen",
            "typ": "Wertpapier",
            "beschreibung": ""
        }


def fetch_stock_data(ticker_symbol: str, history_period: str = "max") -> tuple[pd.DataFrame, str | None]:
    """
    Lädt historische Tageskurse herunter und bereinigt das Format.
    
    Rückgabe:
        (DataFrame, None) bei Erfolg
        (leerer DataFrame, Fehlermeldung) bei Fehler
    """
    clean_ticker = ticker_symbol.upper().strip()
    if not clean_ticker:
        return pd.DataFrame(), "Bitte ein gültiges Tickersymbol eingeben."

    try:
        ticker_obj = yf.Ticker(clean_ticker)
        df = ticker_obj.history(period=history_period, auto_adjust=True)
    except Exception as e:
        return pd.DataFrame(), f"Verbindungsfehler zu Yahoo Finance: {str(e)}"

    if df.empty or len(df) < 20:
        # Falls mit period="max" nichts kam, nochmal mit "5y" versuchen
        try:
            df = ticker_obj.history(period="5y", auto_adjust=True)
        except Exception:
            pass

    if df.empty or len(df) < 20:
        return pd.DataFrame(), f"Für das Symbol '{clean_ticker}' konnten keine ausreichenden Kursdaten gefunden werden. Tipp: Für deutsche Aktien bitte z. B. '.DE' anhängen (z. B. SAP.DE)."

    # MultiIndex-Spalten auflösen, falls yfinance diese zurückliefert
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # Zeitzoneninformationen entfernen für einheitliche Datumsvergleiche
    if df.index.tz is not None:
        df.index = df.index.tz_localize(None)

    # Fehlende Werte bereinigen
    df = df.dropna(subset=['Close'])

    return df, None


def search_ticker_candidates(query: str, max_results: int = 6) -> list[dict]:
    """
    Sucht nach Aktien und ETFs anhand von Namen oder Ticker über yfinance.Search.
    """
    clean_query = query.strip()
    if not clean_query:
        return []
    
    results = []
    # 1. Zuerst Presets durchsuchen
    for name, p_data in PRESET_ASSETS.items():
        if clean_query.lower() in name.lower() or clean_query.lower() in p_data["ticker"].lower():
            results.append({
                "symbol": p_data["ticker"],
                "name": name,
                "type": p_data["typ"],
                "exchange": "Preset"
            })
            
    # 2. Yahoo Finance Search abfragen
    try:
        s = yf.Search(clean_query, max_results=max_results)
        for q in s.quotes:
            sym = q.get("symbol")
            if not sym or any(r["symbol"] == sym for r in results):
                continue
            q_type = q.get("quoteType", "EQUITY")
            typ_label = "ETF" if q_type == "ETF" else ("Aktie" if q_type == "EQUITY" else q_type)
            name_label = q.get("shortname") or q.get("longname") or sym
            exch = q.get("exchange", "")
            results.append({
                "symbol": sym,
                "name": name_label,
                "type": typ_label,
                "exchange": exch
            })
    except Exception:
        pass
        
    return results
