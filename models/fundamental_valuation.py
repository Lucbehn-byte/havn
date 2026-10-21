"""
Modell 6: Fundamentale Bewertung & Wall-Street-Analystenkonsens
Prüft fundamentale Bewertungskennzahlen (KGV, Forward-KGV, PEG-Ratio, Gewinnmarge)
sowie den aggregierten institutionellen Konsens führender Wall-Street-Analysten
(Median-Kursziel, Forward-EPS-Gewinnwachstum, Analysten-Rating).
Modelliert KGV-Mean-Reversion (Bewertungskompression/-expansion) für den stochastischen Drift.
"""
import yfinance as yf
import numpy as np


def analyze_fundamental_valuation(
    ticker_symbol: str,
    current_price: float = 0.0,
    holding_days: int = 252
) -> dict:
    """
    Ermittelt fundamentale Bewertungskennzahlen und institutionellen Analystenkonsens.
    
    Rückgabe:
        dict mit:
            - 'is_etf': bool
            - 'valuation_status': str
            - 'summary': str
            - 'metrics': dict von Kennzahlen
            - 'drift_adjustment': float (annualisierter Anpassungsfaktor)
            - 'analyst_consensus': dict oder None (Kursziele & Schätzungen)
    """
    clean_ticker = ticker_symbol.upper().strip()
    is_etf = False
    metrics = {}
    drift_adj = 0.0

    try:
        t = yf.Ticker(clean_ticker)
        fast = getattr(t, "fast_info", None)
        if fast:
            q_type = getattr(fast, "quote_type", "")
            is_etf = q_type == "ETF" or "ETF" in clean_ticker or any(sub in clean_ticker for sub in ["EUNL", "VWCE", "URTH", "ACWI", "SXR8"])
    except Exception:
        pass

    if is_etf:
        metrics["Laufende Kosten (TER)"] = "ca. 0.20% p.a."
        metrics["Ausschüttungsart"] = "Thesaurierend / Diversifiziert"
        metrics["Diversifikation"] = "Weltweiter Aktienkorb"

        return {
            "is_etf": True,
            "valuation_status": "Breit diversifiziert (ETF)",
            "summary": "Als Korb aus vielen Einzeltiteln unterliegt dieser ETF keinem individuellen Pleite- oder Bewertungsrisiko einer einzelnen Firma.",
            "metrics": metrics,
            "drift_adjustment": 0.0,
            "analyst_consensus": None
        }

    # Aktien-Bewertung & Wall-Street Analystendaten abfragen
    pe = None
    forward_pe = None
    peg = None
    rev_growth = None
    profit_margin = None
    div_yield = None
    
    target_median = None
    target_mean = None
    opinions_count = None
    rec_key = None
    forward_eps = None
    trailing_eps = None

    try:
        t = yf.Ticker(clean_ticker)
        info = getattr(t, "info", None)
        if isinstance(info, dict) and info:
            pe = info.get("trailingPE")
            forward_pe = info.get("forwardPE")
            peg = info.get("pegRatio")
            rev_growth = info.get("revenueGrowth")
            profit_margin = info.get("profitMargins")
            div_yield = info.get("dividendYield")

            target_median = info.get("targetMedianPrice")
            target_mean = info.get("targetMeanPrice")
            opinions_count = info.get("numberOfAnalystOpinions")
            rec_key = info.get("recommendationKey")
            forward_eps = info.get("forwardEps")
            trailing_eps = info.get("trailingEps")
    except Exception:
        pass

    # Basis-Kennzahlen formatieren
    if pe is not None:
        metrics["KGV (Aktuell)"] = f"{pe:.1f}"
    if forward_pe is not None:
        metrics["Forward-KGV"] = f"{forward_pe:.1f}"
    if peg is not None:
        metrics["PEG-Ratio"] = f"{peg:.2f}"
    if rev_growth is not None:
        metrics["Umsatzwachstum"] = f"{rev_growth * 100:+.1f}%"
    if profit_margin is not None:
        metrics["Gewinnmarge"] = f"{profit_margin * 100:.1f}%"
    if div_yield is not None:
        metrics["Dividendenrendite"] = f"{div_yield * 100:.2f}%" if div_yield < 1 else f"{div_yield:.2f}%"

    # Wall-Street Konsens & Forward-EPS auswerten
    analyst_consensus = None
    upside_pct = None
    forward_eps_growth = None

    if current_price <= 0 and pe and trailing_eps:
        current_price = pe * trailing_eps

    if target_median is not None and current_price > 0:
        upside_pct = round(((target_median - current_price) / current_price) * 100.0, 1)

    if forward_eps is not None and trailing_eps is not None and abs(trailing_eps) > 0.01:
        forward_eps_growth = round(((forward_eps - trailing_eps) / abs(trailing_eps)) * 100.0, 1)

    # Übersetzen der Analysten-Empfehlung
    rec_translations = {
        "strong_buy": "Starker Kauf (Strong Buy)",
        "buy": "Kaufenswert (Buy)",
        "hold": "Halten (Neutral)",
        "underperform": "Untergewichten",
        "sell": "Verkaufen (Sell)"
    }
    rec_label = rec_translations.get(rec_key, rec_key.capitalize() if rec_key else "Keine Einstufung")

    if opinions_count or target_median or forward_eps_growth is not None:
        analyst_consensus = {
            "target_median_price": round(float(target_median), 2) if target_median else None,
            "upside_pct": upside_pct,
            "opinions_count": int(opinions_count) if opinions_count else 0,
            "recommendation": rec_label,
            "forward_eps": round(float(forward_eps), 2) if forward_eps else None,
            "trailing_eps": round(float(trailing_eps), 2) if trailing_eps else None,
            "forward_eps_growth_pct": forward_eps_growth
        }

    # 1. KGV Mean-Reversion Modell (Ornstein-Uhlenbeck Drift-Korrektur)
    # Nutze gewichtetes Forward-KGV zur Beurteilung der tatsächlichen Bewertungshöhe
    effective_pe = (0.65 * forward_pe + 0.35 * pe) if (forward_pe and pe) else (pe or forward_pe)
    holding_years = max(0.2, holding_days / 252.0)

    if effective_pe is None:
        status = "Wachstumsphase / Keine KGV-Daten"
        summary = "Für dieses Unternehmen liegt aktuell kein Standard-KGV vor (häufig bei jungen Technologie- oder Turnaround-Unternehmen)."
        drift_adj = 0.0
    elif effective_pe < 14:
        status = "Günstig bewertet (Value-Potenzial)"
        summary = f"Mit einem effektiven KGV von {effective_pe:.1f} ist die Aktie günstig bewertet. Langfristig besteht Kurspotenzial durch Bewertungserholung."
        drift_adj = +0.018  # +1.8% p.a. Rückenwind durch Multiple Expansion
    elif effective_pe <= 30:
        status = "Fair bis moderat bewertet"
        summary = f"Ein effektives KGV von {effective_pe:.1f} spiegelt ein solides, marktübliches Niveau für etablierte Qualitätsunternehmen wider."
        drift_adj = 0.0
    elif effective_pe <= 45:
        status = "Ambitioniert bewertet"
        summary = f"Ein effektives KGV von {effective_pe:.1f} verlangt kontinuierlich hohes Wachstum. Bei Enttäuschungen droht eine Normalisierung der Multiples."
        drift_adj = -0.012  # -1.2% p.a. Dämpfung
    else:
        status = "Sehr teuer / Hype-Bewertung"
        summary = f"Ein effektives KGV von {effective_pe:.1f} signalisiert eine extreme Bewertung. Bei mehrjähriger Haltedauer droht Gegenwind durch Multiple Contraction."
        drift_adj = -0.025  # -2.5% p.a. Dämpfung

    # 2. Analysten-Forward-Wachstums-Kopplung
    if forward_eps_growth is not None:
        if forward_eps_growth > 30.0:
            # Starkes Gewinnwachstum stützt den Kurs
            drift_adj += 0.015
        elif forward_eps_growth > 10.0:
            drift_adj += 0.005
        elif forward_eps_growth < -10.0:
            drift_adj -= 0.015

    # 3. Analysten-Kursziel-Einfluss (Bayesian Shrinkage mit Haarschnitt gegen Analysten-Bias)
    if upside_pct is not None and opinions_count and opinions_count >= 8:
        # Konservativer Haarschnitt von 25% auf das Kursziel
        analyst_annual_impulse = (upside_pct / 100.0) / holding_years * 0.20
        drift_adj += float(np.clip(analyst_annual_impulse, -0.015, 0.020))

    # 4. Dividendenrendite als Renditeanker
    if div_yield is not None and div_yield > 0:
        div_rate = div_yield if div_yield < 0.20 else div_yield / 100.0
        drift_adj += min(0.012, div_rate * 0.35)

    drift_adj = float(np.clip(drift_adj, -0.04, 0.04))

    return {
        "is_etf": False,
        "valuation_status": status,
        "summary": summary,
        "metrics": metrics,
        "drift_adjustment": round(float(drift_adj), 4),
        "analyst_consensus": analyst_consensus
    }

