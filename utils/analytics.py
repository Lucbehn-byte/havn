"""
DSGVO-konformes, cookiefreies Analytics-Modul für HAVN.
Zählt Besucher, Seitenaufrufe, Menüreiter-Nutzung, beliebteste Aktien und Gerätetypen.
Aktualisiert automatisch das interne Dashboard in der README.md.
"""
import os
import json
import time
import hashlib
import threading
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
ANALYTICS_FILE = os.path.join(ROOT_DIR, "analytics_store.json")
README_FILE = os.path.join(ROOT_DIR, "README.md")

TAB_NAMES = {
    "terminal": "⚓ Hafen (Hauptanalyse Basic & Pro)",
    "crisis": "⚡ Sturm (Krisensimulator & Stresstest)",
    "battle": "⚔️ Duell (Asset-Battle)",
    "goals": "🧭 Kompass (Sparziel-Planer)",
    "academy": "📖 Logbuch (Finanzakademie)",
}

class AnalyticsEngine:
    def __init__(self, storage_path: str = ANALYTICS_FILE, readme_path: str = README_FILE):
        self.storage_path = storage_path
        self.readme_path = readme_path
        self._lock = threading.Lock()
        self.data: Dict[str, Any] = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Sicherstellen, dass 'tabs' existiert
                    if "tabs" not in data:
                        data["tabs"] = {}
                    return data
            except Exception as e:
                print(f"[Analytics] Fehler beim Laden der Datei: {e}")
        
        # Initiale Struktur
        return {
            "total_pageviews": 0,
            "total_uniques": 0,
            "days": {},            # "YYYY-MM-DD": {"views": 10, "uniques": [...], "devices": {...}, "tabs": {...}}
            "top_tickers": {},     # "AAPL": 42
            "top_searches": {},    # "msci world": 12
            "tabs": {              # "terminal": 120, "crisis": 30, etc.
                "terminal": 0,
                "crisis": 0,
                "battle": 0,
                "goals": 0,
                "academy": 0
            },
            "devices_overall": {
                "ios": 0,
                "android": 0,
                "desktop": 0
            }
        }

    def _save(self) -> None:
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            self._update_readme_locked()
        except Exception as e:
            print(f"[Analytics] Fehler beim Speichern: {e}")

    def _hash_ip(self, ip: str, today_str: str) -> str:
        """Erzeugt einen tagesgebundenen, irreversiblen Hash zur Erkennung eindeutiger Tagesbesucher."""
        salt = f"havn_salt_{today_str}"
        return hashlib.sha256(f"{salt}_{ip}".encode()).hexdigest()[:16]

    def record_visit(self, ip: str, user_agent: str = "", path: str = "/") -> None:
        """Registriert einen Seitenaufruf anonymisiert."""
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        ip_hash = self._hash_ip(ip, today_str)

        # Gerätetyp bestimmen
        ua_lower = user_agent.lower()
        if "iphone" in ua_lower or "ipad" in ua_lower:
            device = "ios"
        elif "android" in ua_lower:
            device = "android"
        else:
            device = "desktop"

        with self._lock:
            self.data["total_pageviews"] += 1

            # Tag initialisieren falls neu
            if today_str not in self.data["days"]:
                self.data["days"][today_str] = {
                    "views": 0,
                    "uniques": [],
                    "devices": {"ios": 0, "android": 0, "desktop": 0},
                    "tabs": {"terminal": 0, "crisis": 0, "battle": 0, "goals": 0, "academy": 0}
                }

            day_data = self.data["days"][today_str]
            day_data["views"] += 1

            if ip_hash not in day_data["uniques"]:
                day_data["uniques"].append(ip_hash)
                self.data["total_uniques"] += 1

            day_data["devices"][device] = day_data["devices"].get(device, 0) + 1
            self.data["devices_overall"][device] = self.data["devices_overall"].get(device, 0) + 1

            # Bereinigung auf letzte 35 Tage
            if len(self.data["days"]) > 35:
                sorted_days = sorted(self.data["days"].keys())
                for old_day in sorted_days[:-30]:
                    del self.data["days"][old_day]

            self._save()

    def record_tab_view(self, tab_id: str, ip: str = "", user_agent: str = "") -> None:
        """Erfasst, auf welchem Menüreiter sich der Nutzer befindet."""
        clean_tab = tab_id.lower().strip()
        today_str = datetime.utcnow().strftime("%Y-%m-%d")

        with self._lock:
            if "tabs" not in self.data:
                self.data["tabs"] = {}
            self.data["tabs"][clean_tab] = self.data["tabs"].get(clean_tab, 0) + 1

            # Auch im Tagesverlauf erfassen
            if today_str in self.data["days"]:
                day_tabs = self.data["days"][today_str].setdefault("tabs", {})
                day_tabs[clean_tab] = day_tabs.get(clean_tab, 0) + 1

            self._save()

    def record_ticker_analysis(self, ticker: str) -> None:
        """Erfasst, welche Wertpapiere analysiert werden."""
        clean = ticker.upper().strip()
        with self._lock:
            self.data["top_tickers"][clean] = self.data["top_tickers"].get(clean, 0) + 1
            self._save()

    def record_search(self, query: str) -> None:
        """Erfasst beliebte Suchbegriffe."""
        q = query.strip().lower()
        if len(q) < 2:
            return
        with self._lock:
            self.data["top_searches"][q] = self.data["top_searches"].get(q, 0) + 1
            self._save()

    def get_stats_summary(self) -> Dict[str, Any]:
        """Liefert eine aufbereitete Übersicht für das Dashboard."""
        with self._lock:
            today_str = datetime.utcnow().strftime("%Y-%m-%d")
            today_data = self.data["days"].get(today_str, {"views": 0, "uniques": [], "devices": {}, "tabs": {}})
            today_views = today_data["views"]
            today_uniques = len(today_data["uniques"])

            # Verlauf der letzten 14 Tage aufbereiten
            history_14d = []
            today_dt = date.today()
            for i in range(13, -1, -1):
                day_key = (today_dt - timedelta(days=i)).strftime("%Y-%m-%d")
                d_entry = self.data["days"].get(day_key, {"views": 0, "uniques": []})
                history_14d.append({
                    "date": day_key,
                    "label": (today_dt - timedelta(days=i)).strftime("%d.%m."),
                    "views": d_entry.get("views", 0),
                    "uniques": len(d_entry.get("uniques", []))
                })

            # Top 10 Ticker sortieren
            sorted_tickers = sorted(
                [{"ticker": k, "count": v} for k, v in self.data["top_tickers"].items()],
                key=lambda x: x["count"],
                reverse=True
            )[:10]

            # Top 10 Suchen sortieren
            sorted_searches = sorted(
                [{"query": k, "count": v} for k, v in self.data["top_searches"].items()],
                key=lambda x: x["count"],
                reverse=True
            )[:10]

            return {
                "today": {
                    "views": today_views,
                    "uniques": today_uniques,
                    "date": today_str
                },
                "total": {
                    "views": self.data["total_pageviews"],
                    "uniques": self.data["total_uniques"]
                },
                "tabs": self.data.get("tabs", {}),
                "devices": self.data["devices_overall"],
                "recent_days": history_14d,
                "top_tickers": sorted_tickers,
                "top_searches": sorted_searches,
            }

    def _generate_markdown_report(self) -> str:
        """Erstellt den formatierten Markdown-Report für die README.md."""
        from utils.cache import memory_cache
        cache_stats = memory_cache.get_stats()

        today_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        today_date = datetime.utcnow().strftime("%Y-%m-%d")
        today_data = self.data["days"].get(today_date, {"views": 0, "uniques": [], "devices": {}})
        today_views = today_data["views"]
        today_uniques = len(today_data["uniques"])

        tot_views = self.data["total_pageviews"]
        tot_uniques = self.data["total_uniques"]

        # Menüreiter
        tabs_data = self.data.get("tabs", {})
        total_tab_clicks = sum(tabs_data.values()) or 1
        tabs_lines = []
        for tab_key, tab_title in TAB_NAMES.items():
            cnt = tabs_data.get(tab_key, 0)
            pct = round((cnt / total_tab_clicks) * 100, 1)
            bar_len = int(pct / 10)
            bar_vis = "█" * bar_len + "░" * (10 - bar_len)
            tabs_lines.append(f"| **{tab_title}** | `{cnt}` | `{pct} %` | `{bar_vis}` |")

        # Geräteverteilung
        devices = self.data["devices_overall"]
        tot_dev = sum(devices.values()) or 1
        ios_pct = round((devices.get("ios", 0) / tot_dev) * 100, 1)
        android_pct = round((devices.get("android", 0) / tot_dev) * 100, 1)
        desktop_pct = round((devices.get("desktop", 0) / tot_dev) * 100, 1)

        # 14-Tage Trend
        today_dt = date.today()
        history_lines = []
        max_views = 1
        for i in range(13, -1, -1):
            d_key = (today_dt - timedelta(days=i)).strftime("%Y-%m-%d")
            v = self.data["days"].get(d_key, {}).get("views", 0)
            if v > max_views:
                max_views = v

        for i in range(13, -1, -1):
            d_dt = today_dt - timedelta(days=i)
            d_key = d_dt.strftime("%Y-%m-%d")
            d_label = d_dt.strftime("%d.%m.")
            d_entry = self.data["days"].get(d_key, {"views": 0, "uniques": []})
            v = d_entry.get("views", 0)
            u = len(d_entry.get("uniques", []))
            
            # Balkenlänge max 20 Zeichen
            bar_len = int((v / max_views) * 20) if max_views > 0 else 0
            bar = "█" * bar_len if v > 0 else "·"
            history_lines.append(f"{d_label}    {str(u):<10} {str(v):<10} {bar} ({v})")

        history_block = "\n".join(history_lines)

        # Beliebteste Aktien
        sorted_tickers = sorted(
            [f"`{k}` ({v}x)" for k, v in self.data["top_tickers"].items()],
            key=lambda x: int(x.split("(")[1].split("x")[0]),
            reverse=True
        )[:8]
        top_tickers_str = ", ".join(sorted_tickers) if sorted_tickers else "Noch keine Analysen"

        sorted_searches = sorted(
            [f"„{k}“ ({v}x)" for k, v in self.data["top_searches"].items()],
            key=lambda x: int(x.split("(")[1].split("x")[0]),
            reverse=True
        )[:6]
        top_searches_str = ", ".join(sorted_searches) if sorted_searches else "Noch keine Suchanfragen"

        report = f"""<!-- HAVN_STATS_START -->
## 📊 HAVN Live-Analytics (Internes Admin-Dashboard)

> *Automatisch aktualisiert am: **{today_str}** • Nur im Code / Repository sichtbar (nicht öffentlich im Web).*

### 👥 1. Besucher & Aufrufe
| Metrik | Heute | Gesamt (All-Time) |
| :--- | :--- | :--- |
| **Eindeutige Besucher (Uniques)** | **{today_uniques}** | **{tot_uniques}** |
| **Seiten- & Interaktions-Aufrufe** | **{today_views}** | **{tot_views}** |

---

### 🧭 2. Menüreiter-Nutzung (Wo verbringen Nutzer Zeit?)
| Menüreiter | Aufrufe | Anteil | Verteilung |
| :--- | :--- | :--- | :--- |
{chr(10).join(tabs_lines)}

---

### 📱 3. Geräte-Quote
* ** iPhone / iPad (iOS):** `{ios_pct} %` ({devices.get('ios', 0)} Aufrufe)
* **💻 Desktop (PC / Mac):** `{desktop_pct} %` ({devices.get('desktop', 0)} Aufrufe)
* **🤖 Android:** `{android_pct} %` ({devices.get('android', 0)} Aufrufe)

---

### 📈 4. 14-Tage-Aktivitätstrend
```text
Datum     Besucher   Aufrufe    Verlauf
------------------------------------------------------------
{history_block}
```

---

### 🏆 5. Beliebteste Wertpapiere & Suchbegriffe
* **Meistgesuchte Ticker:** {top_tickers_str}
* **Häufigste Suchbegriffe:** {top_searches_str}

---

### ⚡ 6. 15-Minuten In-Memory Cache Performance
* **Cache Hits (eingesparte Anfragen):** `{cache_stats.get('hits', 0)}`
* **Aktive Einträge im RAM:** `{cache_stats.get('active_entries', 0)}`
* **Erfolgsquote (Hit-Ratio):** `{cache_stats.get('hit_ratio_percent', 0.0)} %` der Anfragen blitzschnell aus dem RAM bedient
<!-- HAVN_STATS_END -->"""
        return report

    def _update_readme_locked(self) -> None:
        """Schreibt den aktuellen Report in die README.md zwischen die Marker."""
        if not os.path.exists(self.readme_path):
            return

        try:
            with open(self.readme_path, "r", encoding="utf-8") as f:
                content = f.read()

            start_marker = "<!-- HAVN_STATS_START -->"
            end_marker = "<!-- HAVN_STATS_END -->"

            report = self._generate_markdown_report()

            if start_marker in content and end_marker in content:
                # Vorhandenen Block ersetzen
                before = content.split(start_marker)[0]
                after = content.split(end_marker)[1]
                new_content = before + report + after
            else:
                # An das Ende anhängen
                new_content = content.rstrip() + "\n\n" + report + "\n"

            with open(self.readme_path, "w", encoding="utf-8") as f:
                f.write(new_content)
        except Exception as e:
            print(f"[Analytics] Fehler beim Aktualisieren der README.md: {e}")

    def sync_readme(self) -> None:
        """Öffentliche Methode zum manuellen Aktualisieren der README.md."""
        with self._lock:
            self._update_readme_locked()


# Singleton Instanz
analytics_engine = AnalyticsEngine()
