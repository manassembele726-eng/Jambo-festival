import React from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Users, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { HISTORY_EDITIONS } from '../data/festivalData';

export const HistoryTimeline: React.FC = () => {
  return (
    <section className="py-20 bg-stone-50 border-y border-orange-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5EB] text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3 border border-orange-200">
            <Clock className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Genèse & Trajectoire</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight">
            L'HISTOIRE DU <span className="text-[#F47B20]">FESTIVAL</span>
          </h2>
          <p className="text-stone-600 text-base mt-2">
            De l'impulsion fondatrice en 2024 à l'édition d'envergure 2026
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative">
          {/* Vertical central bar (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-[#F47B20] via-[#168A45] to-[#F47B20] -translate-x-1/2 rounded-full" />

          <div className="space-y-12">
            {HISTORY_EDITIONS.map((ed, idx) => {
              const isEven = idx % 2 === 0;
              const isCurrent = ed.year === '2026';

              return (
                <div 
                  key={ed.year}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content Box */}
                  <div className="w-full lg:w-1/2">
                    <div 
                      className={`p-6 sm:p-8 rounded-2xl bg-white border ${
                        isCurrent 
                          ? 'border-[#F47B20] shadow-xl ring-2 ring-[#F47B20]/20' 
                          : 'border-stone-200 shadow-sm'
                      } transition-all`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase ${
                          isCurrent 
                            ? 'bg-[#F47B20] text-white' 
                            : 'bg-[#EDF7F1] text-[#168A45]'
                        }`}>
                          {ed.year === '2026' ? 'Édition Actuelle' : `Édition ${ed.year}`}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#F47B20]" />
                          <span>{ed.date}</span>
                        </div>
                      </div>

                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-stone-900 mb-2">
                        {ed.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-[#168A45]" />
                        <span className="font-semibold">{ed.location}</span>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed mb-5">
                        {ed.description}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-2 pt-4 border-t border-stone-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Faits marquants & Résultats :
                        </p>
                        {ed.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                            <CheckCircle2 className="w-4 h-4 text-[#168A45] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Central Node */}
                  <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-[#F47B20] text-white border-4 border-white shadow-md z-10 font-bold text-sm">
                    {ed.year.substring(2)}
                  </div>

                  {/* Empty spacer for alternating layout */}
                  <div className="hidden lg:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Edition 2025 Highlight Card */}
        <div className="mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-orange-200 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7F1] text-[#168A45] text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Bilan de l'Édition Précédente (15 Mars 2025 — Kinkole)</span>
              </div>
              <h4 className="font-heading font-bold text-lg text-stone-900">
                Des résultats tangibles pour le tourisme et l'emploi des jeunes femmes
              </h4>
              <p className="text-sm text-stone-600 max-w-2xl">
                L'expérience de Kinkole a confirmé l'engouement populaire pour l'écotourisme congolais : augmentation notable du public, participantes certifiées et insertions directes réussies.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
              <div className="bg-[#FFF5EB] p-4 rounded-xl text-center border border-orange-200">
                <span className="block font-heading font-black text-2xl text-[#F47B20]">100%</span>
                <span className="text-[11px] font-bold text-stone-700">Certificats Remis</span>
              </div>
              <div className="bg-[#EDF7F1] p-4 rounded-xl text-center border border-[#168A45]/30">
                <span className="block font-heading font-black text-2xl text-[#168A45]">3e</span>
                <span className="text-[11px] font-bold text-stone-700">Édition en 2026</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
