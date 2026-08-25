import React from 'react';
import { 
  Users, 
  Award, 
  Crown, 
  Sparkles, 
  Briefcase, 
  Building
} from 'lucide-react';
import { GUESTS } from '../data/festivalData';

export const GuestsSection: React.FC = () => {
  const marraine = GUESTS.find(g => g.role === 'MARRAINE');
  const otherGuests = GUESTS.filter(g => g.role !== 'MARRAINE');

  return (
    <section id="invites" className="py-24 bg-white border-t border-stone-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Prestige & Haut Patronage</span>
          </div>
          
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            INVITÉS DE MARQUE & PERSONNALITÉS
          </h2>
          
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Des acteurs majeurs engagés pour le tourisme durable, l'entrepreneuriat et la valorisation de la RDC.
          </p>
        </div>

        {/* Marraine VIP Spotlight Card */}
        {marraine && (
          <div className="mb-16 bg-[#F47B20] rounded-3xl p-8 sm:p-12 text-white shadow-xl border-2 border-orange-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="md:col-span-4 text-center">
                <div className="relative inline-block">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto bg-stone-900">
                    <img
                      src={marraine.photo}
                      alt={marraine.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#168A45] text-white text-xs font-black uppercase tracking-wider shadow-lg whitespace-nowrap border border-white">
                    MARRAINE OFFICIELLE
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3e Édition 2026</span>
                </div>

                <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                  {marraine.name}
                </h3>

                <p className="text-base sm:text-lg font-bold text-orange-100">
                  {marraine.title}
                </p>

                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                  {marraine.bio}
                </p>

                <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                  <span className="text-xs font-extrabold text-white bg-black/20 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                    Présente le 18 Octobre 2026 au Musée National de la RDC
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Other Distinguished Guests Grid */}
        <div>
          <div className="text-center mb-10">
            <h3 className="font-heading font-bold text-2xl text-stone-900">
              Personnalités & Institutions Partenaires
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Des dirigeants engagés pour le développement économique et la jeunesse congolaise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-[#FFF5EB]/60 rounded-2xl p-6 sm:p-8 border border-orange-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F47B20] shrink-0 bg-stone-100">
                      <img
                        src={guest.photo}
                        alt={guest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#168A45]/15 text-[#168A45] uppercase">
                        {guest.organization}
                      </span>
                      <h4 className="font-heading font-bold text-lg text-stone-900 mt-1">
                        {guest.name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-stone-700 mb-3">
                    {guest.title}
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {guest.bio}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-orange-200/60 flex items-center justify-between text-[11px] font-bold text-[#F47B20]">
                  <span>Intervenant d'Honneur</span>
                  <Award className="w-4 h-4 text-[#168A45]" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
