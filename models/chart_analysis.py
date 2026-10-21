"""
Modell 1: Technische Chartanalyse & Trendindikator-System
Berechnet Donchian-Kanäle, Gleitende Durchschnitte (GD50/GD200), RSI, Bollinger-Bänder,
MACD und ein adaptives Marktregime basierend auf der Average True Range (ATR).
"""
import numpy as np
import pandas as pd


def analyze_chart_technicals(df: pd.DataFrame, category: str = "mittel") -> dict:
    """
    Führt eine mehrdimensionale technische Chartanalyse durch.
    
    Parameter:
        df: DataFrame mit Spalten ['Open', 'High', 'Low', 'Close', 'Volume']
        category: 'kurz', 'mittel' oder 'lang' (steuert die Fenstergrößen)
        
    Rückgabe:
        dict mit:
            - 'score': float (-100 bis +100)
            - 'regime': str ('Bullisch', 'Bärisch', 'Neutral')
            - 'summary': str (Laienverständliche Zusammenfassung)
            - 'signals': list[str] (Begründungen der Indikatoren)
            - 'indicators': dict (Exakte Kennzahlen)
            - 'hist_score_series': pd.Series (Causale Zeitreihe für Backtesting)
    """
    if df.empty or len(df) < 30:
        return {
            "score": 0.0,
            "regime": "Unzureichende Daten",
            "summary": "Es liegen zu wenige historische Kursdaten vor.",
            "signals": [],
            "indicators": {},
            "hist_score_series": None
        }

    close_series = df['Close'].squeeze()
    c = close_series.values
    current_price = float(c[-1])
    
    # 1. Volatilitätsanalyse & Marktregime via ATR (Average True Range)
    high_low = df['High'] - df['Low']
    high_prev_close = np.abs(df['High'] - df['Close'].shift())
    low_prev_close = np.abs(df['Low'] - df['Close'].shift())
    tr = pd.concat([high_low, high_prev_close, low_prev_close], axis=1).max(axis=1)
    
    atr_14 = tr.rolling(window=14).mean()
    current_atr = float(atr_14.iloc[-1]) if not np.isnan(atr_14.iloc[-1]) else 0.0
    volatility_ratio = current_atr / (current_price + 1e-9)
    
    mean_vol_ratio = (atr_14 / df['Close']).rolling(window=20).mean().iloc[-1]
    is_volatile_regime = bool(volatility_ratio > (mean_vol_ratio if not np.isnan(mean_vol_ratio) else 0.02))

    # Gewichtung nach Marktregime und Zeithorizont
    # Bei 'kurz' (3T / 10T): Candlestick-Muster und Oszillatoren zählen stark (55-60%)
    # Bei 'lang' (3J / 5J): Trendkanäle & Durchschnitte dominieren, Candlesticks haben 0% Einfluss
    if category == "kurz":
        w_candle = 0.25
        w_donchian = 0.20 if is_volatile_regime else 0.15
        w_oscillator = 0.15 if is_volatile_regime else 0.30
        w_trend = 0.15
    elif category == "mittel":
        w_candle = 0.10
        w_donchian = 0.25 if is_volatile_regime else 0.15
        w_oscillator = 0.15 if is_volatile_regime else 0.25
        w_trend = 0.25 if is_volatile_regime else 0.15
    else:  # lang
        w_candle = 0.00
        w_donchian = 0.30 if is_volatile_regime else 0.20
        w_oscillator = 0.10 if is_volatile_regime else 0.15
        w_trend = 0.30 if is_volatile_regime else 0.20

    score = 0.0
    signals = []
    indicators = {
        "Aktueller Kurs": round(current_price, 2),
        "ATR (14 Tage)": round(current_atr, 2),
        "Marktumfeld": "Erhöhte Schwankungsbreite (Volatil)" if is_volatile_regime else "Ruhiges Marktumfeld"
    }

    # 2. Donchian-Kanäle (Multi-Zeithorizont je nach Kategorie)
    dc_window = 10 if category == "kurz" else (20 if category == "mittel" else 50)
    dc_high_s = df['High'].rolling(window=dc_window).max()
    dc_low_s = df['Low'].rolling(window=dc_window).min()
    dc_mid_s = (dc_high_s + dc_low_s) / 2
    
    dc_high = float(dc_high_s.iloc[-1])
    dc_low = float(dc_low_s.iloc[-1])
    dc_mid = float(dc_mid_s.iloc[-1])
    
    indicators[f"Donchian Hoch ({dc_window}T)"] = round(dc_high, 2)
    indicators[f"Donchian Tief ({dc_window}T)"] = round(dc_low, 2)
    indicators[f"Donchian Mitte ({dc_window}T)"] = round(dc_mid, 2)

    if current_price >= dc_high * 0.995:
        score += w_donchian
        signals.append(f"🟢 Donchian-Kanal ({dc_window} Tage): Kurs notiert am oberen Ausbruchslevel ({dc_high:.2f} €). Bullischer Impuls.")
    elif current_price <= dc_low * 1.005:
        score -= w_donchian
        signals.append(f"🔴 Donchian-Kanal ({dc_window} Tage): Kurs touchiert das untere Band ({dc_low:.2f} €). Erhöhter Verkaufsdruck.")
    elif current_price > dc_mid:
        score += 0.05
        signals.append(f"🟢 Donchian-Kanal: Kurs notiert in der oberen Hälfte des Trendkanals.")
    else:
        score -= 0.05
        signals.append(f"🟡 Donchian-Kanal: Kurs pendelt in der unteren Hälfte des Trendkanals.")

    donchian_score_s = np.where(close_series >= dc_high_s * 0.995, w_donchian,
                        np.where(close_series <= dc_low_s * 1.005, -w_donchian,
                        np.where(close_series > dc_mid_s, 0.05, -0.05)))

    # 3. Gleitende Durchschnitte (GD50, GD200, Golden Cross)
    trend_score_s = pd.Series(0.0, index=df.index)
    if len(c) >= 200:
        gd50_s = df['Close'].rolling(window=50).mean()
        gd200_s = df['Close'].rolling(window=200).mean()
        gd50 = float(gd50_s.iloc[-1])
        gd200 = float(gd200_s.iloc[-1])
        
        indicators["GD50 (50-Tage-Linie)"] = round(gd50, 2)
        indicators["GD200 (200-Tage-Linie)"] = round(gd200, 2)

        # Über/unter GD200
        if current_price > gd200:
            score += w_trend
            signals.append(f"🟢 Über 200-Tage-Linie ({gd200:.2f} €): Langfristiger Aufwärtstrend intakt.")
        else:
            score -= w_trend
            signals.append(f"🔴 Unter 200-Tage-Linie ({gd200:.2f} €): Langfristiger Abwärtstrend mahnt zur Vorsicht.")

        # Golden Cross / Death Cross
        if gd50 > gd200:
            score += 0.08
            signals.append("🟢 Golden Cross: Mittelfristige 50-Tage-Linie verläuft über der 200-Tage-Linie (positives Marktumfeld).")
        else:
            score -= 0.08
            signals.append("🔴 Death Cross: 50-Tage-Linie verläuft unter der 200-Tage-Linie.")

        trend_score_s = np.where(close_series > gd200_s, w_trend, -w_trend) + \
                        np.where(gd50_s > gd200_s, 0.08, -0.08)
    elif len(c) >= 50:
        gd50_s = df['Close'].rolling(window=50).mean()
        gd50 = float(gd50_s.iloc[-1])
        indicators["GD50 (50-Tage-Linie)"] = round(gd50, 2)
        if current_price > gd50:
            score += w_trend
            signals.append(f"🟢 Über 50-Tage-Linie ({gd50:.2f} €): Solider mittelfristiger Trend.")
        else:
            score -= w_trend
            signals.append(f"🔴 Unter 50-Tage-Linie ({gd50:.2f} €).")
        trend_score_s = np.where(close_series > gd50_s, w_trend, -w_trend)

    # 4. Momentum & Oszillatoren (RSI & Bollinger-Bänder)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rsi_s = 100 - (100 / (1 + (gain / (loss + 1e-9)) + 1e-9))
    rsi = float(rsi_s.iloc[-1]) if not np.isnan(rsi_s.iloc[-1]) else 50.0
    indicators["RSI (14 Tage)"] = round(rsi, 1)

    if rsi < 30:
        score += w_oscillator
        signals.append(f"🟢 RSI bei {rsi:.1f}: Aktie ist statistisch überverkauft – Chance auf technische Gegenbewegung.")
    elif rsi > 70:
        score -= w_oscillator
        signals.append(f"🟡 RSI bei {rsi:.1f}: Aktie ist heißgelaufen (überkauft) – kurzfristiges Konsolidierungsrisiko.")
    else:
        signals.append(f"⚪ RSI bei {rsi:.1f}: Gesunder neutraler Schwungbereich.")

    rsi_score_s = np.where(rsi_s < 30, w_oscillator, np.where(rsi_s > 70, -w_oscillator, 0.0))

    # Bollinger-Bänder (20 Tage, 2 Standardabweichungen)
    ma20_s = df['Close'].rolling(window=20).mean()
    std20_s = df['Close'].rolling(window=20).std()
    upper_b_s = ma20_s + 2 * std20_s
    lower_b_s = ma20_s - 2 * std20_s

    boll_score_s = pd.Series(0.0, index=df.index)
    if not np.isnan(upper_b_s.iloc[-1]):
        upper_b = float(upper_b_s.iloc[-1])
        lower_b = float(lower_b_s.iloc[-1])
        indicators["Bollinger Oben"] = round(upper_b, 2)
        indicators["Bollinger Unten"] = round(lower_b, 2)

        if current_price < lower_b:
            score += 0.05
            signals.append("🟢 Bollinger-Bänder: Kurs notiert unter dem unteren Band (statistische Untertreibung).")
        elif current_price > upper_b:
            score -= 0.05
            signals.append("🟡 Bollinger-Bänder: Kurs notiert über dem oberen Band (statistisch ausgereizt).")

        boll_score_s = np.where(close_series < lower_b_s, 0.05,
                       np.where(close_series > upper_b_s, -0.05, 0.0))

    # 5. Candlestick Price-Action (Reversals & Richtungsübernahme)
    o = df['Open']
    h = df['High']
    l = df['Low']
    c_s = df['Close']
    body = c_s - o
    body_abs = np.abs(body)
    hl = h - l + 1e-9
    upper_wick = h - np.maximum(o, c_s)
    lower_wick = np.minimum(o, c_s) - l

    is_hammer = (lower_wick >= 1.8 * body_abs) & (upper_wick <= 0.35 * hl) & (c_s >= (l + 0.55 * hl))
    is_shooting_star = (upper_wick >= 1.8 * body_abs) & (lower_wick <= 0.35 * hl) & (c_s <= (l + 0.45 * hl))
    is_bull_engulf = (body.shift(1) < 0) & (body > 0) & (o <= c_s.shift(1) * 1.002) & (c_s >= o.shift(1) * 0.998) & (body_abs >= body_abs.shift(1))
    is_bear_engulf = (body.shift(1) > 0) & (body < 0) & (o >= c_s.shift(1) * 0.998) & (c_s <= o.shift(1) * 1.002) & (body_abs >= body_abs.shift(1))
    is_doji = (body_abs / hl <= 0.08)
    is_morning_star = (body.shift(2) < -0.005 * c_s.shift(2)) & (body_abs.shift(1) < 0.5 * body_abs.shift(2)) & (body > 0) & (c_s >= (o.shift(2) + c_s.shift(2)) / 2)
    is_evening_star = (body.shift(2) > 0.005 * c_s.shift(2)) & (body_abs.shift(1) < 0.5 * body_abs.shift(2)) & (body < 0) & (c_s <= (o.shift(2) + c_s.shift(2)) / 2)

    candle_score_s = pd.Series(0.0, index=df.index)
    if w_candle > 0:
        raw_c = np.where(is_morning_star, w_candle * 1.2,
                np.where(is_evening_star, -w_candle * 1.2,
                np.where(is_bull_engulf, w_candle,
                np.where(is_bear_engulf, -w_candle,
                np.where(is_hammer, w_candle * 0.85,
                np.where(is_shooting_star, -w_candle * 0.85, 0.0))))))
        candle_score_s = pd.Series(raw_c, index=df.index)
        latest_c_score = float(candle_score_s.iloc[-1])
        score += latest_c_score

    # Ausweisung des aktuellen Candlestick-Musters
    current_candle_name = "Neutrale Standardkerze"
    if bool(is_morning_star.iloc[-1]):
        current_candle_name = "Morning Star (Bullisches 3-Kerzen-Reversal)"
        signals.append("🕯️ Candlestick: Morning Star – Klassische Bodenbildung mit hoher statistischer Rebound-Quote.")
    elif bool(is_evening_star.iloc[-1]):
        current_candle_name = "Evening Star (Bärisches Erschöpfungsmuster)"
        signals.append("🕯️ Candlestick: Evening Star – 3-Tage-Topformation signalisiert Erschöpfung der Käuferseite.")
    elif bool(is_bull_engulf.iloc[-1]):
        current_candle_name = "Bullish Engulfing (Kaufimpuls)"
        signals.append("🕯️ Candlestick: Bullish Engulfing – Aktuelle Kerze umschließt den Vortag vollständig. Käufer haben das Ruder übernommen.")
    elif bool(is_bear_engulf.iloc[-1]):
        current_candle_name = "Bearish Engulfing (Verkaufsdruck)"
        signals.append("🕯️ Candlestick: Bearish Engulfing – Verkäufer haben die Vortagesgewinne komplett absorbiert.")
    elif bool(is_hammer.iloc[-1]):
        current_candle_name = "Hammer / Pinbar (Kaufnachfrage am Tief)"
        signals.append("🕯️ Candlestick: Hammer / Bullish Pinbar – Lange Lunte nach unten zeigt starke Nachfrage am Tagestief.")
    elif bool(is_shooting_star.iloc[-1]):
        current_candle_name = "Shooting Star (Verkauf am Tageshoch)"
        signals.append("🕯️ Candlestick: Shooting Star – Hohe Kurse wurden am Tageshoch abverkauft.")
    elif bool(is_doji.iloc[-1]):
        current_candle_name = "Doji (Markt-Gleichgewicht)"
        signals.append("🕯️ Candlestick: Doji – Käufer und Verkäufer halten sich die Waage. Häufig Vorbote einer Richtungsentscheidung.")

    indicators["Candlestick-Muster"] = current_candle_name

    # Gesamte historische Score-Zeitreihe für Backtesting zusammensetzen
    hist_score_series = pd.Series(
        donchian_score_s + trend_score_s + rsi_score_s + boll_score_s + candle_score_s,
        index=df.index
    ).clip(-1.0, 1.0)

    # Finale Normierung auf -100 bis +100
    norm_score = round(float(np.clip(score, -1.0, 1.0)) * 100, 1)

    if norm_score > 15:
        regime = "Bullisch (Kaufsignale überwiegen)"
        summary = "Das Modell erkennt einen soliden Aufwärtstrend. Wichtige Chartmarken und Kerzenformationen stützen die Entwicklung."
    elif norm_score < -15:
        regime = "Bärisch (Vorsicht angebracht)"
        summary = "Das Modell registriert erhöhten Verkaufsdruck oder einen intakten Abwärtstrend. Einstiege sollten defensiv gestaffelt werden."
    else:
        regime = "Neutral / Konsolidierung"
        summary = "Der Kurs schwankt innerhalb einer Seitwärtsspanne ohne klare Richtung. Für Sparplan-Anleger oft ein solider Akkumulationszeitraum."

    return {
        "score": norm_score,
        "regime": regime,
        "summary": summary,
        "signals": signals,
        "indicators": indicators,
        "hist_score_series": hist_score_series
    }
