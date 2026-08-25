import React, { useState } from 'react';
import { 
  Trees, 
  MapPin, 
  Calendar, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Info, 
  ArrowRight,
  X,
  Footprints
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface HikeSectionProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const HikeSection: React.FC<HikeSectionProps> = ({
  isOpenModal = false,
  onCloseModal,
}) => {
  const [showFormModal, setShowFormModal] = useState(isOpenModal);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    groupSize: 1,
    comments: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addHikeRegistration({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      groupSize: Number(formData.groupSize) || 1,
      comments: formData.comments,
    });
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setShowFormModal(false);
    setSubmitted(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      groupSize: 1,
      comments: '',
    });
    if (onCloseModal) onCloseModal();
  };

  return (
    <section id="randonnee" className="py-24 bg-[#0A3D22] text-white relative overflow-hidden">
      
      {/* Background Nature Forest Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80"
          alt="Amani Eco-Park Mitendi paysages naturels"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D22] via-[#0A3D22]/85 to-[#0A3D22]/80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white border border-white/25 text-xs font-bold uppercase tracking-wider mb-3">
            <Footprints className="w-3.5 h-3.5 text-[#F47B20]" />
            <span>Journée Écotourisme & Aventure</span>
          </div>
          
          <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight">
            24 OCTOBRE 2026
          </h2>
          
          <p className="font-heading font-bold text-2xl sm:text-3xl text-orange-300 tracking-widest mt-2 uppercase">
            GRANDE RANDONNÉE TOURISTIQUE
          </p>
        </div>

        {/* Hero Feature Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-stone-900 shadow-2xl max-w-4xl mx-auto mb-12 border border-stone-200">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-200">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#F47B20] uppercase tracking-widest block">
                Destination d'Exception
              </span>
              <h3 className="font-heading font-extrabold text-3xl text-stone-900">
                AMANI ECO-PARK, MITENDI
              </h3>
              <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
                <span>Mitendi, Province de Kinshasa, RDC</span>
              </div>
            </div>

            <div className="bg-[#FFF5EB] px-6 py-4 rounded-2xl border border-orange-200 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase text-[#F47B20] block">Date de la Randonnée</span>
              <span className="font-heading font-black text-2xl text-stone-900">24 OCT. 2026</span>
              <span className="text-[11px] text-stone-600 block mt-0.5">Activité de plein air</span>
            </div>
          </div>

          <div className="py-8 space-y-6">
            <blockquote className="text-lg sm:text-xl text-stone-700 italic leading-relaxed font-medium">
              « Une journée dédiée à la découverte, à l'aventure, au tourisme et à la valorisation du patrimoine naturel de la République démocratique du Congo. »
            </blockquote>

            {/* Distinction Reminder */}
            <div className="bg-[#EDF7F1] border border-[#168A45]/30 rounded-2xl p-5 text-stone-800 text-xs sm:text-sm flex items-start gap-3">
              <Info className="w-5 h-5 text-[#168A45] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[#168A45]">
                  Activité distincte de la journée du 18 octobre
                </p>
                <p className="text-stone-600 leading-relaxed">
                  L'achat d'un billet pour le 18 octobre ne comprend pas automatiquement l'accès à la randonnée du 24 octobre.
                  <br />
                  <strong>Statut : Tarif et modalités de réservation à venir.</strong>
                  <br />
                  Vous pouvez dès maintenant enregistrer votre intention de participation ci-dessous pour être notifié en priorité dès l'ouverture des réservations fermes.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowFormModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-white bg-[#F47B20] hover:bg-[#E06912] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              id="btn-hike-reserve"
            >
              <Trees className="w-5 h-5 text-white" />
              <span>RÉSERVER MA PARTICIPATION</span>
            </button>
          </div>

        </div>

      </div>

      {/* Reservation Modal */}
      {(showFormModal || isOpenModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white text-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-[#F47B20]">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-stone-900">
                    Randonnée Amani Eco-Park
                  </h3>
                  <span className="text-xs text-stone-500">24 Octobre 2026 • Mitendi</span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-green-100 text-[#168A45] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-extrabold text-2xl text-stone-900">
                  Réservation Pré-enregistrée !
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Merci {formData.firstName} ! Votre pré-inscription pour la Grande Randonnée du 24 octobre à Amani Eco-Park a été enregistrée.
                  Vous recevrez en priorité toutes les informations sur le point de rassemblement, le transport et le tarif dès leur publication officielle.
                </p>
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-stone-600 bg-orange-50 p-3 rounded-xl border border-orange-200">
                  🌱 <strong>Tarif et modalités à venir :</strong> Remplissez ce formulaire pour réserver votre place en liste prioritaire.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sarah"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mpemba"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+243 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Nombre de personnes
                  </label>
                  <select
                    value={formData.groupSize}
                    onChange={(e) => setFormData({ ...formData, groupSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#F47B20]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num > 1 ? 'personnes' : 'personne'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Commentaires ou besoins particuliers (facultatif)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Passionné de photographie nature, besoin de transport..."
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors shadow"
                  >
                    Confirmer ma Pré-inscription
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
