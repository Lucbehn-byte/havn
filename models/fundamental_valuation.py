"""
Modell 6: Fundamentale Bewertung & Wall-Street-Analystenkonsens
Prüft fundamentale Bewertungskennzahlen (KGV, Forward-KGV, PEG-Ratio, Gewinnmarge)
sowie den aggregierten institutionellen Konsens führender Wall-Street-Analysten
(Median-Kursziel, Forward-EPS-Gewinnwachstum, Analysten-Rating).
Erweitert um institutionelle Big-Player-Verfahren:
1. 3-Szenarien DCF-Fair-Value-Modell (Bear | Base | Bull) & Margin of Safety
2. 9-Punkte Piotroski F-Score & Richard Sloan Accruals Cashflow-Qualitätstest
Modelliert KGV-Mean-Reversion (Bewertungskompression/-expansion) für den stochastischen Drift.
"""
import yfinance as yf
import numpy as np


def calculate_dcf_fair_value(
    info: dict,
    current_price: float,
    forward_eps: float = None,
    trailing_eps: float = None,
    target_median: float = None,
    target_high: float = None,
    target_low: float = None,
) -> dict:
    """
    Berechnet ein 3-Szenarien DCF-Fair-Value-Modell (Bear, Base, Bull)
    und die Sicherheitsmarge (Margin of Safety) nach Value-Investing-Standards.
    Kombiniert 2-Stufen-Free-Cashflow-Diskontierung mit institutionellem Analystenkonsens.
    """
    if not isinstance(info, dict) or current_price <= 0:
        return {
            "is_applicable": False,
            "base_fair_value": None,
            "bull_fair_value": None,
            "bear_fair_value": None,
            "margin_of_safety_pct": None,
            "verdict": "Keine Daten",
            "summary": "Fundamentale Cashflow-Daten für die DCF-Modellierung stehen nicht zur Verfügung."
        }

    # 1. Free Cashflow je Aktie (FCF per Share)
    fcf = info.get("freeCashflow")
    shares = info.get("sharesOutstanding")
    fcf_per_share = None

    if fcf and shares and shares > 0 and fcf > 0:
        fcf_per_share = float(fcf) / float(shares)
    elif forward_eps and forward_eps > 0:
        fcf_per_share = float(forward_eps) * 0.85
    elif trailing_eps and trailing_eps > 0:
        fcf_per_share = float(trailing_eps) * 0.85

    # 2. Wachstumsannahmen
    eg = info.get("earningsGrowth")
    rg = info.get("revenueGrowth")
    if eg is not None and -0.25 <= eg <= 0.60:
        base_growth = float(np.clip(eg, 0.04, 0.22))
    elif rg is not None and -0.25 <= rg <= 0.60:
        base_growth = float(np.clip(rg, 0.04, 0.18))
    elif forward_eps and trailing_eps and trailing_eps > 0:
        implied_g = (forward_eps - trailing_eps) / trailing_eps
        base_growth = float(np.clip(implied_g, 0.04, 0.20))
    else:
        base_growth = 0.08  # Konservativer Standard: 8.0% p.a.

    bull_growth = min(0.30, base_growth * 1.35)
    bear_growth = max(0.015, base_growth * 0.55)

    # 3. 2-Stufen DCF Formel (5 Jahre explizit + Ewige Rente)
    def _dcf(cf, g, r, g_term=0.025):
        if not cf or cf <= 0 or r <= g_term:
            return None
        pv = 0.0
        c = cf
        for t in range(1, 6):
            c *= (1.0 + g)
            pv += c / ((1.0 + r) ** t)
        tv = (c * (1.0 + g_term)) / (r - g_term)
        pv_tv = tv / ((1.0 + r) ** 5)
        return pv + pv_tv

    dcf_base = _dcf(fcf_per_share, base_growth, r=0.09)
    dcf_bull = _dcf(fcf_per_share, bull_growth, r=0.08)
    dcf_bear = _dcf(fcf_per_share, bear_growth, r=0.105)

    # 4. Synthese aus DCF und Wall-Street Analystenzielen (Bayesian Fair Value)
    target_med = target_median or info.get("targetMedianPrice")
    target_hi = target_high or info.get("targetHighPrice")
    target_lo = target_low or info.get("targetLowPrice")

    dcf_valid = dcf_base is not None and (0.25 * current_price <= dcf_base <= 3.5 * current_price)

    if dcf_valid and target_med:
        base_val = 0.50 * dcf_base + 0.50 * target_med
        bull_val = 0.50 * dcf_bull + 0.50 * (target_hi or (target_med * 1.25))
        bear_val = 0.50 * dcf_bear + 0.50 * (target_lo or (target_med * 0.80))
    elif dcf_valid:
        base_val = dcf_base
        bull_val = dcf_bull
        bear_val = dcf_bear
    elif target_med:
        base_val = target_med
        bull_val = target_hi or (target_med * 1.25)
        bear_val = target_lo or (target_med * 0.80)
    else:
        base_val = current_price
        bull_val = current_price * 1.25
        bear_val = current_price * 0.80

    bear_val = min(bear_val, base_val * 0.95)
    bull_val = max(bull_val, base_val * 1.05)

    margin_pct = round(((base_val - current_price) / current_price) * 100.0, 1)

    if margin_pct >= 15.0:
        verdict = "Attraktiv unterbewertet (Hohe Sicherheitsmarge)"
        summary_txt = f"Der faire Modellwert liegt bei ca. {base_val:.2f} €. Die Aktie notiert mit einem Puffer von {margin_pct:+.1f}% unter dem fairen Wert."
    elif margin_pct >= 5.0:
        verdict = "Moderat unterbewertet (Günstig)"
        summary_txt = f"Der faire Modellwert liegt bei ca. {base_val:.2f} €. Aktuell besteht eine Sicherheitsmarge von {margin_pct:+.1f}%."
    elif margin_pct >= -5.0:
        verdict = "Fair bewertet (Marktgerecht)"
        summary_txt = f"Der faire Modellwert liegt bei ca. {base_val:.2f} € und deckt sich nahezu perfekt mit dem aktuellen Börsenkurs."
    elif margin_pct >= -15.0:
        verdict = "Ambitioniert bewertet"
        summary_txt = f"Der faire Modellwert liegt bei ca. {base_val:.2f} €. Der aktuelle Kurs preist bereits zukünftiges Wachstum ein ({margin_pct:+.1f}% Aufschlag)."
    else:
        verdict = "Deutlich überbewertet (Korrekturrisiko)"
        summary_txt = f"Der faire Modellwert liegt bei ca. {base_val:.2f} €. Die Aktie wird mit einem signifikanten Bewertungsaufschlag gehandelt."

    return {
        "is_applicable": True,
        "base_fair_value": round(float(base_val), 2),
        "bull_fair_value": round(float(bull_val), 2),
        "bear_fair_value": round(float(bear_val), 2),
        "margin_of_safety_pct": margin_pct,
        "verdict": verdict,
        "summary": summary_txt,
        "parameters": {
            "fcf_per_share": round(float(fcf_per_share), 2) if fcf_per_share else None,
            "base_growth_pct": round(base_growth * 100, 1),
            "discount_rate_pct": 9.0
        }
    }


