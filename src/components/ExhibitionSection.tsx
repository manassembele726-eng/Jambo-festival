import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Eye, 
  Palette, 
  Ticket,
  Clock
} from 'lucide-react';
import { EXHIBITION_INFO } from '../data/festivalData';

interface ExhibitionSectionProps {
  onOpenTicketing?: () => void;
}

export const ExhibitionSection: React.FC<ExhibitionSectionProps> = ({ onOpenTicketing }) => {
  return (
    <section id="exposition" className="py-24 bg-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Patrimoine & Culture</span>
          </div>
          
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            GRANDE EXPOSITION AU MUSÉE NATIONAL
          </h2>
          
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            18 OCTOBRE 2026 • MUSÉE NATIONAL DE LA RDC (KINSHASA)
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Image & Museum Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-stone-200">
              <img
                src="https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80"
                alt="Musée National de la RDC et art congolais"
                className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F47B20] text-white uppercase tracking-wider mb-2 inline-block shadow">
                  Lieu d'Exception
                </span>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  Musée National de la RDC
                </h3>
                <p className="text-xs text-stone-200 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Boulevard Triomphal, Kinshasa, RDC</span>
                </p>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -top-4 -left-4 bg-[#168A45] text-white p-4 rounded-2xl shadow-xl hidden sm:block border-2 border-white">
              <Sparkles className="w-6 h-6 text-orange-200 mb-1" />
              <p className="text-xs font-extrabold uppercase">18 Octobre 2026</p>
              <p className="text-[11px] text-green-100">Journée d'Excellence</p>
            </div>
          </div>

          {/* Details & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#F47B20]">
                Immersion Artistique & Touristique
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-stone-900 leading-snug">
                {EXHIBITION_INFO.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {EXHIBITION_INFO.description}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Ce que vous découvrirez dans l'exposition :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXHIBITION_INFO.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF5EB] border border-orange-200 text-xs font-semibold text-stone-800">
                    <Palette className="w-4 h-4 text-[#F47B20] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-4">
              {onOpenTicketing && (
                <button
                  onClick={onOpenTicketing}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-white" />
                  <span>Accéder avec mon Billet du 18 Octobre</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
