"""
Modell 2: Historischer Krisen- & Gewinnphasen-Stresstest
Überprüft das reale historische Verhalten der Aktie bzw. des ETFs in definierten
Marktkrisen (z. B. Corona-Crash 2020, Zinsschock 2022, Finanzkrise 2008) sowie
in außergewöhnlich starken Gewinnphasen.
"""
import pandas as pd
import numpy as np


# Definition der historischen Benchmark-Phasen
HISTORICAL_SCENARIOS = {
    "Corona-Crash (2020)": {
        "typ": "Krise (Blitzcrash)",
        "start": "2020-02-01",
        "end": "2020-09-30",
        "beschreibung": "Rasanter Einbruch durch weltweite Lockdowns, gefolgt von einer V-förmigen Erholung."
    },
    "Zinsschock & Bärenmarkt (2022)": {
        "typ": "Krise (Zinswende)",
        "start": "2022-01-01",
        "end": "2022-12-31",
        "beschreibung": "Globale Zinserhöhungen gegen die Inflation belasten Tech- und Wachstumswerte."
    },
    "Globale Finanzkrise (2008)": {
        "typ": "Krise (Strukturkrise)",
        "start": "2007-10-01",
        "end": "2009-06-30",
        "beschreibung": "Schwerste Banken- und Wirtschaftskrise seit den 1930er Jahren."
    },
    "Post-Corona-Rallye (2020/21)": {
        "typ": "Gewinnphase (Bullenmarkt)",
        "start": "2020-04-01",
        "end": "2021-11-30",
        "beschreibung": "Extremer Technologie- und Aktienboom durch expansive Geldpolitik."
    }
}


def run_crisis_stress_test(full_history_df: pd.DataFrame) -> dict:
    """
    Untersucht das Verhalten in historischen Krisen- und Boom-Phasen.
    
    Parameter:
        full_history_df: DataFrame mit vollständiger Kurshistorie (Close-Preise)
        
    Rückgabe:
        dict mit:
            - 'results': dict von Krisenszenarien mit Max Drawdown, Dauer, Rendite
            - 'summary': Laienverständliche Gesamteinschätzung des Krisenverhaltens
    """
    if full_history_df.empty or 'Close' not in full_history_df.columns:
        return {"results": {}, "summary": "Keine ausreichenden Daten vorhanden."}

    df = full_history_df.copy()
    
    # Sicherstellen, dass der Index datetime ist (ohne Timezone für einfache Filterung)
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

        # Daten für das Fenster filtern
        mask = (df.index >= start_date) & (df.index <= end_date)
        period_df = df.loc[mask]

        if len(period_df) < 15:
            results[name] = {
                "verfuegbar": False,
                "typ": meta["typ"],
                "beschreibung": meta["beschreibung"],
                "hinweis": "Zu diesem Zeitpunkt noch nicht an der Börse gelistet oder keine Daten vorhanden."
            }
            continue

        prices = period_df['Close']
        start_price = float(prices.iloc[0])
        end_price = float(prices.iloc[-1])
        overall_return = ((end_price - start_price) / start_price) * 100

        # Maximaler Drawdown (vom Höchststand im Zeitraum bis zum Tiefststand danach)
        cummax = prices.cummax()
        drawdown_series = (prices - cummax) / cummax
        max_drawdown = float(drawdown_series.min()) * 100
        trough_idx = drawdown_series.idxmin()
        peak_idx = prices.loc[:trough_idx].idxmax()

        # Erholungsprüfung: Wurde der Vorkrisen-Höchststand bis zum Ende des Zeitraums wieder erreicht?
        peak_val = float(prices.loc[peak_idx])
        subsequent = prices.loc[trough_idx:]
        recovered = bool((subsequent >= peak_val).any())
        
        days_to_trough = (trough_idx - peak_idx).days

        results[name] = {
            "verfuegbar": True,
            "typ": meta["typ"],
            "beschreibung": meta["beschreibung"],
            "max_drawdown_pct": round(max_drawdown, 1),
            "gesamt_rendite_pct": round(overall_return, 1),
            "tage_bis_tief": max(1, days_to_trough),
            "erholung_erfolgt": recovered,
            "tiefstkurs_datum": trough_idx.strftime("%d.%m.%Y")
        }
        
        if "Krise" in meta["typ"]:
            total_analyzed += 1
            if abs(max_drawdown) > max_observed_crash:
                max_observed_crash = abs(max_drawdown)

    # Laienverständliche Zusammenfassung formulieren
    if total_analyzed == 0:
        summary = "Dieses Wertpapier ist noch relativ jung. Es liegen keine Daten für die großen historischen Krisen vor."
    elif max_observed_crash < 20:
        summary = f"Sehr krisenresistent: In den untersuchten Stressphasen betrug der maximale zwischenzeitliche Rücksetzer {max_observed_crash:.1f}%. Das deutet auf ein defensives, stabiles Profil hin."
    elif max_observed_crash < 35:
        summary = f"Typisches Marktrisiko: In Schockphasen (wie dem Corona-Crash) verzeichnete der Kurs einen zwischenzeitlichen Einbruch von bis zu {max_observed_crash:.1f}%. Wer langfristig investiert blieb, glättete dieses Risiko jedoch aus."
    else:
        summary = f"Erhöhte Krisenanfälligkeit: Bei Marktpaniken kam es zu deutlichen Verlusten von bis zu -{max_observed_crash:.1f}%. Für Einsteiger empfiehlt sich hier zwingend ein Sparplan zur Glättung statt einer vollen Einmalanlage."

    return {
        "results": results,
        "max_drawdown_all": round(max_observed_crash, 1),
        "summary": summary
    }