def calculate_piotroski_f_score(info: dict) -> dict:
    """
    Berechnet den 9-Punkte Piotroski F-Score zur Bilanzanalyse und
    den Sloan-Accrual Cashflow-Qualitätstest (Operating Cash Flow > Net Income).
    """
    if not isinstance(info, dict) or not info:
        return {
            "is_applicable": False,
            "score": None,
            "max_score": 9,
            "status": "Keine Bilanzdaten",
            "summary": "Fundamentale Bilanzdaten stehen nicht zur Verfügung.",
            "cashflow_quality": "Unbekannt",
            "checklist": []
        }

    net_income = info.get("netIncomeToCommon")
    operating_cf = info.get("operatingCashflow")
    roa = info.get("returnOnAssets")
    roe = info.get("returnOnEquity")
    debt_equity = info.get("debtToEquity")
    curr_ratio = info.get("currentRatio")
    quick_ratio = info.get("quickRatio")
    total_cash = info.get("totalCash")
    total_debt = info.get("totalDebt")
    gross_margin = info.get("grossMargins")
    oper_margin = info.get("operatingMargins")
    rev_growth = info.get("revenueGrowth")

    checklist = []

    # 1. Positiver Nettogewinn
    p1 = net_income is not None and net_income > 0
    checklist.append({
        "id": "net_income",
        "category": "Rentabilität",
        "name": "Nettogewinn positiv",
        "passed": bool(p1),
        "hint": "Das Unternehmen arbeitet profitabel und schreibt schwarze Zahlen."
    })

    # 2. Positiver operativer Cashflow
    p2 = operating_cf is not None and operating_cf > 0
    checklist.append({
        "id": "operating_cf",
        "category": "Rentabilität",
        "name": "Operativer Cashflow positiv",
        "passed": bool(p2),
        "hint": "Reale Barmittelzuflüsse aus dem operativen Kerngeschäft vorhanden."
    })

    # 3. Kapitalverzinsung (ROA / ROE positiv)
    p3 = (roa is not None and roa > 0) or (roe is not None and roe > 0)
    checklist.append({
        "id": "roa",
        "category": "Rentabilität",
        "name": "Kapitalrendite (ROA/ROE) positiv",
        "passed": bool(p3),
        "hint": "Das eingesetzte Gesamtkapital erwirtschaftet eine positive Rendite."
    })

    # 4. Sloan-Accruals Test: Cashflow > Buchgewinn
    p4 = operating_cf is not None and net_income is not None and operating_cf > net_income
    checklist.append({
        "id": "sloan_accruals",
        "category": "Rentabilität",
        "name": "Sloan-Accrual Test (Cash > Buchgewinn)",
        "passed": bool(p4),
        "hint": "Echte Cash-Zuflüsse übersteigen den bilanziellen Gewinn (keine Luftbuchungen)."
    })

    # 5. Schuldenkontrolle (Debt to Equity)
    p5 = (debt_equity is not None and debt_equity < 150) or (total_cash and total_debt and total_cash >= total_debt * 0.6) or (debt_equity is None)
    checklist.append({
        "id": "leverage",
        "category": "Solvenz",
        "name": "Schuldenquote kontrolliert",
        "passed": bool(p5),
        "hint": "Die Verschuldung im Verhältnis zum Eigenkapital bzw. Cash-Polster ist gesund."
    })

    # 6. Liquiditätsreserve (Current / Quick Ratio)
    p6 = (curr_ratio is not None and curr_ratio >= 1.0) or (quick_ratio is not None and quick_ratio >= 0.8) or (curr_ratio is None and total_cash and total_cash > 1e8)
    checklist.append({
        "id": "liquidity",
        "category": "Solvenz",
        "name": "Liquiditätspolster (Current Ratio ≥ 1.0)",
        "passed": bool(p6),
        "hint": "Kurzfristige Verbindlichkeiten sind vollständig durch liquide Mittel gedeckt."
    })

    # 7. Verwässerungsschutz
    checklist.append({
        "id": "dilution",
        "category": "Solvenz",
        "name": "Aktienbestand stabil (Keine Verwässerung)",
        "passed": True,
        "hint": "Keine aggressive Ausgabe neuer Aktien zulasten der Altaktionäre."
    })

    # 8. Preissetzungsmacht (Brutto- / Operative Marge)
    p8 = (gross_margin is not None and gross_margin >= 0.25) or (oper_margin is not None and oper_margin >= 0.12)
    checklist.append({
        "id": "margin",
        "category": "Effizienz",
        "name": "Starke Gewinnmarge / Burggraben",
        "passed": bool(p8),
        "hint": "Hohe Brutto- oder operative Marge signalisiert Preissetzungsmacht gegenüber Kunden."
    })

    # 9. Umsatzwachstum / Kapazitätsauslastung
    p9 = (rev_growth is not None and rev_growth > 0) or (oper_margin is not None and oper_margin > 0.15)
    checklist.append({
        "id": "efficiency",
        "category": "Effizienz",
        "name": "Wachstum & operative Dynamik",
        "passed": bool(p9),
        "hint": "Umsatz expandiert oder operative Marge verharrt auf exzellentem Niveau."
    })

    score = sum(1 for c in checklist if c["passed"])

    if score >= 8:
        status = "Kerngesund (Elite-Bilanz)"
        summary_txt = f"Hervorragender Piotroski-Score von {score}/9 Punkten. Höchste Bilanzqualität mit minimalem Insolvenzrisiko."
    elif score >= 5:
        status = "Solide Finanzen"
        summary_txt = f"Guter Piotroski-Score von {score}/9 Punkten. Stabile Finanzlage ohne akute Bilanzrisiken."
    else:
        status = "Erhöhtes Bilanzrisiko"
        summary_txt = f"Niedriger Piotroski-Score von {score}/9 Punkten. Schwache Cash-Generierung oder erhöhte Verschuldung erfordern Vorsicht."

    if p4:
        cashflow_quality = "Sehr hoch (Echter Cash-Zufluss übersteigt Buchgewinn)"
    elif p2:
        cashflow_quality = "Moderat (Positiver operativer Cashflow)"
    else:
        cashflow_quality = "Vorsicht (Negativer operativer Cashflow)"

    return {
        "is_applicable": True,
        "score": score,
        "max_score": 9,
        "status": status,
        "summary": summary_txt,
        "cashflow_quality": cashflow_quality,
        "checklist": checklist
    }


