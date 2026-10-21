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
        return False, res
        
    print(f"✅ Asset: {res['asset_info']['name']}")
    print(f"✅ Kurs: {res['current_price']} € | Markt-Beta: {res['beta']}")
    print(f"✅ Modell 1 (Chart-Score): {res['chart_model']['score']}% ({res['chart_model']['regime']})")
    print(f"✅ Modell 2 (Krisentest Max DD): {res['crisis_model']['max_drawdown_all']}%")
    print(f"✅ Modell 3 (Monte-Carlo Gewinn-Wsk): {res['monte_carlo']['prob_up']}% (Erwartet: {res['monte_carlo']['erwarteter_endwert']} €)")
    print(f"   🛡️ Quant-Risiko: Sortino={res['monte_carlo']['sortino_ratio']} | Sharpe={res['monte_carlo'].get('sharpe_ratio')} | CVaR 95%={res['monte_carlo']['cvar_95_pct']}% (-{res['monte_carlo']['cvar_95_euro']} €)")
    print(f"   ⚡ EWMA-Vola: {res['monte_carlo']['ewma_volatility_pct']}% p.a. (vs. Hist-Vola: {res['monte_carlo']['hist_volatility_pct']}%)")
    print(f"   💥 Schock-Kalibrierung: Lambda={res['monte_carlo']['jump_params']['lambda_per_year']}/J, Shock={res['monte_carlo']['jump_params']['mean_shock_pct']}%")
    print(f"✅ Modell 4 (Rollierende Rendite Win-Rate): {res['rolling_returns']['win_rate_pct']}% ({res['rolling_returns']['summary']})")
    print(f"✅ Modell 5 (Backtest-Status): {res['backtest']['status_text']}")
    print(f"✅ Modell 6 (Bewertung): {res['fundamental']['valuation_status']} (Drift-Adj: {res['fundamental']['drift_adjustment']*100:+.2f}% p.a.)")
    if res['fundamental'].get('analyst_consensus'):
        cons = res['fundamental']['analyst_consensus']
        print(f"   🏛️ Wall-Street Konsens: {cons['recommendation']} ({cons['opinions_count']} Analysten) | Kursziel: {cons['target_median_price']} € (Upside: {cons['upside_pct']}%) | Fwd EPS-Wachstum: {cons['forward_eps_growth_pct']}%")
    return True, res

if __name__ == "__main__":
    print("Starte Modultests der HAVN-QuantEngine...")
    
    # Test 1: Einmalanlage in eine US-Aktie (AAPL)
    ok1, res_aapl = test_single_asset("AAPL", "1 Jahr (Jahres-Trend)", "Einmalanlage", 1000.0)
    assert ok1, "AAPL Test fehlgeschlagen"
    assert 0.85 <= res_aapl['beta'] <= 1.35, f"AAPL Beta unplausibel: {res_aapl['beta']}"
    assert res_aapl['monte_carlo']['prob_up'] >= 60.0, f"AAPL 1Y Gewinnwahrscheinlichkeit unplausibel niedrig: {res_aapl['monte_carlo']['prob_up']}%"
    assert res_aapl['backtest']['hit_rate_pct'] is not None, "AAPL Backtest liefert keine Hit-Rate"
    assert res_aapl['fundamental']['analyst_consensus'] is not None, "AAPL muss Analystenkonsens besitzen"
    assert res_aapl['fundamental']['analyst_consensus']['opinions_count'] >= 20, "AAPL muss mindestens 20 Analystenstimmen haben"
    
    # Test 2: Sparplan in einen Welt-ETF (iShares MSCI World EUNL.DE)
    ok2, res_eunl = test_single_asset("EUNL.DE", "3 Jahre (Makro-Zyklus)", "Sparplan", 50.0)
    assert ok2, "EUNL.DE Test fehlgeschlagen"
    assert 0.90 <= res_eunl['beta'] <= 1.10, f"MSCI World Beta muss ~1.0 sein: {res_eunl['beta']}"
    assert res_eunl['monte_carlo']['prob_up'] >= 85.0, f"EUNL.DE 3Y Sparplan Gewinnwahrscheinlichkeit unplausibel: {res_eunl['monte_carlo']['prob_up']}%"
    assert res_eunl['rolling_returns']['win_rate_pct'] >= 90.0, f"EUNL.DE Rollierende Rendite unplausibel: {res_eunl['rolling_returns']['win_rate_pct']}%"
    assert res_eunl['backtest']['hit_rate_pct'] is not None, "EUNL.DE Backtest liefert keine Hit-Rate"
    assert res_eunl['fundamental']['analyst_consensus'] is None, "ETF darf keinen Einzelaktien-Analystenkonsens besitzen"

    # Test 3: US-Tech-Riese NVDA
    ok3, res_nvda = test_single_asset("NVDA", "1 Jahr (Jahres-Trend)", "Einmalanlage", 1000.0)
    assert ok3, "NVDA Test fehlgeschlagen"
    assert 1.50 <= res_nvda['beta'] <= 2.20, f"NVDA Beta unplausibel: {res_nvda['beta']}"
    assert res_nvda['fundamental']['analyst_consensus'] is not None, "NVDA muss Analystenkonsens besitzen"
    assert res_nvda['fundamental']['analyst_consensus']['forward_eps_growth_pct'] is not None, "NVDA muss Forward-EPS-Wachstum besitzen"

    # Test 4: DAX-Schwergewicht SAP.DE
    ok4, res_sap = test_single_asset("SAP.DE", "1 Jahr (Jahres-Trend)", "Einmalanlage", 1000.0)
    assert ok4, "SAP.DE Test fehlgeschlagen"
    assert res_sap['fundamental']['analyst_consensus'] is not None, "SAP.DE muss Analystenkonsens besitzen"

    print("\n🎉 ALLE INSTITUTIONELLEN QUANT-VERIFIKATIONEN ERFOLGREICH BESTANDEN!")

