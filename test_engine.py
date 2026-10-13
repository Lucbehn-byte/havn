"""
Test-Skript zur Verifikation aller Module und Modelle inklusive Quant-Präzisionsmetriken.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.engine import run_full_analysis

def test_single_asset(ticker: str, timeframe: str, inv_type: str, kapital: float):
    print(f"\n--- Teste Analyse für {ticker} ({timeframe}, {inv_type}, {kapital} €) ---")
    res = run_full_analysis(ticker, timeframe, inv_type, "monatlich", kapital)
    
    if "error" in res and res["error"]:
        print(f"❌ Fehler: {res['error']}")
        return False
        
    print(f"✅ Asset: {res['asset_info']['name']}")
    print(f"✅ Kurs: {res['current_price']} € | Markt-Beta: {res['beta']}")
    print(f"✅ Modell 1 (Chart-Score): {res['chart_model']['score']}% ({res['chart_model']['regime']})")
    print(f"✅ Modell 2 (Krisentest Max DD): {res['crisis_model']['max_drawdown_all']}%")
    print(f"✅ Modell 3 (Monte-Carlo Gewinn-Wsk): {res['monte_carlo']['prob_up']}% (Erwartet: {res['monte_carlo']['erwarteter_endwert']} €)")
    print(f"   🛡️ Quant-Risiko: Sortino={res['monte_carlo']['sortino_ratio']} | CVaR 95%={res['monte_carlo']['cvar_95_pct']}% (-{res['monte_carlo']['cvar_95_euro']} €)")
    print(f"   ⚡ EWMA-Vola: {res['monte_carlo']['ewma_volatility_pct']}% p.a. (vs. Hist-Vola: {res['monte_carlo']['hist_volatility_pct']}%)")
    print(f"   💥 Schock-Kalibrierung: Lambda={res['monte_carlo']['jump_params']['lambda_per_year']}/J, Shock={res['monte_carlo']['jump_params']['mean_shock_pct']}%")
    print(f"✅ Modell 4 (Rollierende Rendite Win-Rate): {res['rolling_returns']['win_rate_pct']}%")
    print(f"✅ Modell 5 (Backtest-Status): {res['backtest']['status_text']}")
    print(f"✅ Modell 6 (Bewertung): {res['fundamental']['valuation_status']} (Drift-Adj: {res['fundamental']['drift_adjustment']*100:+.2f}% p.a.)")
    return True

if __name__ == "__main__":
    print("Starte Modultests der HAVN-QuantEngine...")
    
    # Test 1: Einmalanlage in eine US-Aktie (AAPL)
    ok1 = test_single_asset("AAPL", "1 Jahr (Jahres-Trend)", "Einmalanlage", 1000.0)
    
    # Test 2: Sparplan in einen Welt-ETF (iShares MSCI World EUNL.DE)
    ok2 = test_single_asset("EUNL.DE", "3 Jahre (Makro-Zyklus)", "Sparplan", 50.0)
    
    if ok1 and ok2:
        print("\n🎉 ALLE TESTS ERFOLGREICH BESTANDEN!")
        sys.exit(0)
    else:
        print("\n❌ EINIGE TESTS FEHLGESCHLAGEN.")
        sys.exit(1)
