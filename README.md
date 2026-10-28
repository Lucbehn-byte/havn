# ⚓ HAVN — Dein sicherer Hafen für Aktien & ETFs

Eine benutzerfreundliche Python- und Streamlit-Applikation, die Börseneinsteigern verständliche Wahrscheinlichkeiten, Krisen-Stresstests und Risikoprofile liefert, um fundierte Entscheidungen für das eigene Depot (z. B. bei Trade Republic, Scalable Capital, ING etc.) zu treffen.

---

## 📁 Projektstruktur & Analysemodelle

```
quant_aktien_app/
├── app.py                      # Interaktives Streamlit-Dashboard
├── config.py                   # Presets (Welt-ETFs, S&P 500, Tech-Aktien), Zeithorizonte & Parameter
├── requirements.txt            # Python-Abhängigkeiten
│
├── models/                     # DIE EINZELNEN ANALYSEMODELLE
│   ├── chart_analysis.py       # Modell 1: Technische Chartanalyse (Donchian-Kanal, GD50/GD200, RSI, Bollinger)
│   ├── crisis_stress_test.py   # Modell 2: Historischer Krisen- & Stresstest (Corona 2020, Finanzkrise 2008, 2022)
│   ├── monte_carlo.py          # Modell 3: Stochastische Simulation (GBB, 5.000 Pfade, echte Sparplan-DCA)
│   ├── rolling_returns.py      # Modell 4: Empirische Gewinnwahrscheinlichkeiten über Haltedauern
│   └── backtesting.py          # Modell 5: Kausaler Backtest der Modelltrefferquote
│
├── core/                       # DATEN & ORCHESTRIERUNG
│   ├── data_loader.py          # Kursdatenabruf via yfinance, Asset-Metadaten & Caching
│   └── engine.py               # Führt alle Analysemodelle zusammen
│
└── utils/                      # FORMATIERUNG & BROKER-LEITFADEN
    ├── broker_guide.py         # Schritt-für-Schritt-Anleitung für Trade Republic, Scalable & Co.
    └── formatting.py           # Euro-Formatierung, Ampellogik, Prozentwerte
```

---

## 🚀 Schnellstart in Visual Studio Code

### 1. In den Projektordner wechseln
```bash
cd /Users/lucbehn/.gemini/antigravity/scratch/quant_aktien_app
```

### 2. Abhängigkeiten installieren
```bash
pip install -r requirements.txt
```

### 3. Streamlit-App starten
```bash
streamlit run app.py
```
Die Web-App öffnet sich automatisch in deinem Browser unter `http://localhost:8501`.

---

## 🧠 Die 5 Analysemodelle im Detail

1. **`models/chart_analysis.py` (Technische Chartanalyse)**
   * Multi-Zeithorizont Donchian-Kanäle zur Erkennung von Trendkanälen und Ausbrüchen.
   * Trendfolger über 50-Tage- und 200-Tage-Linie (Golden Cross / Death Cross).
   * Momentum- und Überkauft/Überverkauft-Filter (RSI, Bollinger-Bänder).
   * Dynamische Gewichtung über die Average True Range (ATR).
   * *Ergebnis:* Chart-Score von -100 bis +100 % mit Ampelsignal (Grün, Gelb, Rot).

2. **`models/crisis_stress_test.py` (Historischer Krisen-Check)**
   * Testet das Wertpapier gegen reale Krisen: **Corona-Crash (2020)**, **Zinsschock (2022)** und **Globale Finanzkrise (2008)**.
   * Ermittelt den maximalen zwischenzeitlichen Kursverlust (Max Drawdown) und ob sich der Kurs im Betrachtungszeitraum wieder vollständig erholen konnte.

