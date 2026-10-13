"""
Modell 4: Empirische Rollierende Renditen & Historische Gewinnwahrscheinlichkeit
Berechnet für beliebige historische Einstiegszeitpunkte, wie viel Prozent der Anleger
nach der gewählten Haltedauer im Gewinn lagen (ohne theoretische Verteilungsannahmen).
"""
import pandas as pd
import numpy as np


def calculate_rolling_returns(close_series: pd.Series, holding_days: int) -> dict:
    """
    Berechnet die historische Gewinnquote bei einer Haltedauer von `holding_days` Tagen.
    
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

    # Rollierende Rendite für jeden historischen Handelstag: (Kurs nach Haltedauer - Startkurs) / Startkurs
    rolling_returns = (close_series.shift(-holding_days) - close_series) / close_series
    valid_returns = (rolling_returns.dropna() * 100).to_numpy()

    if len(valid_returns) == 0:
        return {
            "win_rate_pct": None,
            "num_periods": 0,
            "summary": "Keine validen Zeiträume berechenbar."
        }

    total_count = len(valid_returns)
    positive_count = int(np.sum(valid_returns > 0))
    win_rate = round((positive_count / total_count) * 100, 1)
    avg_return = round(float(np.mean(valid_returns)), 1)
    best_return = round(float(np.max(valid_returns)), 1)
    worst_return = round(float(np.min(valid_returns)), 1)

    # Laien-Zusammenfassung
    if win_rate >= 85:
        verdict = f"Hervorragende historische Sicherheit: Zu {win_rate}% war man nach diesem Zeitraum im Gewinn."
    elif win_rate >= 65:
        verdict = f"Gute Chancen: Zu {win_rate}% lag ein Investment im Plus, kurzfristige Schwankungen traten jedoch auf."
    else:
        verdict = f"Erhöhtes Risiko: Bei dieser Haltedauer lag die historische Gewinnquote bei {win_rate}%. Eine längere Haltedauer erhöht die Wahrscheinlichkeit deutlich."

    return {
        "win_rate_pct": win_rate,
        "avg_return_pct": avg_return,
        "best_period_pct": best_return,
        "worst_period_pct": worst_return,
        "num_periods": total_count,
        "summary": verdict
    }
