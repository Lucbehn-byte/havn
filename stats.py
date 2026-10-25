#!/usr/bin/env python3
"""
HAVN Admin Analytics CLI
Zeigt aktuelle Besucher-, Menüreiter- und Cache-Statistiken im Terminal an
und synchronisiert sie sofort in die README.md.
"""
from utils.analytics import analytics_engine
from utils.cache import memory_cache

def main():
    analytics_engine.sync_readme()
    summary = analytics_engine.get_stats_summary()
    cache_info = memory_cache.get_stats()

    print("\n" + "=" * 60)
    print("⚓ HAVN INTERNES ADMIN-DASHBOARD (DSGVO-KONFORM)")
    print("=" * 60)
    print(f"👥 BESUCHER HEUTE:  {summary['today']['uniques']} Uniques | {summary['today']['views']} Aufrufe")
    print(f"🌐 GESAMT ALL-TIME: {summary['total']['uniques']} Uniques | {summary['total']['views']} Aufrufe")
    print("-" * 60)
    print("🧭 MENÜREITER-VERTEILUNG:")
    tabs = summary.get("tabs", {})
    total_tabs = sum(tabs.values()) or 1
    for t_id, count in tabs.items():
        pct = round((count / total_tabs) * 100, 1)
        print(f"  • {t_id:<12}: {count:>4} Aufrufe ({pct:>5.1f} %)")
    print("-" * 60)
    print("📱 GERÄTE:")
    dev = summary["devices"]
    tot_d = sum(dev.values()) or 1
    print(f"  • iOS (iPhone/iPad): {dev.get('ios', 0)} ({round(dev.get('ios', 0)/tot_d*100, 1)} %)")
    print(f"  • Desktop:          {dev.get('desktop', 0)} ({round(dev.get('desktop', 0)/tot_d*100, 1)} %)")
    print(f"  • Android:          {dev.get('android', 0)} ({round(dev.get('android', 0)/tot_d*100, 1)} %)")
    print("-" * 60)
    print("⚡ 15-MINUTEN MEMORY CACHE:")
    print(f"  • Hits:       {cache_info.get('hits', 0)}")
    print(f"  • Im RAM:     {cache_info.get('active_entries', 0)} Einträge")
    print(f"  • Hit-Ratio:  {cache_info.get('hit_ratio_percent', 0.0)} %")
    print("=" * 60)
    print("✅ Statistiken erfolgreich in 'README.md' aktualisiert!\n")

if __name__ == "__main__":
    main()
