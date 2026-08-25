import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Ticket, 
  Compass, 
  Trees, 
  Award, 
  Users, 
  Eye, 
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Activity } from '../types';
import { storageService } from '../services/storageService';

interface ProgramSectionProps {
  onOpenTicketing: (type?: 'STANDARD' | 'VIP') => void;
  onOpenHikeModal: () => void;
  onOpenTrainingModal: () => void;
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({
  onOpenTicketing,
  onOpenHikeModal,
  onOpenTrainingModal,
}) => {
  const [activities] = useState<Activity[]>(() => storageService.getActivities());
  const [activeFilter, setActiveFilter] = useState<string>('TOUS');

  const oct18Activities = activities.filter(a => a.date.includes('18 Octobre'));
  const oct24Activities = activities.filter(a => a.date.includes('24 Octobre'));

  const categories = ['TOUS', 'Formation', 'Exposition', 'Networking', 'Cérémonie', 'Échange'];

  const filtered18 = activeFilter === 'TOUS' 
    ? oct18Activities 
    : oct18Activities.filter(a => a.category === activeFilter);

  return (
    <section id="programme" className="py-24 bg-stone-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5EB] text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3 border border-orange-200">
            <Calendar className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Édition 2026</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            JAMBO FESTIVAL <span className="text-[#F47B20]">2026</span>
          </h2>
          <p className="text-lg text-[#F47B20] font-semibold mt-2 font-serif-luxury italic">
            « La RDC vibre au rythme du JAMBO Festival pour sa 3e édition. »
          </p>
        </div>

        {/* The Two Distinct Dates Comparison Banner */}
        <div className="mb-16 bg-white rounded-3xl p-6 sm:p-10 border border-orange-200 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF5EB] text-[#F47B20] text-xs font-extrabold uppercase tracking-wider mb-2 border border-orange-200">
              Structure de l'Événement
            </span>
            <h3 className="font-heading font-bold text-2xl text-stone-900">
              Deux Journées Distinctes & Complémentaires
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Veuillez noter que le billet du 18 octobre est indépendant de la randonnée du 24 octobre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Day 1: 18 Octobre - Dominant Orange Theme */}
            <div className="bg-[#FFF5EB]/60 rounded-2xl p-6 sm:p-8 border-2 border-[#F47B20] shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#F47B20] text-white tracking-wider uppercase shadow-sm">
                    JOUR 1 — 18 OCTOBRE 2026
                  </span>
                  <span className="text-xs font-bold text-[#F47B20]">Billet Requis</span>
                </div>

                <h4 className="font-heading font-extrabold text-2xl text-stone-900 mb-2">
                  Journée Professionnelle, Culturelle & Touristique
                </h4>

                <div className="flex items-center gap-2 text-xs text-stone-600 mb-4">
                  <MapPin className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span className="font-semibold">Musée national de la RDC, Kinshasa</span>
                </div>

                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  Une immersion de haut niveau : formations spécialisées, remise solennelle de brevets, carrefour de networking, grande exposition culturelle au Musée national et échanges avec les personnalités et institutions de référence.
                </p>

                <div className="bg-white p-4 rounded-xl border border-orange-200 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Billet Standard :</span>
                    <span className="font-extrabold text-[#F47B20]">15 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Billet VIP :</span>
                    <span className="font-extrabold text-[#F47B20]">25 USD</span>
                  </div>
                  <p className="text-[11px] text-[#C45709] font-medium italic pt-1 border-t border-stone-200">
                    * Valable UNIQUEMENT le 18 octobre 2026.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenTicketing('STANDARD')}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#F47B20] hover:bg-[#E06912] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="btn-day1-ticket"
              >
                <Ticket className="w-4 h-4" />
                <span>Acheter mon Billet du 18 Octobre</span>
              </button>
            </div>

            {/* Day 2: 24 Octobre - Nature Green Theme */}
            <div className="bg-[#EDF7F1]/60 rounded-2xl p-6 sm:p-8 border-2 border-[#168A45] shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#168A45] text-white tracking-wider uppercase shadow-sm">
                    JOUR 2 — 24 OCTOBRE 2026
                  </span>
                  <span className="text-xs font-bold text-[#168A45]">Activité Distincte</span>
                </div>

                <h4 className="font-heading font-extrabold text-2xl text-stone-900 mb-2">
                  Grande Randonnée Touristique Amani Eco-Park
                </h4>

                <div className="flex items-center gap-2 text-xs text-stone-600 mb-4">
                  <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
                  <span className="font-semibold">Amani Eco-Park, Mitendi (Kinshasa)</span>
                </div>

                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  « Une journée dédiée à la découverte, à l'aventure, au tourisme et à la valorisation du patrimoine naturel de la République démocratique du Congo. » Sentiers écologiques, déconnexion et convivialité.
                </p>

                <div className="bg-white p-4 rounded-xl border border-green-200 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Tarif Randonnée :</span>
                    <span className="font-bold text-stone-600">Tarif et modalités à venir</span>
                  </div>
                  <p className="text-[11px] text-[#168A45] font-medium italic pt-1 border-t border-stone-200">
                    * Ne nécessite pas le billet du 18 octobre. Réservation indépendante.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenHikeModal}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#168A45] hover:bg-[#12733A] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="btn-day2-hike"
              >
                <Trees className="w-4 h-4" />
                <span>Réserver ma Participation (Randonnée)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Detailed Program for 18 October 2026 */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
            <div>
              <span className="text-xs font-bold text-[#F47B20] uppercase tracking-widest">
                18 OCTOBRE 2026 • MUSÉE NATIONAL DE LA RDC
              </span>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mt-1">
                Programme Détaillé de la Journée Professionnelle
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Découvrez les 6 temps forts officiels de la journée
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-[#F47B20] text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-orange-50 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered18.map((act, idx) => (
              <div
                key={act.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-[#F47B20] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#FFF5EB] text-[#F47B20] text-[11px] font-extrabold border border-orange-200 uppercase tracking-wider">
                      {act.category}
                    </span>
                    <span className="text-xs text-stone-400 font-bold">#{idx + 1}</span>
                  </div>

                  <h4 className="font-heading font-bold text-lg text-stone-900 mb-2 leading-snug">
                    {act.name}
                  </h4>

                  <div className="space-y-1.5 text-xs text-stone-600 mb-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#F47B20]" />
                      <span className="font-medium">{act.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#168A45]" />
                      <span className="font-medium">{act.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 italic">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{act.time}</span>
                    </div>
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  {act.registrationOpen ? (
                    <button
                      onClick={onOpenTrainingModal}
                      className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>S'inscrire à la formation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Accès avec billet 18 Oct.</span>
                      <CheckCircle className="w-4 h-4 text-[#168A45]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
