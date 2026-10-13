"""
Offline-Unit-Test mit synthetischen Kursdaten zur Verifikation aller Modelle
inklusive EWMA-Volatilität, Schock-Kalibrierung, Sortino, CVaR und synthetischem Beta-Stresstest.
"""
import sys
import os
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.chart_analysis import analyze_chart_technicals
from models.crisis_stress_test import run_crisis_stress_test
from models.monte_carlo import run_monte_carlo_simulation, calibrate_merton_jumps, calculate_ewma_volatility
from models.rolling_returns import calculate_rolling_returns
from models.backtesting import run_model_backtest
from models.fundamental_valuation import analyze_fundamental_valuation

def create_synthetic_data(short: bool = False):
    start_year = "2023-01-01" if short else "2005-01-01"
    dates = pd.date_range(start=start_year, end="2025-01-01", freq="B")
    n = len(dates)
    
    np.random.seed(42)
    daily_returns = np.random.normal(loc=0.0004, scale=0.015, size=n)
    # Gezielte Schock-Tage (z. B. Quartals-Crashes)
    if n > 100:
        daily_returns[50] = -0.09
        daily_returns[90] = -0.07
        daily_returns[150] = 0.08
    prices = 50.0 * np.exp(np.cumsum(daily_returns))
    
    df = pd.DataFrame({
        "Open": prices * (1 - 0.002),
        "High": prices * (1 + 0.005),
        "Low": prices * (1 - 0.005),
        "Close": prices,
        "Volume": np.random.randint(100000, 5000000, size=n)
    }, index=dates)
    return df

def test_offline_models():
    print("Starte erweiterte Offline-Modultests (Quant-Präzision)...")
    df = create_synthetic_data()

    # 1. Chart-Modell
    chart = analyze_chart_technicals(df, category="mittel")
    assert "score" in chart
    print(f"✅ 1. Chart-Analyse Score: {chart['score']}%")

    # 2. Krisen-Stresstest (Reale Historie + Synthetischer Beta-Test)
    crisis_full = run_crisis_stress_test(df, beta=1.2)
    assert "results" in crisis_full
    assert crisis_full["results"]["Corona-Crash (2020)"]["is_synthetic"] == False
    print(f"✅ 2a. Reale Krise (2020) Drawdown: {crisis_full['results']['Corona-Crash (2020)']['max_drawdown_pct']}%")

    df_short = create_synthetic_data(short=True)
    crisis_synth = run_crisis_stress_test(df_short, beta=1.35)
    assert crisis_synth["results"]["Corona-Crash (2020)"]["is_synthetic"] == True
    print(f"✅ 2b. Synthetische Krise (Beta 1.35) Drawdown: {crisis_synth['results']['Corona-Crash (2020)']['max_drawdown_pct']}%")

    # 3. EWMA & Schock-Kalibrierung Tests
    log_returns = np.log(df["Close"] / df["Close"].shift(1)).dropna()
    ewma_v, hist_v = calculate_ewma_volatility(log_returns)
    lam, mu_j, sigma_j = calibrate_merton_jumps(log_returns)
    assert ewma_v > 0 and hist_v > 0
    assert lam > 0 and mu_j < 0
    print(f"✅ 3a. EWMA-Vola: {ewma_v*100:.1f}% vs. Hist-Vola: {hist_v*100:.1f}%")
    print(f"✅ 3b. Kalibrierte Schocks: Lambda={lam:.2f}/J, Mu_J={mu_j*100:.1f}%, Sigma_J={sigma_j*100:.1f}%")

    # 4. Monte-Carlo mit CAPM, EWMA, Sortino & CVaR
    mc = run_monte_carlo_simulation(
        current_price=float(df["Close"].iloc[-1]),
        log_returns=log_returns,
        holding_days=252,
        chart_score=chart["score"],
        investment_type="Einmalanlage",
        kapital=1000.0,
        num_simulations=1000,
        valuation_drift_adj=-0.01,
        beta=1.2
    )
    assert mc["prob_up"] >= 0 and mc["prob_up"] <= 100
    assert "sortino_ratio" in mc and isinstance(mc["sortino_ratio"], float)
    assert "cvar_95_pct" in mc and mc["cvar_95_pct"] < 0
    print(f"✅ 4. Monte-Carlo: Gewinnwsk={mc['prob_up']}% | Sortino={mc['sortino_ratio']} | CVaR 95%={mc['cvar_95_pct']}% (-{mc['cvar_95_euro']} €)")

    # 5. Rollierende Renditen
    rolling = calculate_rolling_returns(df["Close"], holding_days=252)
    assert rolling["win_rate_pct"] is not None
    print(f"✅ 5. Rollierende Rendite Win-Rate: {rolling['win_rate_pct']}%")

    # 6. Backtesting
    bt = run_model_backtest(chart["hist_score_series"], df["Close"], holding_days=252, current_score=chart["score"])
    print(f"✅ 6. Backtest-Status: {bt['status_text']}")

    # 7. Fundamentale Bewertung mit Drift-Adjustment
    fund = analyze_fundamental_valuation("OFFLINE_TEST")
    assert "drift_adjustment" in fund
    print(f"✅ 7. Fundamentale Bewertung: {fund['valuation_status']} (Drift-Adj: {fund['drift_adjustment']*100:+.2f}% p.a.)")

    print("\n🎉 ALLE QUANT-PRÄZISIONS-MODELLE ERFOLGREICH GETESTET!")
    return True

if __name__ == "__main__":
    test_offline_models()
