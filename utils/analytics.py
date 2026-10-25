"""
DSGVO-konformes, cookiefreies Analytics-Modul für HAVN.
Zählt Besucher, Seitenaufrufe, beliebteste Aktien und Gerätetypen ohne Speicherung von Klardaten.
"""
import os
import json
import time
import hashlib
import threading
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

ANALYTICS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "analytics_store.json")

class AnalyticsEngine:
    def __init__(self, storage_path: str = ANALYTICS_FILE):
        self.storage_path = storage_path
        self._lock = threading.Lock()
        self.data: Dict[str, Any] = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[Analytics] Fehler beim Laden der Datei: {e}")
        
        # Initiale Struktur
        return {
            "total_pageviews": 0,
            "total_uniques": 0,
            "days": {},            # "YYYY-MM-DD": {"views": 10, "uniques": ["hash1", "hash2"], "devices": {"mobile": 5, "desktop": 5}}
            "top_tickers": {},     # "AAPL": 42
            "top_searches": {},    # "msci world": 12
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
        except Exception as e:
            print(f"[Analytics] Fehler beim Speichern: {e}")

    def _hash_ip(self, ip: str, today_str: str) -> str:
        """Erzeugt einen tagesgebundenen, irreversiblen Hash zur Erkennung eindeutiger Tagesbesucher."""
        # Salt mit Tagesdatum sorgt dafür, dass IP-Adressen nicht über Tage hinweg verfolgt werden können (DSGVO Art. 5)
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
                    "devices": {"ios": 0, "android": 0, "desktop": 0}
                }

            day_data = self.data["days"][today_str]
            day_data["views"] += 1

            if ip_hash not in day_data["uniques"]:
                day_data["uniques"].append(ip_hash)
                self.data["total_uniques"] += 1

            day_data["devices"][device] = day_data["devices"].get(device, 0) + 1
            self.data["devices_overall"][device] = self.data["devices_overall"].get(device, 0) + 1

            # Nur die letzten 30 Tage im Speicher halten
            if len(self.data["days"]) > 35:
                sorted_days = sorted(self.data["days"].keys())
                for old_day in sorted_days[:-30]:
                    del self.data["days"][old_day]

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
            today_data = self.data["days"].get(today_str, {"views": 0, "uniques": [], "devices": {}})
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
                "devices": self.data["devices_overall"],
                "recent_days": history_14d,
                "top_tickers": sorted_tickers,
                "top_searches": sorted_searches,
            }


# Singleton Instanz
analytics_engine = AnalyticsEngine()
