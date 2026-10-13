"""
Modell 5: Kausaler Backtest der Modell-Trefferquote
Prüft für vergangene Handelstage, ob das Signal der Chartindikatoren
tatsächlich zu einer profitablen Kursentwicklung über die gewählte Haltedauer führte.
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
    Führt einen kausalen Backtest durch.
    
    Rückgabe:
        dict mit:
            - 'hit_rate_pct': float oder None
            - 'sample_size': int
            - 'period_label': str
            - 'status_text': str
    """
    if hist_score_series is None or len(hist_score_series) < holding_days + 30:
        return {
            "hit_rate_pct": None,
            "sample_size": 0,
            "period_label": history_label,
            "status_text": "Nicht genügend historische Daten für einen verlässlichen Backtest."
        }

    # Zukünftige Rendite nach holding_days Handelstagen berechnen
    forward_return = ((close_series.shift(-holding_days) / close_series) - 1.0) * 100.0

    scores = hist_score_series.to_numpy()
    returns = forward_return.to_numpy()
    valid_mask = ~np.isnan(scores) & ~np.isnan(returns)

    threshold_up = 0.5 if holding_days <= 10 else 3.0
    threshold_down = -0.5 if holding_days <= 10 else -3.0

    actual_dir = np.where(returns > threshold_up, 1, np.where(returns < threshold_down, -1, 0))
    predicted_dir = np.where(scores > 5.0, 1, np.where(scores < -5.0, -1, 0))

    meaningful = valid_mask & (actual_dir != 0) & (predicted_dir != 0)

    # Vergleichbare Marktsituationen mit ähnlichem Score suchen
    current_score_val = current_score / 100.0
    scores_norm = scores / 100.0
    
    similar_mask = meaningful
    n_samples = int(meaningful.sum())

    for tol in (0.05, 0.10, 0.15, 0.25, 0.35):
        candidate = meaningful & (np.abs(scores_norm - current_score_val) <= tol)
        candidate_n = int(candidate.sum())
        if candidate_n >= 20:
            similar_mask, n_samples = candidate, candidate_n
            break

    if n_samples < 5:
        return {
            "hit_rate_pct": None,
            "sample_size": n_samples,
            "period_label": history_label,
            "status_text": "Zu wenige vergleichbare historische Signalphasen gefunden."
        }

    correct_predictions = int((predicted_dir[similar_mask] == actual_dir[similar_mask]).sum())
    hit_rate = round((correct_predictions / n_samples) * 100.0, 1)

    return {
        "hit_rate_pct": hit_rate,
        "sample_size": n_samples,
        "period_label": history_label,
        "status_text": f"Das Modell lag in {hit_rate}% von {n_samples} vergleichbaren historischen Situationen richtig."
    }
