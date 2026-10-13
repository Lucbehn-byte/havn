"""
Modell 3: Stochastische Monte-Carlo-Simulation (Quant-Präzisionsversion)
Umfasst:
- EWMA-Volatilität (RiskMetrics-Standard, Volatility Clustering)
- Empirisch kalibrierte Merton Jump-Diffusion (Asset-spezifische Schocks)
- CAPM & James-Stein Drift-Shrinkage (Schutz vor Hype-Verzerrungen über 1-5 Jahre)
- Fundamentale Bewertungskopplung (KGV-Multiple-Anpassung)
- Echte Sparplan-DCA-Simulation
- Schutzkennzahlen: Sortino-Ratio & Conditional Value at Risk (CVaR 95% / Expected Shortfall)
"""
import numpy as np
import pandas as pd


def calibrate_merton_jumps(log_returns: pd.Series) -> tuple[float, float, float]:
    """
    Kalibriert die Schock-Parameter (Lambda, Mu_J, Sigma_J) empirisch
    anhand der tatsächlichen extremen Ausreißertage (> 3 Sigma) der Aktie/des ETFs.
    """
    n = len(log_returns)
    if n < 60:
        return 0.40, -0.04, 0.06

    daily_std = float(log_returns.std())
    daily_mean = float(log_returns.mean())
    if daily_std <= 1e-6:
        return 0.20, -0.03, 0.05

    # 3-Sigma-Ausreißer identifizieren
    z_scores = (log_returns - daily_mean) / daily_std
    jump_mask = np.abs(z_scores) > 3.0
    jump_returns = log_returns[jump_mask].to_numpy()
    num_jumps = len(jump_returns)

    years = n / 252.0
    # Annualisierte Schockfrequenz: typisch 0.1 bis 2.5 Schocks pro Jahr
    lam = float(np.clip(num_jumps / max(0.5, years), 0.10, 2.50))

    if num_jumps >= 3:
        # Mittlere Schockhöhe (überwiegend negativ durch Panikverkäufe)
        mu_j = float(np.clip(np.mean(jump_returns), -0.15, -0.01))
        sigma_j = float(np.clip(np.std(jump_returns), 0.03, 0.15))
    else:
        mu_j = -0.04
        sigma_j = 0.06

    return lam, mu_j, sigma_j


def calculate_ewma_volatility(log_returns: pd.Series, lambda_decay: float = 0.94) -> tuple[float, float]:
    """
    Berechnet die tagesaktuelle EWMA-Volatilität (RiskMetrics) sowie die langfristige historische Volatilität.
    Gibt (ewma_vol_annual, hist_vol_annual) zurück.
    """
    hist_vol = float(log_returns.std()) * np.sqrt(252.0)
    
    # Exponentiell gewichtete Varianz
    ewma_var = log_returns.ewm(alpha=1.0 - lambda_decay).var().iloc[-1]
    if np.isnan(ewma_var) or ewma_var <= 0:
        ewma_vol = hist_vol
    else:
        ewma_vol = float(np.sqrt(ewma_var * 252.0))
        
    return ewma_vol, hist_vol


