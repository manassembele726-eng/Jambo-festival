import React from 'react';
import { 
  Compass, 
  Trees, 
  Award, 
  Users, 
  HeartHandshake, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OBJECTIVES } from '../data/festivalData';

interface ObjectivesSectionProps {
  onOpenTicketing?: () => void;
}

export const ObjectivesSection: React.FC<ObjectivesSectionProps> = ({ onOpenTicketing }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Compass: <Compass className="w-8 h-8 text-[#F47B20]" />,
    Trees: <Trees className="w-8 h-8 text-[#168A45]" />,
    Award: <Award className="w-8 h-8 text-[#F47B20]" />,
    Users: <Users className="w-8 h-8 text-[#168A45]" />,
    HeartHandshake: <HeartHandshake className="w-8 h-8 text-[#F47B20]" />,
  };

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5EB] text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Cap & Ambitions</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            NOS <span className="text-[#F47B20]">OBJECTIFS</span>
          </h2>
          <p className="text-stone-600 text-base sm:text-lg mt-3 leading-relaxed">
            Cinq priorités stratégiques pour transformer durablement l'écosystème touristique en République démocratique du Congo.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {OBJECTIVES.map((obj, idx) => (
            <div
              key={obj.id}
              className={`bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-xl hover:border-[#F47B20] hover:-translate-y-1 transition-all flex flex-col justify-between group ${
                idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-xl bg-[#FFF5EB] border border-orange-200 group-hover:scale-110 transition-transform">
                    {iconMap[obj.iconName] || <Compass className="w-8 h-8 text-[#F47B20]" />}
                  </div>
                  <span className="font-heading font-black text-3xl text-stone-300 group-hover:text-[#F47B20]/40 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-stone-900 mb-3 leading-snug">
                  {obj.title}
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed">
                  {obj.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#168A45]">
                <span>Priorité JAMBO 2026</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#F47B20] via-[#E06912] to-[#168A45] rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="font-heading font-bold text-xl sm:text-2xl mb-1">
              Participez à la valorisation du patrimoine congolais
            </h4>
            <p className="text-white/90 text-sm">
              Réservez votre accès pour la journée professionnelle du 18 octobre au Musée national de la RDC.
            </p>
          </div>
          {onOpenTicketing && (
            <button
              onClick={onOpenTicketing}
              className="px-6 py-3.5 rounded-xl text-sm font-extrabold text-[#F47B20] bg-white hover:bg-orange-50 transition-all shadow-md shrink-0 cursor-pointer"
            >
              Prendre mon Billet
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
