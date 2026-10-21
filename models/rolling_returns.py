"""
Modell 4: Empirische Rollierende Renditen & Historische Gewinnwahrscheinlichkeit
Berechnet für alle historischen Einstiegszeitpunkte, wie viel Prozent der Anleger
nach der gewählten Haltedauer im Gewinn lagen – sowohl für Einmalanlagen als auch
für monatliche/wöchentliche Sparpläne (DCA - Dollar Cost Averaging).
"""
import pandas as pd
import numpy as np


def calculate_rolling_returns(
    close_series: pd.Series,
    holding_days: int,
    investment_type: str = "Einmalanlage",
    sparplan_frequenz: str = "monatlich",
    kapital: float = 1000.0,
    startkapital: float = 0.0
) -> dict:
    """
    Berechnet die historische Gewinnquote bei einer Haltedauer von `holding_days` Tagen.
    Berücksichtigt bei Sparplan-Auswahl echte historische Sparplan-Kohorten (Cost-Average-Effekt).
    
    Rückgabe:
        dict mit:
            - 'win_rate_pct': float (Prozentsatz historisch positiver Haltedauern)
            - 'avg_return_pct': float (Durchschnittliche Rendite)
            - 'best_period_pct': float (Bester historischer Zeitraum)
            - 'worst_period_pct': float (Schlechtester historischer Zeitraum)
            - 'num_periods': int (Anzahl überprüfter Zeiträume)
            - 'summary': str (Laienverständliche Deutung)
    """
    if len(close_series) <= holding_days + 10:
        return {
            "win_rate_pct": None,
            "avg_return_pct": None,
            "best_period_pct": None,
            "worst_period_pct": None,
            "num_periods": 0,
            "summary": "Die Kurshistorie ist kürzer als die gewählte Haltedauer."
        }

    prices = close_series.dropna().to_numpy()
    n_prices = len(prices)

    if investment_type == "Sparplan" and holding_days >= 20:
        # Echte historische Sparplan-Kohorten (monatlich / wöchentlich)
        interval = 5 if sparplan_frequenz == "wöchentlich" else 21
        m_deposits = max(1, holding_days // interval)
        cohorts = n_prices - holding_days

        if cohorts <= 0:
            return {
                "win_rate_pct": None,
                "num_periods": 0,
                "summary": "Keine validen Sparplan-Zeiträume vorhanden."
            }

        # Vektorisierte Matrix-Berechnung aller Sparplan-Startzeitpunkte
        indices = np.arange(cohorts)[:, None] + (np.arange(m_deposits)[None, :] * interval)
        purchase_prices = prices[indices]
        
        reg_shares = np.sum(kapital / purchase_prices, axis=1)
        init_shares = (startkapital / prices[:cohorts]) if startkapital > 0 else 0.0
        total_shares = reg_shares + init_shares

        end_prices = prices[holding_days:]
        portfolio_values = total_shares * end_prices
        total_invested = startkapital + (m_deposits * kapital)
        
        valid_returns = ((portfolio_values - total_invested) / total_invested) * 100.0
    else:
        # Klassische Einmalanlage: (Kurs nach Haltedauer - Startkurs) / Startkurs
        rolling_returns = (close_series.shift(-holding_days) - close_series) / close_series
        valid_returns = (rolling_returns.dropna() * 100).to_numpy()

    if len(valid_returns) == 0:
        return {
            "win_rate_pct": None,
            "num_periods": 0,
            "summary": "Keine validen Zeiträume berechenbar."
        }

    total_count = len(valid_returns)
    positive_count = int(np.sum(valid_returns > 0.0))
    win_rate = round((positive_count / total_count) * 100, 1)
    avg_return = round(float(np.mean(valid_returns)), 1)
    best_return = round(float(np.max(valid_returns)), 1)
    worst_return = round(float(np.min(valid_returns)), 1)

    typ_desc = "kontinuierlicher Sparplan" if investment_type == "Sparplan" else "Einmalkauf"

    # Laien-Zusammenfassung
    if win_rate >= 85:
        verdict = f"Hervorragende historische Sicherheit: Zu {win_rate}% lag ein {typ_desc} nach diesem Zeitraum im Gewinn (Ø Ertrag: {avg_return:+g}%)."
    elif win_rate >= 65:
        verdict = f"Gute Chancen: Zu {win_rate}% lag ein {typ_desc} im Plus (Ø Ertrag: {avg_return:+g}%), zwischenzeitliche Schwankungen traten jedoch auf."
    else:
        verdict = f"Erhöhtes Risiko: Bei dieser Haltedauer lag die historische Gewinnquote bei {win_rate}% (Ø Ertrag: {avg_return:+g}%). Eine längere Haltedauer glättet das Risiko."

    return {
        "win_rate_pct": win_rate,
        "avg_return_pct": avg_return,
        "best_period_pct": best_return,
        "worst_period_pct": worst_return,
        "num_periods": total_count,
        "summary": verdict
    }

