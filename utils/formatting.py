"""
Hilfsfunktionen für deutsche Zahlenformatierung und optische Ampelsignale.
"""

def format_euro(value: float) -> str:
    """Formatiert einen Float-Wert als deutschen Euro-String (z. B. 1.250,50 €)."""
    if value is None:
        return "–"
    return f"{value:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def format_percent(value: float, show_sign: bool = False) -> str:
    """Formatiert Prozentwerte mit deutscher Kommasetzung."""
    if value is None:
        return "–"
    sign = "+" if show_sign and value > 0 else ""
    return f"{sign}{value:.1f}%".replace(".", ",")


def get_traffic_light(score: float) -> tuple[str, str, str]:
    """
    Liefert Ampelfarbe, Emoji und verständliche Einordnung für den Modell-Score.
    
    Rückgabe:
        (emoji, color_name, title)
    """
    if score > 15:
        return ("🟢", "green", "Grünes Licht: Bullischer Trend & Kaufsignale überwiegen")
    elif score < -15:
        return ("🔴", "red", "Erhöhte Vorsicht: Abwärtstrend oder Verkaufsdruck aktiv")
    else:
        return ("🟡", "orange", "Gelbe Phase: Seitwärtsbewegung / Neutrale Konsolidierung")
