r"""
Modell 3: Stochastische Monte-Carlo-Simulation (Institutional-Grade Quant-Engine)
Umfasst:
- Institutionelles 3-Jahres-Lookback-Fenster gegen 40-Jahres-Hype-Verzerrungen
- EWMA-Volatilität (RiskMetrics-Standard $\lambda=0.94$, Volatility Clustering)
- Asymmetrische Merton Jump-Diffusion (Reine Crash-/Panik-Schocks mit Martingal-Kompensation)
- Black-Litterman & CAPM Multi-Horizon Drift-Shrinkage
- Echte Sparplan-DCA-Simulation mit Cost-Average-Effekt
- Institutionelle Risikometriken: Cornish-Fisher VaR 95%, Expected Shortfall (CVaR 95%), Sharpe- & Sortino-Ratio
"""
import numpy as np
import pandas as pd


def calibrate_merton_jumps(log_returns: pd.Series) -> tuple[float, float, float]:
    """
    Kalibriert die Crash-Schock-Parameter (Lambda, Mu_J, Sigma_J) asymmetrisch
    anhand der tatsächlichen extremen Verlusttage (< -2.2 Sigma) der Aktie/des ETFs.
    Verhindert die Verfälschung durch positive Ausreißer.
    """
    n = len(log_returns)
    if n < 60:
        return 1.50, -0.06, 0.03

    # Nutze die letzten 3 Jahre (756 Handelstage) für aktuelle Schock-Kalibrierung
    recent = log_returns.iloc[-min(n, 756):]
    daily_std = float(recent.std())
    daily_mean = float(recent.mean())
    if daily_std <= 1e-6:
        return 1.00, -0.05, 0.02

    # Asymmetrische Crash-Tage identifizieren (stärker als -2.2 Sigma)
    z_scores = (recent - daily_mean) / daily_std
    crash_mask = z_scores < -2.2
    crash_returns = recent[crash_mask].to_numpy()
    num_crashes = len(crash_returns)

    years = len(recent) / 252.0
    # Annualisierte Crash-Frequenz (typisch 0.5 bis 3.5 Panikschocks pro Jahr)
    lam = float(np.clip(num_crashes / max(0.5, years), 0.20, 3.50))

    if num_crashes >= 2:
        # Mittlere Schocktiefe (rein negativ)
        mu_j = float(np.clip(np.mean(crash_returns), -0.18, -0.025))
        sigma_j = float(np.clip(np.std(crash_returns), 0.015, 0.08))
    else:
        # Fallback basierend auf Tages-Standardabweichung (z. B. -3.0 Sigma)
        mu_j = float(np.clip(-2.8 * daily_std, -0.15, -0.03))
        sigma_j = float(np.clip(daily_std * 0.8, 0.015, 0.06))

    return lam, mu_j, sigma_j


