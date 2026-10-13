"""
Modell 2: Historischer Krisen- & Gewinnphasen-Stresstest (mit synthetischer Beta-Projektion)
Überprüft das reale historische Verhalten der Aktie bzw. des ETFs in definierten
Marktkrisen (z. B. Corona-Crash 2020, Zinsschock 2022, Finanzkrise 2008) sowie
in außergewöhnlich starken Gewinnphasen.
Für jüngere Wertpapiere wird eine synthetische Simulation über das Markt-Beta berechnet.
"""
import pandas as pd
import numpy as np


# Definition der historischen Benchmark-Phasen mit Referenzwerten für den Weltmarkt (MSCI World / S&P 500)
HISTORICAL_SCENARIOS = {
    "Corona-Crash (2020)": {
        "typ": "Krise (Blitzcrash)",
        "start": "2020-02-01",
        "end": "2020-09-30",
        "beschreibung": "Rasanter Einbruch durch weltweite Lockdowns, gefolgt von einer V-förmigen Erholung.",
        "bench_dd": -33.8,
        "bench_return": 5.5,
        "bench_days_to_trough": 33
    },
    "Zinsschock & Bärenmarkt (2022)": {
        "typ": "Krise (Zinswende)",
        "start": "2022-01-01",
        "end": "2022-12-31",
        "beschreibung": "Globale Zinserhöhungen gegen die Inflation belasten Tech- und Wachstumswerte.",
        "bench_dd": -25.4,
        "bench_return": -18.1,
        "bench_days_to_trough": 280
    },
    "Globale Finanzkrise (2008)": {
        "typ": "Krise (Strukturkrise)",
        "start": "2007-10-01",
        "end": "2009-06-30",
        "beschreibung": "Schwerste Banken- und Wirtschaftskrise seit den 1930er Jahren.",
        "bench_dd": -56.8,
        "bench_return": -46.0,
        "bench_days_to_trough": 515
    },
    "Post-Corona-Rallye (2020/21)": {
        "typ": "Gewinnphase (Bullenmarkt)",
        "start": "2020-04-01",
        "end": "2021-11-30",
        "beschreibung": "Extremer Technologie- und Aktienboom durch expansive Geldpolitik.",
        "bench_dd": -9.5,
        "bench_return": 58.0,
        "bench_days_to_trough": 25
    }
}


def run_crisis_stress_test(full_history_df: pd.DataFrame, beta: float = 1.0) -> dict:
    """
    Untersucht das Verhalten in historischen Krisen- und Boom-Phasen.
    Falls für eine Epoche keine Realdaten vorliegen, wird eine synthetische
    Simulation auf Basis des aktuellen Risikoprofils (Markt-Beta) durchgeführt.
    
    Parameter:
        full_history_df: DataFrame mit vollständiger Kurshistorie (Close-Preise)
        beta: Statistisches Beta gegenüber dem Gesamtmarkt
        
    Rückgabe:
        dict mit Krisenergebnissen und Einordnung.
    """
    if full_history_df.empty or 'Close' not in full_history_df.columns:
        return {"results": {}, "summary": "Keine ausreichenden Daten vorhanden."}

    df = full_history_df.copy()
    
    if not isinstance(df.index, pd.DatetimeIndex):
        df.index = pd.to_datetime(df.index)
    if df.index.tz is not None:
        df.index = df.index.tz_localize(None)

    results = {}
    total_analyzed = 0
    max_observed_crash = 0.0

    for name, meta in HISTORICAL_SCENARIOS.items():
        start_date = pd.to_datetime(meta["start"])
        end_date = pd.to_datetime(meta["end"])

        mask = (df.index >= start_date) & (df.index <= end_date)
        period_df = df.loc[mask]

        # Wenn zu wenig historische Daten vorliegen: Synthetische Beta-Projektion
        if len(period_df) < 15:
            synth_dd = float(np.clip(meta["bench_dd"] * max(0.5, beta), -90.0, -5.0))
            synth_ret = float(meta["bench_return"] * beta)
            
            results[name] = {
                "verfuegbar": True,
                "is_synthetic": True,
                "typ": meta["typ"] + " (Synthetisch simuliert)",
                "beschreibung": meta["beschreibung"],
                "max_drawdown_pct": round(synth_dd, 1),
                "gesamt_rendite_pct": round(synth_ret, 1),
                "tage_bis_tief": meta["bench_days_to_trough"],
                "erholung_erfolgt": meta["bench_return"] > 0,
                "tiefstkurs_datum": "Simulierter Verlauf",
                "hinweis": f"Synthetische Simulation basierend auf aktuellem Markt-Beta von {beta:.2f}."
            }
            if "Krise" in meta["typ"]:
                total_analyzed += 1
                if abs(synth_dd) > max_observed_crash:
                    max_observed_crash = abs(synth_dd)
            continue

        # Reale Kursdaten vorhanden
        prices = period_df['Close']
        start_price = float(prices.iloc[0])
        end_price = float(prices.iloc[-1])
        overall_return = ((end_price - start_price) / start_price) * 100

        cummax = prices.cummax()
        drawdown_series = (prices - cummax) / cummax
        max_drawdown = float(drawdown_series.min()) * 100
        trough_idx = drawdown_series.idxmin()
        peak_idx = prices.loc[:trough_idx].idxmax()

        peak_val = float(prices.loc[peak_idx])
        subsequent = prices.loc[trough_idx:]
        recovered = bool((subsequent >= peak_val).any())
        days_to_trough = (trough_idx - peak_idx).days

        results[name] = {
            "verfuegbar": True,
            "is_synthetic": False,
            "typ": meta["typ"] + " (Reale Marktdaten)",
            "beschreibung": meta["beschreibung"],
            "max_drawdown_pct": round(max_drawdown, 1),
            "gesamt_rendite_pct": round(overall_return, 1),
            "tage_bis_tief": max(1, days_to_trough),
            "erholung_erfolgt": recovered,
            "tiefstkurs_datum": trough_idx.strftime("%d.%m.%Y"),
            "hinweis": "Realer historischer Kursverlauf dieses Wertpapiers."
        }
        
        if "Krise" in meta["typ"]:
            total_analyzed += 1
            if abs(max_drawdown) > max_observed_crash:
                max_observed_crash = abs(max_drawdown)

    # Laienverständliche Zusammenfassung
    if max_observed_crash < 22:
        summary = f"Sehr krisenresistent: In den untersuchten Stressphasen betrug der maximale Rücksetzer {max_observed_crash:.1f}%. Das deutet auf ein defensives, stabiles Profil hin."
    elif max_observed_crash < 38:
        summary = f"Typisches Marktrisiko: In Schockphasen (wie dem Corona-Crash) verzeichnete der Kurs Rücksetzer von bis zu -{max_observed_crash:.1f}%. Wer langfristig investiert blieb, glättete dieses Risiko jedoch aus."
    else:
        summary = f"Erhöhte Krisenanfälligkeit: Bei Marktpaniken kam es zu deutlichen Verlusten von bis zu -{max_observed_crash:.1f}%. Für Einsteiger empfiehlt sich hier zwingend ein Sparplan zur Glättung."

    return {
        "results": results,
        "max_drawdown_all": round(max_observed_crash, 1),
        "summary": summary
    }
