"""
Modell 6: Fundamentale Bewertung & Kennzahlen-Check
Prüft fundamentale Bewertungskennzahlen wie KGV (P/E), PEG-Ratio,
Gewinnwachstum und Dividendenrendite zur Erkennung von Übertreibungen oder Schnäppchen.
Liefert zusätzlich einen fundierten jährlichen Drift-Anpassungsfaktor für die Monte-Carlo-Simulation.
"""
import yfinance as yf


def analyze_fundamental_valuation(ticker_symbol: str) -> dict:
    """
    Ermittelt fundamentale Bewertungskennzahlen für Aktien und ETFs.
    
    Rückgabe:
        dict mit:
            - 'is_etf': bool
            - 'valuation_status': str (z. B. 'Günstig', 'Fair', 'Ambitioniert/Teuer')
            - 'summary': str (Laienverständliche Erklärung)
            - 'metrics': dict von Kennzahlen
            - 'drift_adjustment': float (annualisierter Anpassungsfaktor, z.B. -0.015 = -1.5% p.a.)
    """
    clean_ticker = ticker_symbol.upper().strip()
    info = {}
    try:
        t = yf.Ticker(clean_ticker)
        # fast_info ist viel stabiler und benötigt keinen Crumb
        fast = getattr(t, "fast_info", None)
        try:
            info = t.info or {}
        except Exception:
            info = {}
    except Exception:
        info = {}

    quote_type = info.get("quoteType", "")
    is_etf = quote_type == "ETF" or "ETF" in info.get("shortName", "")

    metrics = {}
    drift_adj = 0.0
    
    if is_etf:
        # ETF-spezifische Kennzahlen
        ter = info.get("totalExpenseRatio") or info.get("expenseRatio") or 0.002
        div_yield = info.get("yield") or info.get("trailingAnnualDividendYield")
        net_assets = info.get("totalAssets") or info.get("netAssets")

        ter_val = float(ter) if ter is not None else 0.002
        if ter_val < 1:
            metrics["Laufende Kosten (TER)"] = f"{ter_val * 100:.2f}% p.a."
            drift_adj -= ter_val  # Kostenquote reduziert den Nettodrift minimal
        else:
            metrics["Laufende Kosten (TER)"] = f"{ter_val:.2f}% p.a."

        if div_yield is not None:
            metrics["Ausschüttungsrendite"] = f"{div_yield * 100:.2f}%" if div_yield < 1 else f"{div_yield:.2f}%"
        else:
            metrics["Ausschüttungsrendite"] = "Thesaurierend / Variabel"

        if net_assets:
            metrics["Fondsvolumen"] = f"{net_assets / 1e9:.2f} Mrd. €"

        return {
            "is_etf": True,
            "valuation_status": "Breit diversifiziert (ETF)",
            "summary": "Als Korb aus vielen hundert Einzeltiteln unterliegt dieser ETF keinem individuellen Pleite- oder Bewertungsrisiko einer einzelnen Firma.",
            "metrics": metrics,
            "drift_adjustment": round(drift_adj, 4)
        }

    # Aktien-Bewertung
    pe = info.get("trailingPE")
    forward_pe = info.get("forwardPE")
    peg = info.get("pegRatio")
    rev_growth = info.get("revenueGrowth")
    profit_margin = info.get("profitMargins")
    div_yield = info.get("dividendYield")

    if pe is not None:
        metrics["KGV (Aktuell)"] = f"{pe:.1f}"
    if forward_pe is not None:
        metrics["Forward-KGV (Erwartet)"] = f"{forward_pe:.1f}"
    if peg is not None:
        metrics["PEG-Ratio"] = f"{peg:.2f}"
    if rev_growth is not None:
        metrics["Umsatzwachstum"] = f"{rev_growth * 100:+.1f}%"
    if profit_margin is not None:
        metrics["Gewinnmarge"] = f"{profit_margin * 100:.1f}%"
    if div_yield is not None:
        metrics["Dividendenrendite"] = f"{div_yield * 100:.2f}%" if div_yield < 1 else f"{div_yield:.2f}%"

    # Laien-Bewertung & Drift-Justierung ableiten
    if pe is None:
        status = "Wachstumsphase / Keine KGV-Daten"
        summary = "Für dieses Unternehmen liegt aktuell kein Standard-KGV vor (häufig bei jungen Wachstumsunternehmen oder Turnaround-Kandidaten)."
        drift_adj = 0.0
    elif pe < 15:
        status = "Günstig bewertet"
        summary = f"Mit einem KGV von {pe:.1f} ist die Aktie historisch und im Marktvergleich günstig bewertet. Geringeres Rückschlagpotenzial durch hohe Gewinne."
        drift_adj = +0.015  # +1.5% p.a. Rückenwind durch Bewertungsmultiplikator
    elif pe <= 32:
        status = "Fair bis moderat bewertet"
        summary = f"Ein KGV von {pe:.1f} spiegelt ein solides, marktübliches Bewertungsniveau für etablierte Qualitätsunternehmen wider."
        drift_adj = 0.0
    elif pe <= 50:
        status = "Ambitioniert bewertet"
        summary = f"Ein KGV von {pe:.1f} ist sportlich bewertet. Die Börse erwartet hohes zukünftiges Wachstum. Bei Enttäuschungen drohen Korrekturen."
        drift_adj = -0.012  # -1.2% p.a. Dämpfung durch Multiple-Normalisierung
    else:
        status = "Sehr teuer / Hype-Bewertung"
        summary = f"Ein KGV von {pe:.1f} signalisiert eine extreme Bewertung. Langfristig droht Gegenwind durch Normalisierung der Multiples (Multiple Contraction)."
        drift_adj = -0.022  # -2.2% p.a. Dämpfung

    # Dividendenrendite als Renditestütze berücksichtigen
    if div_yield is not None and div_yield > 0:
        div_rate = div_yield if div_yield < 0.20 else div_yield / 100.0
        drift_adj += min(0.01, div_rate * 0.3)

    return {
        "is_etf": False,
        "valuation_status": status,
        "summary": summary,
        "metrics": metrics,
        "drift_adjustment": round(float(drift_adj), 4)
    }