def calculate_ewma_volatility(log_returns: pd.Series, lambda_decay: float = 0.94) -> tuple[float, float]:
    """
    Berechnet die tagesaktuelle EWMA-Volatilität (RiskMetrics) sowie die 3-Jahres-Baseline-Volatilität.
    Gibt (ewma_vol_annual, hist_vol_annual) zurück.
    """
    # 3-Jahres-Horizont für historische Baseline (verhindert 40 Jahre alte Dotcom/Penny-Stock Verzerrungen)
    recent = log_returns.iloc[-min(len(log_returns), 756):]
    hist_vol = float(recent.std() * np.sqrt(252.0))
    if hist_vol <= 1e-4:
        hist_vol = 0.16
    
    # Exponentiell gewichtete Varianz (RiskMetrics Standard lambda=0.94)
    recent_252 = log_returns.iloc[-min(len(log_returns), 252):]
    ewma_var = recent_252.ewm(alpha=1.0 - lambda_decay).var().iloc[-1]
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
    startkapital: float = 0.0,
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
    recent_3y = log_returns.iloc[-min(len(log_returns), 756):]

    # 1. EWMA & 3-Jahres-Baseline Volatilität kombinieren (Mean-Reverting Term-Structure)
    ewma_vol, hist_vol = calculate_ewma_volatility(log_returns)
    vol_half_life_days = 126.0  # 6 Monate Halbwertszeit für Volatilitätsregime
    w_ewma = np.exp(-holding_days / vol_half_life_days)
    sigma = float(w_ewma * ewma_vol + (1.0 - w_ewma) * hist_vol)
    sigma = max(0.04, min(0.95, sigma))  # Plausible Grenzen

    # 2. CAPM & Multi-Horizon Bayesian Drift-Modellierung
    # Historische 3Y-Jahresrendite (CAGR)
    cagr_3y = float(np.exp(recent_3y.mean() * 252.0) - 1.0) if len(recent_3y) >= 30 else 0.08
    cagr_3y = float(np.clip(cagr_3y, -0.20, 0.35))
    
    # Makro-Gleichgewicht (CAPM): r_f (3%) + Beta * ERP (5.5%)
    r_f = 0.03
    mkt_equity_risk_premium = 0.055
    capm_mu = r_f + beta * mkt_equity_risk_premium

    # Zeithorizont-Shrinkage:
    # Bei kurzen Horizonten (10-30 Tage) zählt Momentum mehr;
    # bei 1-5 Jahren konvergiert die Rendite stark zum makroökonomischen CAPM-Gleichgewicht
    shrinkage_factor = min(0.65, 0.20 + 0.10 * (holding_days / 252.0))
    shrunk_mu = (1.0 - shrinkage_factor) * cagr_3y + shrinkage_factor * capm_mu

    # Chart-Score-Einfluss (dämpft sich mit zunehmender Haltedauer ab)
    timeframe_dampening = np.exp(-holding_days / 252.0)
    chart_drift_adj = (chart_score / 100.0) * 0.03 * timeframe_dampening

    # Gesamter kontinuierlicher Drift
    mu = shrunk_mu + chart_drift_adj + valuation_drift_adj
    mu = float(np.clip(mu, -0.15, 0.28))

    # 3. Asymmetrisch kalibrierte Merton Jump-Diffusion (Reine Abwärtsschocks)
    lam, mu_j, sigma_j = calibrate_merton_jumps(log_returns)
    # Martingal-Kompensator für Jumps: k = E[e^X - 1]
    k_comp = float(np.exp(mu_j + 0.5 * sigma_j**2) - 1.0)

    # 4. Simulation von 5.000 Pfaden
    Z = np.random.standard_normal((holding_days, num_simulations))
    N_jumps = np.random.poisson(lam * dt, size=(holding_days, num_simulations))
    J_shocks = np.random.normal(mu_j, sigma_j, size=(holding_days, num_simulations))

    # Ito-Drift-Kompensation: (mu - 0.5*sigma^2 - lam*k)
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
        # Echte Sparplan-DCA-Simulation (Cost-Average-Effekt + Startkapital)
        interval_days = 5 if sparplan_frequenz == "wöchentlich" else 21
        anzahl_einzahlungen = max(1, int(holding_days / interval_days))

        initial_deposit = max(0.0, float(startkapital))
        total_regular = float(anzahl_einzahlungen * kapital)
        eingezahltes_kapital = initial_deposit + total_regular

        # Initialer Anteilsbestand aus Startkapital an Tag 0
        accumulated_shares = np.full(num_simulations, initial_deposit / current_price) if initial_deposit > 0 else np.zeros(num_simulations)
        
        for k in range(anzahl_einzahlungen):
            day_idx = min(holding_days, k * interval_days)
            purchase_prices = price_paths[day_idx]
            accumulated_shares += kapital / purchase_prices

        simulated_portfolio_values = accumulated_shares * price_paths[-1]
        if eingezahltes_kapital > 0:
            returns_pct = ((simulated_portfolio_values - eingezahltes_kapital) / eingezahltes_kapital) * 100.0
        else:
            returns_pct = np.zeros(num_simulations)

    # 6. Wahrscheinlichkeiten & Perzentile
    prob_up = float(np.mean(returns_pct > 0.5) * 100.0)
    prob_down = float(np.mean(returns_pct < -0.5) * 100.0)
    prob_flat = float(max(0.0, 100.0 - prob_up - prob_down))

    median_endwert = float(np.percentile(simulated_portfolio_values, 50))
    pessimistisch_endwert = float(np.percentile(simulated_portfolio_values, 10))
    optimistisch_endwert = float(np.percentile(simulated_portfolio_values, 90))

    expected_return_pct = float(np.median(returns_pct))
    erwarteter_gewinn = median_endwert - eingezahltes_kapital

    # 7. Institutionelle Risikometriken: Cornish-Fisher VaR 95%, CVaR 95%, Sharpe & Sortino
    mean_ret = float(np.mean(returns_pct))
    std_ret = float(np.std(returns_pct))
    ret_series = pd.Series(returns_pct)
    skew = float(ret_series.skew()) if std_ret > 1e-4 else 0.0
    kurt = float(ret_series.kurtosis()) if std_ret > 1e-4 else 0.0

    # Cornish-Fisher Expansion für 95% Quantil
    z_alpha = -1.644853  # Normalquantil 95%
    z_cf = (z_alpha 
            + (z_alpha**2 - 1.0) * skew / 6.0 
            + (z_alpha**3 - 3.0 * z_alpha) * kurt / 24.0 
            - (2.0 * z_alpha**3 - 5.0 * z_alpha) * (skew**2) / 36.0)
    cf_var_95_pct = -(mean_ret + z_cf * std_ret)

    # Empirischer VaR & CVaR 95% (Expected Shortfall)
    var_95_cutoff = float(np.percentile(returns_pct, 5))
    worst_5_pct_returns = returns_pct[returns_pct <= var_95_cutoff]
    cvar_95_pct = float(np.mean(worst_5_pct_returns)) if len(worst_5_pct_returns) > 0 else var_95_cutoff
    cvar_95_euro = eingezahltes_kapital * (abs(cvar_95_pct) / 100.0) if cvar_95_pct < 0 else 0.0

    # Downside-Deviation & Sortino-Ratio (Verluststreuung < 0%)
    negative_returns = np.minimum(returns_pct, 0.0)
    downside_dev = float(np.sqrt(np.mean(negative_returns**2)))
    
    # Risikofreier Zins für Haltedauer
    rf_holding = r_f * (holding_days / 252.0) * 100.0
    
    if downside_dev > 0.01:
        sortino = round(float((expected_return_pct - rf_holding) / downside_dev), 2)
    else:
        sortino = 5.0

    # Sharpe-Ratio
    if std_ret > 0.01:
        sharpe = round(float((expected_return_pct - rf_holding) / std_ret), 2)
    else:
        sharpe = 2.0

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
        "sharpe_ratio": sharpe,
        "cvar_95_pct": round(cvar_95_pct, 1),
        "cvar_95_euro": round(cvar_95_euro, 2),
        "cf_var_95_pct": round(cf_var_95_pct, 1),
        "skewness": round(skew, 2),
        "kurtosis": round(kurt, 2),
        "jump_params": {
            "lambda_per_year": round(lam, 2),
            "mean_shock_pct": round(mu_j * 100.0, 1),
            "shock_std_pct": round(sigma_j * 100.0, 1)
        }
    }

