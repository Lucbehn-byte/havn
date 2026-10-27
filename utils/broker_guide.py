"""
Leitfaden und Praxistipps für die Umsetzung im eigenen Broker.
Schlägt die Brücke zwischen der Analyse und Neobrokern wie Trade Republic, Scalable Capital etc.
"""
try:
    import streamlit as st
except ImportError:
    st = None


def render_broker_instructions(asset_info: dict, investment_type: str, sparplan_frequenz: str, kapital: float) -> None:
    """
    Rendert eine übersichtliche Handlungsanleitung für Einsteiger,
    um die Analyse sicher in der eigenen Trading-App umzusetzen.
    """
    st.subheader("📱 Nächster Schritt: In deiner Trading-App umsetzen")
    
    st.markdown(
        "Diese App ist ein reines Analyse- und Orientierungswerkzeug. "
        "Du kaufst Wertpapiere niemals hier, sondern sicher über dein eigenes Depot bei deiner Bank oder deinem Broker "
        "(z. B. **Trade Republic, Scalable Capital, ING, Neobroker, Consorsbank, DKB**)."
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### 🔍 Kennnummern für deine Suche:")
        st.markdown(f"- **Name:** `{asset_info.get('name', '–')}`")
        st.markdown(f"- **WKN:** `{asset_info.get('wkn', '–')}`")
        st.markdown(f"- **ISIN:** `{asset_info.get('isin', '–')}`")
        st.markdown(f"- **Börsensymbol (Ticker):** `{asset_info.get('ticker', '–')}`")
        st.caption("💡 Tipp: Suche im Broker am besten direkt nach der **ISIN** oder **WKN**, um Verwechslungen auszuschließen.")

    with col2:
        st.markdown("#### 🛡️ Die 3 goldenen Einsteiger-Regeln:")
        st.markdown("""
        1. **Immer mit Limit-Order kaufen:** Wähle nicht *'Billigst/Market'*, sondern setze ein Limit knapp über dem aktuellen Kurs. Das schützt vor plötzlichen Preissprüngen.
        2. **Zur richtigen Uhrzeit handeln:** Kaufe an Werktagen zwischen **09:00 und 17:30 Uhr** (wenn die deutsche Leitbörse Xetra geöffnet ist). Außerhalb dieser Zeiten zahlst du oft höhere Gebühren (Spread).
        3. **Langfristig denken:** Lass dich von zwischenzeitlichen roten Tagen nicht verunsichern – Kursschwankungen gehören zum Börsenalltag.
        """)

    if investment_type == "Sparplan":
        st.success(
            f"💡 **Sparplan-Empfehlung:** Richte in deiner Broker-App einen automatischen "
            f"Sparplan über **{kapital:.2f} € ({sparplan_frequenz})** ein. "
            "Dadurch investierst du vollautomatisch und nutzt den Cost-Average-Effekt bei zwischenzeitlichen Kursrücksetzern optimal."
        )
