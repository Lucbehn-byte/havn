import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

/**
 * Pro-Kapitel: nummerierte Überschrift + "Kurz gesagt"-Zeile in Klartext
 * über jeder Analyse-Karte. So bleibt die volle Tiefe erhalten, aber jede
 * Karte beginnt mit der Kernaussage.
 */
export function ProSection({ id, number, title, takeaway, children }) {
  return (
    <section id={id} className="scroll-mt-36 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-1">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-7 h-7 rounded-xl glass-chip flex items-center justify-center text-[11px] font-black text-sky-300 font-mono">
            {String(number).padStart(2, '0')}
          </span>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-200">{title}</h2>
        </div>
        {takeaway && (
          <div className="flex items-start gap-1.5 text-xs text-slate-300 sm:border-l sm:border-white/10 sm:pl-4 leading-relaxed">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
            <span><strong className="text-white font-semibold">Kurz gesagt:</strong> {takeaway}</span>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Sticky Kapitel-Navigation im Liquid-Glass-Stil. Markiert automatisch das
 * Kapitel, das gerade im Viewport ist.
 */
export function ProNav({ sections = [] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-[72px] z-30 -mx-1">
      <nav className="glass-strong rounded-2xl p-1 flex gap-1 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
              active === s.id ? 'liquid-glass-active text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
