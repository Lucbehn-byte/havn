"""
Orchestrator-Engine: Bündelt alle individuellen Analysemodelle
(Chartanalyse, Krisentest, Monte-Carlo mit Jump-Diffusion, Rollierende Renditen,
Backtesting, Fundamentale Bewertung) zu einem einheitlichen Analyseergebnis.
"""
import numpy as np
import pandas as pd
import yfinance as yf
from config import TIMEFRAMES, SIMULATION_PATHS, VIZ_SAMPLE_PATHS
from core.data_loader import fetch_stock_data, get_asset_info
from models.chart_analysis import analyze_chart_technicals
from models.crisis_stress_test import run_crisis_stress_test
from models.monte_carlo import run_monte_carlo_simulation
from models.rolling_returns import calculate_rolling_returns
from models.backtesting import run_model_backtest
from models.fundamental_valuation import analyze_fundamental_valuation


def run_full_analysis(
    ticker_symbol: str,
    timeframe_label: str,
    investment_type: str = "Einmalanlage",
    sparplan_frequenz: str = "monatlich",
    kapital: float = 1000.0,
    startkapital: float = 0.0
) -> dict:
    """
    Führt die ganzheitliche Analyse über alle Teilmodelle aus.
    
    Rückgabe:
        dict mit allen aggregierten Ergebnissen oder dict mit Key 'error'.
    """
    clean_ticker = ticker_symbol.upper().strip()

    # 1. Konfiguration für den gewählten Zeithorizont holen
    tf_config = TIMEFRAMES.get(timeframe_label)
    if not tf_config:
        for label, cfg in TIMEFRAMES.items():
            if cfg["id"] == timeframe_label:
                tf_config = cfg
                timeframe_label = label
                break
                
    if not tf_config:
        return {"error": f"Ungültiger Zeithorizont: {timeframe_label}"}

    # 2. Kursdaten laden
    df, err = fetch_stock_data(clean_ticker, history_period="max")
    if err or df.empty:
        return {"error": err or "Keine Daten verfügbar."}

    close_series = df['Close']
    current_price = float(close_series.iloc[-1])
    asset_info = get_asset_info(clean_ticker)
    log_returns = np.log(close_series / close_series.shift(1)).dropna()

    # 3. Markt-Beta ermitteln (Fundierte Beta-Ermittlung mit Vasicek / Blume Bayesian Shrinkage)
    beta = 1.0
    try:
        t_obj = yf.Ticker(clean_ticker)
        raw_beta = None
        # yfinance speichert offizielles 5Y-Monats-Beta in .info
        try:
            if hasattr(t_obj, "info") and isinstance(t_obj.info, dict):
                raw_beta = t_obj.info.get("beta")
        except Exception:
            pass
            
        if raw_beta is None and hasattr(t_obj, "fast_info") and hasattr(t_obj.fast_info, "beta"):
            raw_beta = t_obj.fast_info.beta

        # Prüfen, ob es sich um einen bekannten breiten Welt-ETF handelt
        is_broad_etf = any(sub in clean_ticker for sub in ["EUNL", "VWCE", "URTH", "ACWI", "SPY", "VOO", "SXR8"])
        
        if is_broad_etf:
            beta = 1.00
        elif raw_beta is not None and float(raw_beta) > 0.1:
            # Vasicek / Blume Bayesian Shrinkage: 2/3 * raw + 1/3 * 1.0
            beta = float(np.clip((2.0 / 3.0) * float(raw_beta) + (1.0 / 3.0) * 1.0, 0.40, 2.30))
        else:
            # Schätzung über die Relation der letzten 3 Jahre (756 Handelstage)
            recent_3y = log_returns.iloc[-min(len(log_returns), 756):]
            ann_vol_3y = float(recent_3y.std() * np.sqrt(252.0))
            is_crypto = "BTC" in clean_ticker or "ETH" in clean_ticker or asset_info.get("typ") == "Kryptowährung"
            corr = 0.45 if is_crypto else 0.70
            raw_est_beta = corr * (ann_vol_3y / 0.165)
            # Vasicek Shrinkage zum Marktmittelwert
            beta = float(np.clip((2.0 / 3.0) * raw_est_beta + (1.0 / 3.0) * 1.0, 0.40, 2.30))
    except Exception:
        recent_3y = log_returns.iloc[-min(len(log_returns), 756):]
        ann_vol_3y = float(recent_3y.std() * np.sqrt(252.0)) if len(recent_3y) > 20 else 0.18
        beta = float(np.clip((2.0 / 3.0) * (0.70 * ann_vol_3y / 0.165) + (1.0 / 3.0) * 1.0, 0.50, 2.20))

    # 4. Modell 6: Fundamentale Bewertung (vorab ausführen für Drift-Justierung)
    fund_res = analyze_fundamental_valuation(clean_ticker)
    val_drift_adj = fund_res.get("drift_adjustment", 0.0)

    # 5. Modell 1: Technische Chartanalyse
    chart_res = analyze_chart_technicals(df, category=tf_config["category"])
    chart_score = chart_res["score"]

    # 6. Modell 2: Historischer & synthetischer Krisen-Stresstest
    crisis_res = run_crisis_stress_test(df, beta=beta)

    # 7. Modell 3: Stochastische Monte-Carlo-Simulation (EWMA, Jump-Diffusion, CAPM, Sortino, CVaR)
    mc_res = run_monte_carlo_simulation(
        current_price=current_price,
        log_returns=log_returns,
        holding_days=tf_config["days"],
        chart_score=chart_score,
        investment_type=investment_type,
        sparplan_frequenz=sparplan_frequenz,
        kapital=kapital,
        startkapital=startkapital,
        anzahl_monate=tf_config["months"],
        num_simulations=SIMULATION_PATHS,
        sample_size_viz=VIZ_SAMPLE_PATHS,
        valuation_drift_adj=val_drift_adj,
        beta=beta
    )

    # 8. Modell 4: Empirische rollierende Renditen (Parallele Sparplan- / Einmalanlage-Prüfung)
    rolling_res = calculate_rolling_returns(
        close_series=close_series,
        holding_days=tf_config["days"],
        investment_type=investment_type,
        sparplan_frequenz=sparplan_frequenz,
        kapital=kapital,
        startkapital=startkapital
    )

    # 9. Modell 5: Kausaler Backtest (Regime-basiertes Quantil-Backtesting)
    backtest_res = run_model_backtest(
        hist_score_series=chart_res["hist_score_series"],
        close_series=close_series,
        holding_days=tf_config["days"],
        current_score=chart_score,
        history_label=f"{len(df) // 252} Jahre Historie"
    )

    # Gesamtergebnis zusammenstellen
    return {
        "ticker": clean_ticker,
        "asset_info": asset_info,
        "current_price": round(current_price, 2),
        "beta": round(beta, 2),
        "timeframe_label": timeframe_label,
        "timeframe_config": tf_config,
        "investment_type": investment_type,
        "sparplan_frequenz": sparplan_frequenz,
        "kapital_input": kapital,
        "startkapital_input": startkapital,
        "chart_model": chart_res,
        "crisis_model": crisis_res,
        "monte_carlo": mc_res,
        "rolling_returns": rolling_res,
        "backtest": backtest_res,
        "fundamental": fund_res,
        "history_df": df
    }
