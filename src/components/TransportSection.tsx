import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Bell, 
  CheckCircle2, 
  Info,
  Car,
  Navigation
} from 'lucide-react';
import { TRANSPORT_INFO } from '../data/festivalData';

export const TransportSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section id="transport" className="py-20 bg-stone-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3">
            <Bus className="w-3.5 h-3.5" />
            <span>Mobilité & Déplacement</span>
          </div>
          
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight">
            TRANSPORT & ACCÈS
          </h2>
          
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Rejoindre les sites du JAMBO Festival 2026 en toute sérénité
          </p>
        </div>

        {/* Transport Notice Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-md">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-50 text-[#F47B20] border border-orange-200 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Statut : {TRANSPORT_INFO.status}</span>
              </div>
              <h3 className="font-heading font-bold text-2xl text-stone-900">
                Navettes, Points de Ramassage & Itinéraires
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF5EB] text-[#F47B20] border border-orange-200">
              <Bus className="w-8 h-8" />
            </div>
          </div>

          <div className="py-6 space-y-6">
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {TRANSPORT_INFO.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-900">
                  <MapPin className="w-4 h-4 text-[#F47B20]" />
                  <span>18 Octobre : Musée national de la RDC</span>
                </div>
                <p className="text-xs text-stone-500">
                  Situé sur le Boulevard Triomphal (Kinshasa). Parking sécurisé et accès facile par transport urbain et taxis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-900">
                  <Navigation className="w-4 h-4 text-[#168A45]" />
                  <span>24 Octobre : Amani Eco-Park (Mitendi)</span>
                </div>
                <p className="text-xs text-stone-500">
                  Des navettes groupées et points de ralliement centraux seront mis en place par le comité d'organisation.
                </p>
              </div>
            </div>
          </div>

          {/* Alert Subscription Form */}
          <div className="pt-6 border-t border-stone-200">
            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-[#168A45]/30 text-[#168A45] text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#168A45] shrink-0" />
                <span className="font-medium">
                  Merci ! Vous recevrez par e-mail toutes les informations logistiques dès leur publication.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700 shrink-0">
                  <Bell className="w-4 h-4 text-[#F47B20]" />
                  <span>Recevoir l'alerte transport par e-mail :</span>
                </div>

                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#F47B20]"
                />

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  M'informer
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
