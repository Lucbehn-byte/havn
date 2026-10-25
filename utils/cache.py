"""
Thread-safe In-Memory Cache mit TTL (Time-To-Live).
Schützt externe APIs (wie yfinance) vor Rate-Limits und ermöglicht Sub-10ms-Antwortzeiten.
"""
import time
import threading
from typing import Any, Optional, Dict, Tuple


class MemoryCache:
    def __init__(self, default_ttl_seconds: int = 900):
        """
        :param default_ttl_seconds: Standard-Ablaufzeit in Sekunden (Default: 15 Minuten = 900s)
        """
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        """Holt ein Element aus dem Cache, sofern es noch nicht abgelaufen ist."""
        now = time.time()
        with self._lock:
            if key in self._cache:
                expires_at, value = self._cache[key]
                if now < expires_at:
                    self.hits += 1
                    return value
                else:
                    # Abgelaufen -> Entfernen
                    del self._cache[key]
            self.misses += 1
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Speichert ein Element mit definierter Lebensdauer im Cache."""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = time.time() + ttl
        with self._lock:
            self._cache[key] = (expires_at, value)
            # Seltene Bereinigung bei über 500 Einträgen
            if len(self._cache) > 500:
                self._cleanup_locked()

    def delete(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    def _cleanup_locked(self) -> None:
        """Interne Bereinigung abgelaufener Schlüssel."""
        now = time.time()
        expired_keys = [k for k, (exp, _) in self._cache.items() if now >= exp]
        for k in expired_keys:
            del self._cache[k]

    def get_stats(self) -> Dict[str, Any]:
        """Gibt Cache-Leistungsdaten zurück."""
        with self._lock:
            now = time.time()
            active_items = sum(1 for exp, _ in self._cache.values() if now < exp)
            total_req = self.hits + self.misses
            hit_ratio = round((self.hits / total_req * 100), 1) if total_req > 0 else 0.0
            return {
                "active_entries": active_items,
                "hits": self.hits,
                "misses": self.misses,
                "hit_ratio_percent": hit_ratio,
                "default_ttl_minutes": round(self.default_ttl / 60, 1)
            }


# Globaler 15-Minuten Cache
memory_cache = MemoryCache(default_ttl_seconds=900)
