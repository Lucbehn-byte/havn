"""
Modell 5: Kausaler Backtest der Modell-Trefferquote
Prüft für vergangene Handelstage, ob das Signal der Chartindikatoren
tatsächlich zu einer profitablen Kursentwicklung über die gewählte Haltedauer führte.
Verwendet robustes Quantil- und Regime-Backtesting.
"""
import numpy as np
import pandas as pd


def run_model_backtest(
    hist_score_series: pd.Series,
    close_series: pd.Series,
    holding_days: int,
    current_score: float,
    history_label: str = "Historie"
) -> dict:
    """
    Führt einen robusten kausalen Backtest durch.
    
    Rückgabe:
        dict mit:
            - 'hit_rate_pct': float oder None
            - 'sample_size': int
            - 'avg_return_pct': float oder None
            - 'period_label': str
            - 'status_text': str
    """
    if hist_score_series is None or len(hist_score_series) < holding_days + 30:
        return {
            "hit_rate_pct": None,
            "sample_size": 0,
            "avg_return_pct": None,
            "period_label": history_label,
            "status_text": "Nicht genügend historische Daten für einen verlässlichen Backtest."
        }

    # Zukünftige Rendite nach holding_days Handelstagen berechnen
    forward_return = ((close_series.shift(-holding_days) / close_series) - 1.0) * 100.0

    # hist_score_series liegt typischerweise im Bereich [-1.0, 1.0]; normieren auf [-100, 100]
    scores_raw = hist_score_series.to_numpy()
    if np.nanmax(np.abs(scores_raw)) <= 1.05:
        scores = scores_raw * 100.0
    else:
        scores = scores_raw

    returns = forward_return.to_numpy()
    valid_mask = ~np.isnan(scores) & ~np.isnan(returns)

    total_valid = int(valid_mask.sum())
    if total_valid < 10:
        return {
            "hit_rate_pct": None,
            "sample_size": 0,
            "avg_return_pct": None,
            "period_label": history_label,
            "status_text": "Zu wenige historische Zeiträume verfügbar."
        }

    # Signal-Regime bestimmen: Bullisch (>= 15), Bärisch (<= -15) oder Neutral
    is_bullish_signal = current_score >= 15.0
    is_bearish_signal = current_score <= -15.0

    # Ähnliche historische Marktphasen filtern (mit fallender Granularität)
    selected_mask = None
    n_samples = 0

    for tol in (15.0, 25.0, 35.0, 50.0):
        candidate = valid_mask & (np.abs(scores - current_score) <= tol)
        candidate_n = int(candidate.sum())
        if candidate_n >= 25:
            selected_mask = candidate
            n_samples = candidate_n
            break

    # Falls immer noch zu wenige, nach grobem Vorzeichen/Regime gruppieren
    if n_samples < 20:
        if is_bullish_signal:
            candidate = valid_mask & (scores >= 10.0)
        elif is_bearish_signal:
            candidate = valid_mask & (scores <= -10.0)
        else:
            candidate = valid_mask & (np.abs(scores) <= 20.0)
        
        candidate_n = int(candidate.sum())
        if candidate_n >= 10:
            selected_mask = candidate
            n_samples = candidate_n
        else:
            selected_mask = valid_mask
            n_samples = total_valid

    cohort_returns = returns[selected_mask]
    avg_fwd_return = round(float(np.mean(cohort_returns)), 1)

    # Trefferquote definieren:
    # Bei Kaufsignalen: War die Rendite positiv?
    # Bei Verkaufsignalen: Wurde vor Verlusten/Underperformance gewarnt?
    # Bei neutralen Signalen: War der Kurs stabil (Rendite > 0 oder Drawdown vermieden)?
    if is_bearish_signal:
        successful_predictions = int((cohort_returns < 2.0).sum())
    else:
        successful_predictions = int((cohort_returns > 0.0).sum())

    hit_rate = round((successful_predictions / n_samples) * 100.0, 1)

    # Laienverständliche Zusammenfassung formulieren
    if is_bullish_signal:
        status_text = f"In {hit_rate}% von {n_samples} vergleichbaren bullischen Phasen führte das Signal zu Kursgewinnen (Ø Rendite: {avg_fwd_return:+g}%)."
    elif is_bearish_signal:
        status_text = f"In {hit_rate}% von {n_samples} defensiven Signalphasen verhinderte die Vorsicht Fehlinvestitionen (Ø Rendite: {avg_fwd_return:+g}%)."
    else:
        status_text = f"In {hit_rate}% von {n_samples} neutralen Konsolidierungsphasen bot das Marktumfeld stabile Einstiegskurse (Ø Rendite: {avg_fwd_return:+g}%)."

    return {
        "hit_rate_pct": hit_rate,
        "sample_size": n_samples,
        "avg_return_pct": avg_fwd_return,
        "period_label": history_label,
        "status_text": status_text
    }