def run_monte_carlo_simulation(
    current_price: float,
    log_returns: pd.Series,
    holding_days: int,
    chart_score: float = 0.0,
    investment_type: str = "Einmalanlage",
    sparplan_frequenz: str = "monatlich",
    kapital: float = 1000.0,
    anzahl_monate: float = 12.0,
    num_simulations: int = 5000,
    sample_size_viz: int = 40,
    valuation_drift_adj: float = 0.0,
    beta: float = 1.0
) -> dict:
    """
    Führt die mathematisch geschärfte Monte-Carlo-Simulation durch.
    """
    dt = 1 / 252.0

    # 1. EWMA & Langfrist-Volatilität mit Mean-Reversion kombinieren
    ewma_vol, hist_vol = calculate_ewma_volatility(log_returns)
    # Volatilitäts-Gewichtung: Bei kurzen Zeithorizonten dominiert EWMA, bei langen Horizonten Mean-Reversion zur Langzeitvola
    vol_half_life_days = 126.0  # ca. 6 Monate Halbwertszeit
    w_ewma = np.exp(-holding_days / vol_half_life_days)
    sigma = float(w_ewma * ewma_vol + (1.0 - w_ewma) * hist_vol)
    sigma = max(0.05, min(0.90, sigma))  # Plausible Grenzen 5% bis 90% p.a.

    # 2. CAPM & Drift-Shrinkage gegen Hype-Verzerrung
    raw_hist_mu = float(log_returns.mean()) / dt
    
    # CAPM-Gleichgewichtsrendite: r_f (3%) + Beta * Marktrisikoprämie (5.5%)
    r_f = 0.03
    mkt_equity_risk_premium = 0.055
    capm_mu = r_f + beta * mkt_equity_risk_premium

    # Shrinkage: Je länger die Haltedauer (z. B. 3-5 Jahre), desto stärker wird an CAPM angeglichen
    # Bei 10 Tagen: 95% historische Eigendynamik. Bei 5 Jahren: 70% CAPM-Gleichgewicht.
    shrinkage_factor = min(0.70, (holding_days / 1260.0) * 0.70)
    shrunk_mu = (1.0 - shrinkage_factor) * raw_hist_mu + shrinkage_factor * capm_mu

    # Chart-Score-Einfluss (dämpft sich mit zunehmender Haltedauer ab)
    timeframe_dampening = np.exp(-holding_days / 252.0)
    chart_drift_adj = (chart_score / 100.0) * 0.03 * timeframe_dampening

    # Gesamter justierter Drift
    mu = shrunk_mu + chart_drift_adj + valuation_drift_adj
    # Plausible Schranken: Selbst Spitzenwerte werden auf max +22% p.a. gedämpft
    mu = float(np.clip(mu, -0.15, 0.22))

    # 3. Empirisch kalibrierte Merton Jump-Diffusion
    lam, mu_j, sigma_j = calibrate_merton_jumps(log_returns)
    k_comp = np.exp(mu_j + 0.5 * sigma_j**2) - 1.0  # Martingal-Kompensator

    # 4. Simulation von 5.000 Pfaden
    Z = np.random.standard_normal((holding_days, num_simulations))
    N_jumps = np.random.poisson(lam * dt, size=(holding_days, num_simulations))
    J_shocks = np.random.normal(mu_j, sigma_j, size=(holding_days, num_simulations))

    daily_drift = (mu - 0.5 * sigma**2 - lam * k_comp) * dt
    daily_diffusion = sigma * np.sqrt(dt) * Z + (N_jumps * J_shocks)
    daily_returns = np.exp(daily_drift + daily_diffusion)

    price_paths = np.zeros((holding_days + 1, num_simulations))
    price_paths[0] = current_price
    price_paths[1:] = current_price * np.cumprod(daily_returns, axis=0)

    # 5. Portfolio-Auswertung
    if investment_type == "Einmalanlage":
        eingezahltes_kapital = float(kapital)
        final_prices = price_paths[-1]
        simulated_portfolio_values = (final_prices / current_price) * eingezahltes_kapital
        returns_pct = ((simulated_portfolio_values - eingezahltes_kapital) / eingezahltes_kapital) * 100.0

    else:
        # ECHTE SPARPLAN-SIMULATION (Cost-Average-Effekt)
        if sparplan_frequenz == "wöchentlich":
            interval_days = 5
            anzahl_einzahlungen = max(1, int(holding_days / interval_days))
        else:
            interval_days = 21
            anzahl_einzahlungen = max(1, int(holding_days / interval_days))

        eingezahltes_kapital = float(anzahl_einzahlungen * kapital)
        accumulated_shares = np.zeros(num_simulations)
        
        for k in range(anzahl_einzahlungen):
            day_idx = min(holding_days, k * interval_days)
            purchase_prices = price_paths[day_idx]
            accumulated_shares += kapital / purchase_prices

        simulated_portfolio_values = accumulated_shares * price_paths[-1]
        returns_pct = ((simulated_portfolio_values - eingezahltes_kapital) / eingezahltes_kapital) * 100.0

    # 6. Wahrscheinlichkeiten & Perzentile
    prob_up = float(np.mean(returns_pct > 1.0) * 100.0)
    prob_down = float(np.mean(returns_pct < -1.0) * 100.0)
    prob_flat = float(max(0.0, 100.0 - prob_up - prob_down))

    median_endwert = float(np.percentile(simulated_portfolio_values, 50))
    pessimistisch_endwert = float(np.percentile(simulated_portfolio_values, 10))
    optimistisch_endwert = float(np.percentile(simulated_portfolio_values, 90))

    expected_return_pct = float(np.median(returns_pct))
    erwarteter_gewinn = median_endwert - eingezahltes_kapital

    # 7. NEUE SCHUTZKENNZAHLEN: Sortino-Ratio & CVaR 95% (Expected Shortfall)
    # Downside-Deviation: Berechnet die Streuung ausschließlich für Verlustpfade (< 0%)
    negative_returns = np.minimum(returns_pct, 0.0)
    downside_dev = float(np.sqrt(np.mean(negative_returns**2)))
    
    # Sortino-Ratio: Verhältnis von Rendite zur echten Verluststreuung
    if downside_dev > 0.01:
        sortino = round(float(expected_return_pct / downside_dev), 2)
    else:
        sortino = 5.0  # Bei fast gar keinen Verlustpfaden (z. B. 10 Jahre MSCI World)

    # CVaR 95% (Expected Shortfall): Der durchschnittliche Verlust in den schlimmsten 5% der Pfade
    var_95_cutoff = float(np.percentile(returns_pct, 5))
    worst_5_pct_returns = returns_pct[returns_pct <= var_95_cutoff]
    cvar_95_pct = float(np.mean(worst_5_pct_returns)) if len(worst_5_pct_returns) > 0 else var_95_cutoff
    cvar_95_euro = eingezahltes_kapital * (abs(cvar_95_pct) / 100.0) if cvar_95_pct < 0 else 0.0

    # 8. Repräsentative Stichproben für Plotly-Visualisierung
    n_samples = min(sample_size_viz, num_simulations)
    sample_indices = np.random.choice(num_simulations, size=n_samples, replace=False)
    sample_paths = price_paths[:, sample_indices].T.tolist()
    median_path = np.median(price_paths, axis=1).tolist()

    return {
        "prob_up": round(prob_up, 1),
        "prob_flat": round(prob_flat, 1),
        "prob_down": round(prob_down, 1),
        "expected_return_pct": round(expected_return_pct, 2),
        "eingezahltes_kapital": round(eingezahltes_kapital, 2),
        "erwarteter_endwert": round(median_endwert, 2),
        "erwarteter_gewinn": round(erwarteter_gewinn, 2),
        "pessimistisch_endwert": round(pessimistisch_endwert, 2),
        "optimistisch_endwert": round(optimistisch_endwert, 2),
        "sample_paths": sample_paths,
        "median_path": median_path,
        "annualized_volatility_pct": round(sigma * 100.0, 1),
        "ewma_volatility_pct": round(ewma_vol * 100.0, 1),
        "hist_volatility_pct": round(hist_vol * 100.0, 1),
        "sortino_ratio": sortino,
        "cvar_95_pct": round(cvar_95_pct, 1),
        "cvar_95_euro": round(cvar_95_euro, 2),
        "jump_params": {
            "lambda_per_year": round(lam, 2),
            "mean_shock_pct": round(mu_j * 100.0, 1),
            "shock_std_pct": round(sigma_j * 100.0, 1)
        }
    }
