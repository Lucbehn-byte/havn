"""
Hauptanwendung: QuantEngine — Aktien- & ETF-Risikomanagement für Einsteiger
Modernes, interaktives Dashboard zur transparenten Risikobewertung und
Wahrscheinlichkeitsberechnung für den ersten Schritt an der Börse.
"""
import streamlit as st
import plotly.graph_objects as go
import pandas as pd

from config import PRESET_ASSETS, TIMEFRAMES
from core.engine import run_full_analysis
from core.data_loader import search_ticker_candidates
from utils.formatting import format_euro, format_percent, get_traffic_light
from utils.broker_guide import render_broker_instructions

# 1. SEITENKONFIGURATION
st.set_page_config(
    page_title="HAVN | Sicher in Aktien & ETFs investieren",
    page_icon="⚓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Caching-Wrapper für schnelle Berechnungen ohne ständige Re-Runs
@st.cache_data(ttl=900, show_spinner=False)
def cached_run_analysis(ticker: str, timeframe: str, inv_type: str, sparplan_freq: str, kapital: float):
    return run_full_analysis(ticker, timeframe, inv_type, sparplan_freq, kapital)


# 2. SIDEBAR: EINGABEN & EINSTELLUNGEN
with st.sidebar:
    st.title("⚓ HAVN")
    st.markdown("**Dein sicherer Hafen für Aktien & ETFs.**")
    st.markdown("---")
    
    st.subheader("1. Wertpapier auswählen")
    selection_mode = st.radio(
        "Modus:",
        ["🔍 Beliebige Aktie / ETF suchen", "⭐️ Beliebte Favoriten"],
        index=0,
        horizontal=True
    )

    if selection_mode == "⭐️ Beliebte Favoriten":
        preset_keys = list(PRESET_ASSETS.keys())
        selected_preset = st.selectbox("Wähle einen Favoriten:", preset_keys, index=0)
        ticker_input = PRESET_ASSETS[selected_preset]["ticker"]
        st.caption(f"Verwendetes Börsenkürzel: `{ticker_input}` ({PRESET_ASSETS[selected_preset]['typ']})")
    else:
        search_query = st.text_input(
            "Name, Ticker oder WKN eingeben:",
            value="Tesla",
            placeholder="z. B. Tesla, BMW, Nvidia, Amazon, EUNL.DE..."
        ).strip()

        if search_query:
            candidates = search_ticker_candidates(search_query)
            if candidates:
                candidate_labels = [
                    f"{c['name']} ({c['symbol']}) — {c['type']}"
                    for c in candidates
                ]
                selected_idx = st.selectbox(
                    "Gefundene Treffer:",
                    range(len(candidates)),
                    format_func=lambda i: candidate_labels[i]
                )
                ticker_input = candidates[selected_idx]["symbol"]
                st.caption(f"Ausgewähltes Symbol: `{ticker_input}`")
            else:
                ticker_input = search_query.upper()
                st.caption(f"Verwende Direkteingabe als Ticker: `{ticker_input}`")
        else:
            ticker_input = "AAPL"

    st.markdown("---")
    st.subheader("2. Anlagehorizont & Strategie")
    timeframe_labels = list(TIMEFRAMES.keys())
    selected_timeframe = st.selectbox("⏳ Geplante Haltedauer:", timeframe_labels, index=3)

    inv_type = st.radio("🎯 Anlagestrategie:", ["Einmalanlage", "Sparplan"], index=0)

    if inv_type == "Einmalanlage":
        kapital = st.number_input("Einmaliger Geldeinsatz (€):", value=1000, step=100, min_value=25)
        sparplan_freq = "monatlich"
    else:
        sparplan_freq = st.selectbox("Sparplan-Rhythmus:", ["monatlich", "wöchentlich"], index=0)
        default_rate = 50 if sparplan_freq == "monatlich" else 25
        kapital = st.number_input(f"Sparrate ({sparplan_freq}) in €:", value=default_rate, step=10, min_value=10)

    st.markdown("---")
    start_btn = st.button("🚀 Analyse starten", type="primary", use_container_width=True)
    st.caption("HAVN • Stochastische Simulation mit Merton Jump-Diffusion (5.000 Pfade), realen Krisendaten & Trendkanälen.")


# 3. SESSION STATE VERWALTUNG
if "last_analysis" not in st.session_state:
    st.session_state.last_analysis = None
if "last_error" not in st.session_state:
    st.session_state.last_error = None

if start_btn:
    with st.spinner(f"Analysiere {ticker_input}... Lade historische Daten und berechne 5.000 Pfade..."):
        try:
            res = cached_run_analysis(ticker_input, selected_timeframe, inv_type, sparplan_freq, kapital)
            if "error" in res and res["error"]:
                st.session_state.last_error = res["error"]
                st.session_state.last_analysis = None
            else:
                st.session_state.last_analysis = res
                st.session_state.last_error = None
        except Exception as e:
            st.session_state.last_error = f"Fehler bei der Ausführung: {str(e)}"
            st.session_state.last_analysis = None


# 4. HAUPTBEREICH ANZEIGE
if st.session_state.last_error:
    st.error(f"⚠️ {st.session_state.last_error}")

elif st.session_state.last_analysis is None:
    st.title("⚓ Willkommen bei HAVN")
    st.markdown("### Dein sicherer Hafen für den ersten Schritt an der Börse")
    
    st.info("""
    💡 **So funktioniert HAVN:**
    1. Wähle in der linken Seitenleiste ein Wertpapier aus (z. B. den weltweiten **MSCI World ETF** oder eine Aktie wie **Apple**).
    2. Gib deine gewünschte **Haltedauer** und deinen **Geldeinsatz** ein (z. B. 1.000 € einmalig oder 50 € Monatssparplan).
    3. Klicke auf **'Analyse starten'**.
    
    HAVN überprüft den Kursverlauf, testet das Verhalten in vergangenen Krisen und berechnet stochastische Gewinnwahrscheinlichkeiten.
    """)

    col_hero1, col_hero2, col_hero3 = st.columns(3)
    with col_hero1:
        st.markdown("#### 🛡️ Transparenz statt Blindflug")
        st.write("Verstehe vor dem ersten Cent, wie stark ein Wertpapier in Krisen (z. B. Corona 2020) schwankt und wie schnell es sich erholt.")
    with col_hero2:
        st.markdown("#### 🔮 Mathematische Wahrscheinlichkeit")
        st.write("Keine unseriösen Kursziele, sondern 5.000 simulierte Zukunftspfade auf Basis realer Volatilität und Crash-Sprungprozessen.")
    with col_hero3:
        st.markdown("#### 📱 Eigenständig im Broker handeln")
        st.write("Die App hilft dir bei der Entscheidung – investieren tust du wie gewohnt in deiner eigenen App (Trade Republic, Scalable, etc.).")

else:
    data = st.session_state.last_analysis
    asset = data["asset_info"]
    chart = data["chart_model"]
    crisis = data["crisis_model"]
    mc = data["monte_carlo"]
    rolling = data["rolling_returns"]
    backtest = data["backtest"]
    fund = data.get("fundamental", {})
    df_hist = data["history_df"]

    # KOPFZEILE MIT TITEL & KURS
    st.title(f"📊 Analyse: {asset.get('name', data['ticker'])}")
    sub_col1, sub_col2, sub_col3 = st.columns([2, 1, 1])
    with sub_col1:
        st.caption(f"**Typ:** {asset.get('typ', 'Wertpapier')} | **Symbol:** `{data['ticker']}` | **ISIN:** `{asset.get('isin', '–')}`")
    with sub_col2:
        st.metric("Aktueller Kurs", f"{data['current_price']:.2f} €")
    with sub_col3:
        st.metric("Gewählte Haltedauer", data["timeframe_label"].split(" ")[0] + " " + data["timeframe_label"].split(" ")[1])

    st.markdown("---")

    # ABSCHNITT 1: DIE EINFACHE AMPEL & TRENDBEWERTUNG
    st.subheader("1. 🚦 Marktregime & Trendbewertung")
    emoji, color, title = get_traffic_light(chart["score"])
    
    if chart["score"] > 15:
        st.success(f"{emoji} **{title}** (Chart-Score: +{chart['score']}%) \n\n{chart['summary']}")
    elif chart["score"] < -15:
        st.error(f"{emoji} **{title}** (Chart-Score: {chart['score']}%) \n\n{chart['summary']}")
    else:
        st.warning(f"{emoji} **{title}** (Chart-Score: {chart['score']}%) \n\n{chart['summary']}")

    with st.expander("🔍 Warum vergibt das Modell diesen Score? (Klick für Details)"):
        for sig in chart["signals"]:
            st.markdown(f"- {sig}")

    st.markdown("---")

    # ABSCHNITT 2: DER ECHTE HISTORISCHE CHART MIT INDIKATOREN (NEU!)
    st.subheader("2. 📈 Realer Kursverlauf & Trendlinien (Letzte 1,5 Jahre)")
    st.caption("Verstehe das Chartbild: Blaue 200-Tage-Linie zeigt den Haupttrend. Gelbe 50-Tage-Linie zeigt den mittelfristigen Schwung.")

    # Letzte 380 Handelstage für eine saubere, hochauflösende Ansicht
    plot_df = df_hist.iloc[-380:].copy() if len(df_hist) > 380 else df_hist.copy()
    
    # Indikatoren berechnen
    ma50 = plot_df['Close'].rolling(window=50).mean()
    ma200 = plot_df['Close'].rolling(window=200).mean() if len(df_hist) >= 200 else None
    dc_high = plot_df['High'].rolling(window=20).max()
    dc_low = plot_df['Low'].rolling(window=20).min()

    fig_hist = go.Figure()

    # Donchian Kanal (schattierter Korridor)
    fig_hist.add_trace(go.Scatter(
        x=plot_df.index, y=dc_high,
        line=dict(color="rgba(100, 116, 139, 0.3)", width=1, dash="dot"),
        name="Donchian Band Oben",
        hoverinfo="skip"
    ))
    fig_hist.add_trace(go.Scatter(
        x=plot_df.index, y=dc_low,
        line=dict(color="rgba(100, 116, 139, 0.3)", width=1, dash="dot"),
        fill='tonexty',
        fillcolor='rgba(148, 163, 184, 0.05)',
        name="Donchian Kanal (20T)",
        hoverinfo="skip"
    ))

    # Kursverlauf
    fig_hist.add_trace(go.Scatter(
        x=plot_df.index, y=plot_df['Close'],
        mode="lines",
        line=dict(color="#38bdf8", width=2.5),
        name=f"Kurs ({data['ticker']})",
        hovertemplate="%{x|%d.%m.%Y}: <b>%{y:.2f} €</b><extra></extra>"
    ))

    # 50-Tage-Linie
    fig_hist.add_trace(go.Scatter(
        x=plot_df.index, y=ma50,
        mode="lines",
        line=dict(color="#facc15", width=1.5),
        name="GD50 (50-Tage-Linie)",
        hovertemplate="GD50: %{y:.2f} €<extra></extra>"
    ))

    # 200-Tage-Linie
    if ma200 is not None and not ma200.dropna().empty:
        fig_hist.add_trace(go.Scatter(
            x=plot_df.index, y=ma200,
            mode="lines",
            line=dict(color="#818cf8", width=2, dash="dash"),
            name="GD200 (200-Tage-Linie)",
            hovertemplate="GD200: %{y:.2f} €<extra></extra>"
        ))

    fig_hist.update_layout(
        height=420,
        margin=dict(l=10, r=10, t=20, b=10),
        xaxis_title="Datum",
        yaxis_title="Kurs (€)",
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    st.plotly_chart(fig_hist, use_container_width=True)

    st.markdown("---")

    # ABSCHNITT 3: FUNDAMENTALER BEWERTUNGS-CHECK
    st.subheader("3. 🏛️ Fundamentale Bewertung (KGV & Kennzahlen)")
    st.write(f"**Einstufung:** *{fund.get('valuation_status', '–')}* — {fund.get('summary', '')}")
    
    fund_metrics = fund.get("metrics", {})
    if fund_metrics:
        fcols = st.columns(len(fund_metrics))
        for idx, (m_label, m_val) in enumerate(fund_metrics.items()):
            with fcols[idx]:
                st.metric(m_label, m_val)

    if fund.get("drift_adjustment", 0.0) != 0.0:
        st.caption(f"💡 **Mathematische Drift-Kopplung:** Aufgrund der aktuellen Bewertung fließt ein Anpassungsfaktor von **{fund['drift_adjustment']*100:+.2f}% p.a.** in die langfristige Simulation ein.")

    st.markdown("---")

    # ABSCHNITT 4: FINANZMATHEMATISCHE HOCHRECHNUNG IN EURO
    st.subheader("4. 💵 Hochrechnung für dein Kapital")
    st.caption("Was wird voraussichtlich aus deinem Geld? (Median-Erwartung aus 5.000 Pfaden mit Merton Jump-Diffusion)")
    
    mcol1, mcol2, mcol3 = st.columns(3)
    with mcol1:
        st.metric("Eingezahltes Kapital", format_euro(mc["eingezahltes_kapital"]))
    with mcol2:
        sign = "+" if mc["erwarteter_gewinn"] > 0 else ""
        st.metric(
            "Erwarteter Reingewinn (Median)", 
            f"{sign}{format_euro(mc['erwarteter_gewinn'])}", 
            delta=f"{format_percent(mc['expected_return_pct'], show_sign=True)} Rendite"
        )
    with mcol3:
        st.metric("Erwarteter Depot-Endwert", format_euro(mc["erwarteter_endwert"]))

    # Renditekorridor für Einsteiger
    st.markdown("##### 🎯 Möglicher Wertkorridor (Pessimistisch bis Optimistisch):")
    kcol1, kcol2, kcol3 = st.columns(3)
    with kcol1:
        st.markdown(f"🌧️ **Schwacher Marktverlauf (Worst-Case / 10%):** `{format_euro(mc['pessimistisch_endwert'])}`")
    with kcol2:
        st.markdown(f"⛅ **Realistischer Erwartungswert (Median):** `{format_euro(mc['erwarteter_endwert'])}`")
    with kcol3:
        st.markdown(f"☀️ **Starker Marktverlauf (Best-Case / 90%):** `{format_euro(mc['optimistisch_endwert'])}`")

    st.markdown("---")

    # ABSCHNITT 5: WAHRSCHEINLICHKEITEN & NEUE SCHUTZKENNZAHLEN
    st.subheader("5. 🔮 Wahrscheinlichkeitsverteilung & Risikoprofil")
    p_up = int(mc["prob_up"])
    p_flat = int(mc["prob_flat"])
    p_down = int(mc["prob_down"])

    wcol1, wcol2, wcol3 = st.columns(3)
    with wcol1:
        st.markdown(f"**📈 Wahrscheinlichkeit für Kursgewinn:** `{p_up}%`")
        st.progress(p_up)
        st.caption("Anteil der Simulationspfade, die im Plus schließen.")
    with wcol2:
        st.markdown(f"**🔄 Wahrscheinlichkeit für Seitwärts-Verlauf:** `{p_flat}%`")
        st.progress(p_flat)
        st.caption("Pfade mit minimaler Veränderung um die Nulllinie.")
    with wcol3:
        st.markdown(f"**📉 Statistisches Verlustrisiko:** `{p_down}%`")
        st.progress(p_down)
        st.caption("Pfade unter Einstandswert (inkl. Fat-Tail-Crashschocks).")

    # NEUE QUANT-SCHUTZKENNZAHLEN: Sortino, CVaR 95%, EWMA-Vola & Beta
    st.markdown("##### 🛡️ Erweiterte Risikomaßstäbe (Quant-Präzision):")
    rcol1, rcol2, rcol3 = st.columns(3)
    with rcol1:
        sortino_val = mc.get("sortino_ratio", 1.0)
        sortino_text = "Hervorragend" if sortino_val > 1.8 else ("Solide" if sortino_val > 1.0 else "Erhöhtes Abwärtsrisiko")
        st.metric("Sortino-Ratio", f"{sortino_val:.2f}", delta=sortino_text)
        st.caption("Misst die Rendite im Verhältnis zu *ausschließlich schädlicher Verlustvolatilität*.")
    with rcol2:
        cvar_pct = mc.get("cvar_95_pct", -20.0)
        cvar_euro = mc.get("cvar_95_euro", 0.0)
        st.metric("Expected Shortfall (CVaR 95%)", f"{cvar_pct:.1f}%", delta=f"-{format_euro(cvar_euro)}", delta_color="inverse")
        st.caption("Durchschnittlicher Verlust in den *schlimmsten 5 % aller Extremszenarien*.")
    with rcol3:
        ewma_v = mc.get("ewma_volatility_pct", 15.0)
        hist_v = mc.get("hist_volatility_pct", 15.0)
        st.metric("Tagesaktuelle Nervosität (EWMA)", f"{ewma_v:.1f}% p.a.", delta=f"{ewma_v - hist_v:+.1f}% vs. 10J-Schnitt", delta_color="off")
        st.caption(f"Markt-Beta: **{data.get('beta', 1.0):.2f}** (Sensitivität gegenüber Weltmarkt).")

    if rolling["win_rate_pct"] is not None:
        st.info(f"📊 **Historische Kontrollprüfung:** In den letzten {rolling['num_periods']} geprüften Zeiträumen lag man bei exakt dieser Haltedauer zu **{rolling['win_rate_pct']}%** im Gewinn! ({rolling['summary']})")

    st.markdown("---")

    # ABSCHNITT 6: DER HISTORISCHE KRISEN- & CRASH-TEST
    st.subheader("6. 🛡️ Historischer Krisen- & Stresstest")
    st.markdown(
        "Wie hat sich diese Aktie / dieser ETF verhalten, als die Weltwirtschaft in Panik geriet? "
        "Für jüngere Wertpapiere berechnet HAVN automatisch eine synthetische Simulation über das Markt-Beta."
    )
    st.write(f"**Gesamteinschätzung:** *{crisis['summary']}*")

    crisis_items = crisis.get("results", {})
    if crisis_items:
        ccols = st.columns(len(crisis_items))
        for idx, (c_name, c_data) in enumerate(crisis_items.items()):
            with ccols[idx]:
                st.markdown(f"**{c_name}**")
                st.caption(c_data["beschreibung"])
                if c_data.get("verfuegbar"):
                    dd = c_data["max_drawdown_pct"]
                    ret = c_data["gesamt_rendite_pct"]
                    rec = "✅ Ja" if c_data["erholung_erfolgt"] else "⏳ Länger dauernd"
                    is_synth = c_data.get("is_synthetic", False)
                    status_badge = "🧪 Synthetisch (Beta)" if is_synth else "🏛️ Reale Marktdaten"
                    st.write(f"**Status:** `{status_badge}`")
                    st.write(f"📉 **Max. Verlust:** `{dd:.1f}%`")
                    st.write(f"🏁 **Gesamtrendite:** `{format_percent(ret, show_sign=True)}`")
                    st.write(f"🔄 **Erholt im Zeitraum:** {rec}")
                    if is_synth:
                        st.caption(c_data.get("hinweis", ""))
                else:
                    st.caption("⚠️ " + c_data.get("hinweis", "Keine Daten"))

    st.markdown("---")

    # ABSCHNITT 7: FÄCHER-CHART DER SIMULIERTEN ZUKUNFTSPFADE
    st.subheader("7. 📉 Interaktiver Simulationsfächer (Plotly)")
    st.caption("Visualisierung von 40 repräsentativen Preispfaden aus der Merton Jump-Diffusion inklusive Median-Entwicklung (Gelb).")
    
    fig = go.Figure()
    paths = mc.get("sample_paths", [])
    for p in paths:
        fig.add_trace(go.Scatter(
            y=p,
            mode="lines",
            line=dict(width=1, color="rgba(70, 130, 220, 0.25)"),
            showlegend=False,
            hoverinfo="skip"
        ))
    if "median_path" in mc:
        fig.add_trace(go.Scatter(
            y=mc["median_path"],
            mode="lines",
            line=dict(width=3, color="#facc15"),
            name="Erwarteter Verlauf (Median)",
            hovertemplate="Schritt %{x}: %{y:.2f} €<extra></extra>"
        ))
    fig.update_layout(
        height=380,
        margin=dict(l=10, r=10, t=10, b=10),
        xaxis_title="Handelstage in die Zukunft",
        yaxis_title="Simulierter Kurs (€)",
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    # ABSCHNITT 8: DER BROKER-LEITFADEN
    render_broker_instructions(asset, data["investment_type"], data["sparplan_frequenz"], data["kapital_input"])

    # ABSCHNITT 9: EXPERTEN-MODUS (AUFKLAPPBAR)
    with st.expander("🔬 Experten-Modus: Mathematische Modelle & Backtest-Details"):
        jp = mc.get("jump_params", {})
        st.markdown(f"""
        ### Verwendete Quant-Modelle & Parameter:
        - **Merton Jump-Diffusion Prozess (Empirisch kalibriert):**
          $$dS_t = (\\mu - \\lambda k) S_t\\, dt + \\sigma S_t\\, dW_t + J\\, dN_t$$
          - Kalibrierte Schockfrequenz ($\\lambda$): `{jp.get('lambda_per_year', 0.6)} Schocks/Jahr`
          - Mittlere Schockhöhe ($\\mu_J$): `{jp.get('mean_shock_pct', -5.0)}%`
          - Schock-Volatilität ($\\sigma_J$): `{jp.get('shock_std_pct', 8.0)}%`
        - **Dynamische EWMA-Volatilität:** `{mc.get('ewma_volatility_pct', 0)}% p.a.` (Kombiniert: `{mc['annualized_volatility_pct']}% p.a.`)
        - **Markt-Beta $\\beta$:** `{data.get('beta', 1.0):.2f}` (Kopplung an CAPM-Gleichgewicht)
        - **Fundamentaler Bewertungs-Drift:** `{fund.get('drift_adjustment', 0)*100:+.2f}% p.a.`
        - **Kausaler Backtest:** {backtest['status_text']}
        - **ATR-Regime:** {chart['indicators'].get('Marktumfeld', '–')} (ATR 14: `{chart['indicators'].get('ATR (14 Tage)', 0)} €`)
        - **Donchian-Kanal:** Hoch `{chart['indicators'].get(list(chart['indicators'].keys())[3], 0)} €` | Tief `{chart['indicators'].get(list(chart['indicators'].keys())[4], 0)} €`
        """)

    # ABSCHNITT 10: DISCLAIMER
    st.markdown("---")
    st.caption(
        "⚠️ **Rechtlicher Hinweis:** Die HAVN-App stellt keine Anlageberatung im Sinne des WpHG dar. "
        "Alle Berechnungen basieren auf historischen Wahrscheinlichkeitsmodellen und Simulationen. "
        "Wertpapiere unterliegen Marktschwankungen bis hin zum Totalverlustrisiko."
    )
