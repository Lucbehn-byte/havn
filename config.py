"""
Konfigurationsdatei für die HAVN Aktien- & ETF-Analyse-App.
Dein sicherer Hafen für fundierte Investment-Entscheidungen.
"""

# Vordefinierte Einsteiger-Investments mit Ticker, WKN, ISIN und Kurzbeschreibung
PRESET_ASSETS = {
    "MSCI World (iShares Core)": {
        "ticker": "EUNL.DE",
        "wkn": "A0RPWH",
        "isin": "IE00B4L5Y983",
        "typ": "ETF",
        "beschreibung": "Über 1.400 Unternehmen weltweit aus Industrieländern. Der beliebteste Basis-ETF."
    },
    "FTSE All-World (Vanguard)": {
        "ticker": "VWCE.DE",
        "wkn": "A2PKXG",
        "isin": "IE00BK5BQT80",
        "typ": "ETF",
        "beschreibung": "Vollständige globale Abdeckung: Industrieländer + Schwellenländer."
    },
    "S&P 500 (Vanguard)": {
        "ticker": "VUSA.DE",
        "wkn": "A1JX53",
        "isin": "IE00B3XXRP09",
        "typ": "ETF",
        "beschreibung": "Die 500 größten börsennotierten Unternehmen der USA."
    },
    "Apple Inc.": {
        "ticker": "AAPL",
        "wkn": "865985",
        "isin": "US0378331005",
        "typ": "Aktie",
        "beschreibung": "Einer der wertvollsten Technologiekonzerne der Welt."
    },
    "Bitcoin (EUR)": {
        "ticker": "BTC-EUR",
        "wkn": "A27854",
        "isin": "XC000A278544",
        "typ": "Krypto",
        "beschreibung": "Die führende und älteste dezentrale Kryptowährung nach Marktkapitalisierung."
    },
    "DAX ETF (iShares Core)": {
        "ticker": "EXS1.DE",
        "wkn": "593393",
        "isin": "DE0005933931",
        "typ": "ETF",
        "beschreibung": "Die 40 größten börsennotierten deutschen Unternehmen."
    },
    "Microsoft Corp.": {
        "ticker": "MSFT",
        "wkn": "870747",
        "isin": "US5949181045",
        "typ": "Aktie",
        "beschreibung": "Führend in Cloud Computing, Enterprise-Software und KI."
    },
    "SAP SE": {
        "ticker": "SAP.DE",
        "wkn": "716460",
        "isin": "DE0007164600",
        "typ": "Aktie",
        "beschreibung": "Größtes deutsches Technologie- und Softwareunternehmen."
    },
    "Allianz SE": {
        "ticker": "ALV.DE",
        "wkn": "840400",
        "isin": "DE0008404005",
        "typ": "Aktie",
        "beschreibung": "Führender globaler Finanz- und Versicherungskonzern mit hoher Dividendenrendite."
    },
    "BMW AG": {
        "ticker": "BMW.DE",
        "wkn": "519000",
        "isin": "DE0005190003",
        "typ": "Aktie",
        "beschreibung": "Bayerische Motoren Werke AG – Premium-Automobil- und Motorradhersteller."
    },
    "Mercedes-Benz Group": {
        "ticker": "MBG.DE",
        "wkn": "710000",
        "isin": "DE0007100000",
        "typ": "Aktie",
        "beschreibung": "Globaler Hersteller von Premium- und Luxus-Pkw und Vans."
    },
    "Tesla Inc.": {
        "ticker": "TSLA",
        "wkn": "A1CX3T",
        "isin": "US88160R1014",
        "typ": "Aktie",
        "beschreibung": "Pionier für Elektrofahrzeuge, Batteriespeicher und Solartechnologie."
    },
    "NVIDIA Corp.": {
        "ticker": "NVDA",
        "wkn": "918422",
        "isin": "US67066G1040",
        "typ": "Aktie",
        "beschreibung": "Weltweit führender Entwickler von Grafikprozessoren und KI-Beschleunigern."
    },
    "Amazon.com Inc.": {
        "ticker": "AMZN",
        "wkn": "906866",
        "isin": "US0231351067",
        "typ": "Aktie",
        "beschreibung": "Globaler E-Commerce-Riese und weltgrößter Cloud-Anbieter (AWS)."
    },
    "Alphabet (Google)": {
        "ticker": "GOOGL",
        "wkn": "A14Y6F",
        "isin": "US02079K3059",
        "typ": "Aktie",
        "beschreibung": "Mutterkonzern von Google, YouTube und Android."
    },
    "Novo Nordisk": {
        "ticker": "NOVO-B.CO",
        "wkn": "A1XA8R",
        "isin": "DK0062498333",
        "typ": "Aktie",
        "beschreibung": "Führendes globales Pharmaunternehmen für Diabetes und Adipositas."
    }
}

# Zeithorizonte mit Handels- und Kalendertagen
TIMEFRAMES = {
    "3 Tage (Kurzfrist-Impuls)": {
        "id": "3_tage",
        "days": 3,
        "history_period": "2y",
        "category": "kurz",
        "months": 0.1,
        "description": "Kurzfristiger Bewegungsimpuls für Trader."
    },
    "10 Tage (Kurzfrist-Trend)": {
        "id": "10_tage",
        "days": 10,
        "history_period": "3y",
        "category": "kurz",
        "months": 0.5,
        "description": "Kurzfristiger Swing über etwa zwei Handelswochen."
    },
    "8 Wochen (Mittelfrist-Swing)": {
        "id": "8_wochen",
        "days": 40,
        "history_period": "5y",
        "category": "mittel",
        "months": 2.0,
        "description": "Mittelfristiger Zyklus über 2 Monate."
    },
    "1 Jahr (Jahres-Trend)": {
        "id": "1_jahr",
        "days": 252,
        "history_period": "20y",
        "category": "mittel",
        "months": 12.0,
        "description": "Standard-Horizont für typische Trendfolge- und Sparplanentscheidungen."
    },
    "3 Jahre (Makro-Zyklus)": {
        "id": "3_jahre",
        "days": 756,
        "history_period": "max",
        "category": "lang",
        "months": 36.0,
        "description": "Mittlerer Investitionshorizont, glättet Konjunkturschwankungen."
    },
    "5 Jahre (Vermögensaufbau)": {
        "id": "5_jahre",
        "days": 1260,
        "history_period": "max",
        "category": "lang",
        "months": 60.0,
        "description": "Empfohlener Mindesthorizont für ETF-Einsteiger."
    }
}

# Simulationsparameter
SIMULATION_PATHS = 5000  # Ausgewogene Balance zwischen hoher statistischer Güte und Geschwindigkeit
VIZ_SAMPLE_PATHS = 40    # Anzahl der Pfade für den interaktiven Plotly-Fächer
