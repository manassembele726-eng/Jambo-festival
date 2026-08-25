import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Send, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { FAQ_ITEMS, FESTIVAL_INFO } from '../data/festivalData';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

export const ContactSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiService.messages.send(formData);
    } catch {
      // fallback
    }
    storageService.addContactMessage(formData);
    setIsSending(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Assistance & Échanges</span>
          </div>
          
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            QUESTIONS FRÉQUENTES & CONTACT
          </h2>
          
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Toutes les réponses à vos questions et l'équipe d'organisation à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FAQ Accordion (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-heading font-bold text-2xl text-stone-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F47B20]" />
              <span>Questions Fréquemment Posées</span>
            </h3>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-stone-900 hover:bg-orange-50/40 transition-colors cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#F47B20] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#168A45]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form & Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFF5EB]/50 rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-sm">
              <h3 className="font-heading font-bold text-2xl text-stone-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#F47B20]" />
                <span>Nous Écrire</span>
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Partenariat, sponsoring, presse ou information personnalisée.
              </p>

              {submitted ? (
                <div className="text-center py-8 space-y-3 bg-emerald-50 rounded-2xl p-6 border border-[#168A45]/30">
                  <CheckCircle2 className="w-10 h-10 text-[#168A45] mx-auto" />
                  <h4 className="font-heading font-bold text-lg text-stone-900">
                    Message Envoyé avec Succès !
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Merci pour votre intérêt. Le secrétariat du JAMBO Festival vous répondra dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="mt-2 text-xs font-bold text-[#F47B20] hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Adresse e-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="votre.email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Objet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Partenariat, Presse, Information générale..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Votre message *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Expliquez-nous votre demande..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-[#F47B20]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer mon Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Official Contact Info Box */}
            <div className="bg-[#0A3D22] text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
              <h4 className="font-heading font-bold text-lg text-white">
                Secrétariat Général du Festival
              </h4>

              <div className="space-y-2.5 text-xs text-emerald-100">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span>Kinshasa, République démocratique du Congo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span>{FESTIVAL_INFO.contact.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span>{FESTIVAL_INFO.contact.phone}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