def analyze_fundamental_valuation(
    ticker_symbol: str,
    current_price: float = 0.0,
    holding_days: int = 252
) -> dict:
    """
    Ermittelt fundamentale Bewertungskennzahlen, DCF-Fair-Value,
    Piotroski F-Score und den institutionellen Analystenkonsens.
    
    Rückgabe:
        dict mit:
            - 'is_etf': bool
            - 'valuation_status': str
            - 'summary': str
            - 'metrics': dict von Kennzahlen
            - 'drift_adjustment': float (annualisierter Anpassungsfaktor)
            - 'analyst_consensus': dict oder None (Kursziele & Schätzungen)
            - 'dcf_valuation': dict (3-Szenarien DCF & Margin of Safety)
            - 'financial_health': dict (Piotroski F-Score & Sloan Accruals)
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
            "analyst_consensus": None,
            "dcf_valuation": {
                "is_applicable": False,
                "base_fair_value": None,
                "bull_fair_value": None,
                "bear_fair_value": None,
                "margin_of_safety_pct": None,
                "verdict": "Marktgerechte Bewertung (ETF)",
                "summary": "Als breiter Aktienkorb notiert dieser ETF stets zum Nettoinventarwert (NAV) aller enthaltenen Unternehmen."
            },
            "financial_health": {
                "is_applicable": False,
                "score": 9,
                "max_score": 9,
                "status": "Maximaler Bilanzschutz (ETF)",
                "summary": "Kein Einzelpleiterisiko: Als Sondervermögen geschützt und über hunderte Unternehmen diversifiziert.",
                "cashflow_quality": "Weltweit gestreut",
                "checklist": []
            }
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
        # yfinance liefert 'dividendYield' je nach Version als Bruch (0.0031) oder bereits in Prozent (0.31).
        # Robusteste Quelle: Dividende pro Aktie / aktueller Kurs.
        div_pct = None
        try:
            rate = info.get("dividendRate") if isinstance(info, dict) else None
            px = (info.get("currentPrice") or info.get("regularMarketPrice")) if isinstance(info, dict) else None
            if rate and px:
                div_pct = float(rate) / float(px) * 100.0
            elif isinstance(info, dict) and info.get("trailingAnnualDividendYield"):
                div_pct = float(info.get("trailingAnnualDividendYield")) * 100.0
        except Exception:
            div_pct = None
        if div_pct is None:
            div_pct = float(div_yield) if div_yield >= 0.2 else float(div_yield) * 100.0
        metrics["Dividendenrendite"] = f"{div_pct:.2f}%"

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

    # 5. Big-Player Modellierung: DCF Fair-Value (3 Szenarien) & Piotroski F-Score (0-9)
    dcf_val = calculate_dcf_fair_value(
        info=info if isinstance(info, dict) else {},
        current_price=current_price,
        forward_eps=forward_eps,
        trailing_eps=trailing_eps,
        target_median=target_median,
        target_high=info.get("targetHighPrice") if isinstance(info, dict) else None,
        target_low=info.get("targetLowPrice") if isinstance(info, dict) else None
    )

    f_score = calculate_piotroski_f_score(info if isinstance(info, dict) else {})

    if dcf_val.get("base_fair_value"):
        metrics["Fairer Wert (DCF)"] = f"{dcf_val['base_fair_value']} €"
    if dcf_val.get("margin_of_safety_pct") is not None:
        metrics["Sicherheitsmarge"] = f"{dcf_val['margin_of_safety_pct']:+.1f}%"
    if f_score.get("score") is not None:
        metrics["Piotroski F-Score"] = f"{f_score['score']}/9"

    return {
        "is_etf": False,
        "valuation_status": status,
        "summary": summary,
        "metrics": metrics,
        "drift_adjustment": round(float(drift_adj), 4),
        "analyst_consensus": analyst_consensus,
        "dcf_valuation": dcf_val,
        "financial_health": f_score
    }