3. **`models/monte_carlo.py` (Stochastische Zukunftssimulation)**
   * Simuliert 5.000 mögliche Zukunftspfade über die geometrische Brownsche Bewegung (GBB).
   * **Echte Sparplan-Simulation:** Berücksichtigt reale monatliche oder wöchentliche Zukäufe (Cost-Average-Effekt).
   * Liefert Renditekorridore: *Pessimistisch (10. Perzentil)*, *Realistisch (Median)* und *Optimistisch (90. Perzentil)*.

4. **`models/rolling_returns.py` (Empirische Gewinnwahrscheinlichkeit)**
   * Berechnet für jeden beliebigen historischen Tag die Rendite nach 1, 3 oder 5 Jahren Haltedauer.
   * Zeigt Einsteigern greifbar: *„In 99,8 % aller Fälle lag man nach 3 Jahren Haltedauer im Gewinn.“*

5. **`models/backtesting.py` (Modell-Güte)**
   * Prüft, wie oft ähnliche Indikatoren-Signale in der Vergangenheit tatsächlich zu Kursgewinnen führten.

<!-- HAVN_STATS_START -->
## 📊 HAVN Live-Analytics (Internes Admin-Dashboard)

> *Automatisch aktualisiert am: **2026-10-28 22:36 UTC** • Nur im Code / Repository sichtbar (nicht öffentlich im Web).*

### 👥 1. Besucher & Aufrufe
| Metrik | Heute | Gesamt (All-Time) |
| :--- | :--- | :--- |
| **Eindeutige Besucher (Uniques)** | **0** | **1** |
| **Seiten- & Interaktions-Aufrufe** | **0** | **1** |

---

### 🧭 2. Menüreiter-Nutzung (Wo verbringen Nutzer Zeit?)
| Menüreiter | Aufrufe | Anteil | Verteilung |
| :--- | :--- | :--- | :--- |
| **⚓ Hafen (Hauptanalyse Basic & Pro)** | `2` | `40.0 %` | `████░░░░░░` |
| **⚡ Sturm (Krisensimulator & Stresstest)** | `1` | `20.0 %` | `██░░░░░░░░` |
| **⚔️ Duell (Asset-Battle)** | `1` | `20.0 %` | `██░░░░░░░░` |
| **🧭 Kompass (Sparziel-Planer)** | `1` | `20.0 %` | `██░░░░░░░░` |
| **📖 Logbuch (Finanzakademie)** | `0` | `0.0 %` | `░░░░░░░░░░` |

---

### 📱 3. Geräte-Quote
* ** iPhone / iPad (iOS):** `0.0 %` (0 Aufrufe)
* **💻 Desktop (PC / Mac):** `100.0 %` (1 Aufrufe)
* **🤖 Android:** `0.0 %` (0 Aufrufe)

---

### 📈 4. 14-Tage-Aktivitätstrend
```text
Datum     Besucher   Aufrufe    Verlauf
------------------------------------------------------------
15.10.    0          0          · (0)
16.10.    0          0          · (0)
17.10.    0          0          · (0)
18.10.    0          0          · (0)
19.10.    0          0          · (0)
20.10.    0          0          · (0)
21.10.    0          0          · (0)
22.10.    0          0          · (0)
23.10.    0          0          · (0)
24.10.    0          0          · (0)
25.10.    1          1          ████████████████████ (1)
26.10.    0          0          · (0)
27.10.    0          0          · (0)
28.10.    0          0          · (0)
```

---

### 🏆 5. Beliebteste Wertpapiere & Suchbegriffe
* **Meistgesuchte Ticker:** `AAPL` (4x), `EUNL.DE` (3x)
* **Häufigste Suchbegriffe:** „msci world“ (1x)

---

### ⚡ 6. 15-Minuten In-Memory Cache Performance
* **Cache Hits (eingesparte Anfragen):** `0`
* **Aktive Einträge im RAM:** `2`
* **Erfolgsquote (Hit-Ratio):** `0.0 %` der Anfragen blitzschnell aus dem RAM bedient
<!-- HAVN_STATS_END -->
