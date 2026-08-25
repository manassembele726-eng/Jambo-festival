import React, { useState } from 'react';
import { 
  Award, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  HeartHandshake, 
  ArrowRight,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface TrainingsSectionProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const TrainingsSection: React.FC<TrainingsSectionProps> = ({
  isOpenModal = false,
  onCloseModal,
}) => {
  const [showModal, setShowModal] = useState(isOpenModal);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    trainingType: 'Hôtesse professionnelle' as const,
    experienceLevel: 'Débutante avec forte motivation',
    motivation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addTrainingRegistration({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      trainingType: formData.trainingType,
      experienceLevel: formData.experienceLevel,
      motivation: formData.motivation,
    });
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setShowModal(false);
    setSubmitted(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      trainingType: 'Hôtesse professionnelle',
      experienceLevel: 'Débutante avec forte motivation',
      motivation: '',
    });
    if (onCloseModal) onCloseModal();
  };

  const trainingModules = [
    {
      title: 'Hôtesse Professionnelle d\'Événement & Protocole',
      target: 'Jeunes femmes & candidates aux métiers de l\'accueil',
      desc: 'Techniques d\'accueil diplomatique, posture, gestion des flux de VIP, communication bilingue et gestion des imprévus lors de grands rendez-vous internationaux.',
      badge: 'Certification Reconnue',
    },
    {
      title: 'Guide Touristique & Valorisation du Patrimoine',
      target: 'Passionnés d\'histoire, d\'écotourisme et de médiation',
      desc: 'Maîtrise du storytelling des sites historiques congolais, techniques de guidage en milieu naturel et urbain, sécurité des groupes et écotourisme.',
      badge: 'Insertion Professionnelle',
    },
    {
      title: 'Accueil & Hospitalité Touristique Durable',
      target: 'Personnels d\'hôtels, agences et réceptifs',
      desc: 'Standards internationaux de service client, éco-gestes dans l\'hôtellerie, promotion de la culture gastronomique et artisanale de la RDC.',
      badge: 'Spécialisation 2026',
    },
  ];

  return (
    <section id="formations" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Insertion & Compétences</span>
          </div>
          
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            FORMATIONS PROFESSIONNELLES
          </h2>
          
          <p className="text-sm sm:text-base text-stone-600 mt-2 font-medium">
            FORMATION PROFESSIONNELLE ET INITIATION AUX MÉTIERS D'HÔTESSE ET GUIDE TOURISTIQUE
          </p>
        </div>

        {/* Lead Impact Banner */}
        <div className="bg-[#F47B20] rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-16 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 rounded-md bg-[#168A45] text-white font-black text-xs uppercase tracking-wider">
              Autonomisation & Emploi
            </span>
            
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Valoriser les talents pour faire rayonner l'accueil congolais
            </h3>
            
            <p className="text-white/95 text-sm sm:text-base leading-relaxed">
              JAMBO Festival a pour vocation d'ouvrir de vraies perspectives d'emploi. Nos formations délivrent des brevets et facilitent le placement direct auprès des structures touristiques et institutionnelles partenaires de la RDC.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-stone-900 bg-white hover:bg-stone-100 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                id="btn-open-training-modal"
              >
                <GraduationCap className="w-4 h-4 text-[#F47B20]" />
                <span>S'INSCRIRE À UNE FORMATION</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainingModules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-[#FFF5EB]/40 rounded-2xl p-8 border border-orange-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#168A45] border border-[#168A45]/30">
                    {mod.badge}
                  </span>
                  <Award className="w-5 h-5 text-[#F47B20]" />
                </div>

                <h4 className="font-heading font-bold text-xl text-stone-900 mb-3 leading-snug">
                  {mod.title}
                </h4>

                <p className="text-xs font-bold text-[#F47B20] mb-4">
                  Public cible : {mod.target}
                </p>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-orange-200/60">
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      trainingType: (idx === 0 ? 'Hôtesse professionnelle' : idx === 1 ? 'Guide touristique' : 'Accueil & Protocole') as any,
                    }));
                    setShowModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Postuler pour ce module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Registration Modal */}
      {(showModal || isOpenModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white text-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-[#F47B20]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-stone-900">
                    Candidature Formation JAMBO
                  </h3>
                  <span className="text-xs text-stone-500">Initiation & Professionnalisation</span>
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
                  Candidature Enregistrée !
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Félicitations {formData.firstName} ! Votre demande d'inscription pour la formation <strong>{formData.trainingType}</strong> a bien été enregistrée.
                  L'équipe pédagogique examinera votre dossier et vous contactera par e-mail / WhatsApp pour confirmer les modalités.
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Chantal"
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
                      placeholder="Ex: Bukasa"
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
                      placeholder="votre.email@exemple.com"
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
                    Filière de formation souhaitée *
                  </label>
                  <select
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#F47B20]"
                  >
                    <option value="Hôtesse professionnelle">Hôtesse professionnelle d'événement</option>
                    <option value="Guide touristique">Guide touristique & patrimoine</option>
                    <option value="Accueil & Protocole">Accueil, Réception & Protocole</option>
                    <option value="Tous">Tous les modules (Parcours complet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Niveau d'expérience actuel
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#F47B20]"
                  >
                    <option value="Débutante avec forte motivation">Débutante avec forte motivation</option>
                    <option value="Étudiante en tourisme / hôtellerie / communication">Étudiante en tourisme / hôtellerie / communication</option>
                    <option value="Déjà en activité (perfectionnement)">Déjà en activité (perfectionnement)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Votre motivation en quelques mots *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Pourquoi souhaitez-vous participer à cette formation ?"
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
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
                    Envoyer ma Candidature
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
