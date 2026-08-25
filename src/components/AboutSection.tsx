import React from 'react';
import { 
  Sparkles, 
  Target, 
  Eye, 
  Heart, 
  ShieldCheck, 
  Trees, 
  Compass, 
  Award, 
  Users, 
  Zap, 
  Quote
} from 'lucide-react';
import { FESTIVAL_INFO } from '../data/festivalData';

export const AboutSection: React.FC = () => {
  return (
    <section id="apropos" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF5EB]/80 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EDF7F1]/80 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5EB] text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Identité & Vocation</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            QU'EST-CE QUE <span className="text-[#F47B20]">JAMBO FESTIVAL</span> ?
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#F47B20] to-[#168A45] mx-auto mt-4 rounded-full" />
        </div>

        {/* Lead Quote Card in Dominant Orange */}
        <div className="bg-gradient-to-br from-[#F47B20] to-[#C45709] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-16 border border-orange-400">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Quote className="w-72 h-72 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-white text-[#F47B20] font-extrabold text-xs uppercase tracking-wider mb-4 shadow-sm">
              Fondé en {FESTIVAL_INFO.creationYear}
            </div>
            <blockquote className="font-serif-luxury text-xl sm:text-2xl md:text-3xl leading-relaxed text-white mb-6 italic">
              « JAMBO FESTIVAL symbolise l'accueil, la rencontre, le voyage et la découverte culturelle à travers le tourisme durable et l'implication des femmes dans le secteur touristique. »
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-white/25">
              <span className="w-3 h-3 rounded-full bg-[#168A45] ring-2 ring-white" />
              <p className="text-base font-bold text-white tracking-wide">
                {FESTIVAL_INFO.secondaryTagline}
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Mission Card in White with Orange */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-stone-100 hover:border-[#F47B20] transition-all group">
            <div className="w-14 h-14 rounded-xl bg-[#FFF5EB] text-[#F47B20] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-200">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-stone-900 mb-3">
              Notre Mission
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              {FESTIVAL_INFO.mission}
            </p>
          </div>

          {/* Vision Card in White with Green */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-stone-100 hover:border-[#168A45] transition-all group">
            <div className="w-14 h-14 rounded-xl bg-[#EDF7F1] text-[#168A45] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#168A45]/30">
              <Eye className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-stone-900 mb-3">
              Notre Vision
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              {FESTIVAL_INFO.vision}
            </p>
          </div>

        </div>

        {/* 6 Core Values */}
        <div>
          <div className="text-center mb-10">
            <h3 className="font-heading font-bold text-2xl text-stone-900">
              Les 6 Valeurs Fondamentales de JAMBO Festival
            </h3>
            <p className="text-stone-500 text-sm mt-1">
              Les piliers qui guident chacune de nos actions et partenariats
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FESTIVAL_INFO.values.map((val, idx) => {
              const icons = [ShieldCheck, Users, Trees, Compass, Award, Zap];
              const IconComp = icons[idx % icons.length];
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={val.title} 
                  className="bg-white rounded-xl p-6 border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg border ${
                      isEven 
                        ? 'bg-[#FFF5EB] text-[#F47B20] border-orange-200' 
                        : 'bg-[#EDF7F1] text-[#168A45] border-green-200'
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-bold text-lg text-stone-900">
                      {val.title}
                    </h4>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
