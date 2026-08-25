import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Ticket as TicketIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Info, 
  Clock, 
  AlertCircle,
  QrCode,
  Download,
  Printer,
  Calendar,
  Smartphone,
  Check,
  Award,
  Globe,
  FileText
} from 'lucide-react';
import { FESTIVAL_INFO } from '../data/festivalData';
import { Ticket, TicketType } from '../types';
import { storageService } from '../services/storageService';
import { paymentService } from '../services/paymentService';
import { DigitalTicketModal } from './DigitalTicketModal';

interface TicketingSectionProps {
  initialType?: TicketType;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
  onTicketPurchased?: (ticket: Ticket) => void;
}

export const TicketingSection: React.FC<TicketingSectionProps> = ({
  initialType = 'STANDARD',
  isOpenAsModal = false,
  onCloseModal,
  onTicketPurchased,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [ticketType, setTicketType] = useState<TicketType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  
  // Participant details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Kinshasa',
    country: 'RDC',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Initialisation de la commande...');
  
  // Payment methods selection in demo
  const [paymentProvider, setPaymentProvider] = useState<'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'CARD' | 'DEMO_EXPRESS'>('DEMO_EXPRESS');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Purchased tickets result
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
  const [activeDigitalTicket, setActiveDigitalTicket] = useState<Ticket | null>(null);

  const pricePerUnit = ticketType === 'VIP' ? FESTIVAL_INFO.pricing.vip.price : FESTIVAL_INFO.pricing.standard.price;
  const totalAmount = pricePerUnit * quantity;

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) errors.lastName = 'Le nom de famille est requis';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Une adresse e-mail valide est requise';
    if (!formData.phone.trim()) errors.phone = 'Le numéro de téléphone / WhatsApp est requis';
    if (!formData.city.trim()) errors.city = 'La ville de résidence est requise';
    if (!formData.country.trim()) errors.country = 'Le pays est requis';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setProcessingStatus('Sécurisation de la transaction...');

    try {
      // Small progress simulation for realism
      await new Promise(r => setTimeout(r, 400));
      setProcessingStatus('Génération de l\'empreinte cryptographique...');
      await new Promise(r => setTimeout(r, 400));
      setProcessingStatus('Création du QR Code sécurisé...');
      await new Promise(r => setTimeout(r, 400));

      // Execute payment via payment adapter
      const paymentRes = await paymentService.executePayment({
        amount: totalAmount,
        currency: 'USD',
        customer: formData,
        method: 'DEMO',
      });

      if (paymentRes.success) {
        // Create order and tickets in storage
        const providerName = 
          paymentProvider === 'MPESA' ? 'M-Pesa (Vodacom RDC)' :
          paymentProvider === 'ORANGE_MONEY' ? 'Orange Money RDC' :
          paymentProvider === 'AIRTEL_MONEY' ? 'Airtel Money RDC' :
          paymentProvider === 'CARD' ? 'Carte Bancaire Internationale' :
          'Validation Démonstration Express';

        const { tickets } = storageService.createOrderAndTickets({
          type: ticketType,
          quantity,
          price: pricePerUnit,
          participant: formData,
          paymentMethod: providerName,
        });

        setPurchasedTickets(tickets);
        setStep(5);

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#0A8296', '#D4AF37', '#800020', '#38BDF8', '#FAF8F5']
          });
        } catch {
          // graceful fallback
        }

        if (tickets.length > 0 && onTicketPurchased) {
          onTicketPurchased(tickets[0]);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      {!isOpenAsModal && (
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5EB] text-[#F47B20] border border-orange-200 text-xs font-black uppercase tracking-widest mb-3">
            <TicketIcon className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Billetterie Numérique Officielle</span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight">
            JAMBO FESTIVAL <span className="text-[#F47B20]">2026</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#168A45] uppercase tracking-widest mt-1">
            3e ÉDITION • KINSHASA, RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          </p>

          {/* CRITICAL STRICT NOTICE BADGE */}
          <div className="mt-4 inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-[#F47B20] via-[#E06912] to-[#168A45] text-white font-heading font-black text-xs sm:text-sm md:text-base tracking-wide shadow-md">
            <AlertCircle className="w-4 h-4 text-white shrink-0 animate-pulse" />
            <span>« VALABLE UNIQUEMENT LE 18 OCTOBRE 2026 »</span>
          </div>

          <p className="text-stone-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Commandez votre pass en ligne en quelques clics et recevez instantanément votre billet officiel sécurisé par QR Code unique.
          </p>
        </div>
      )}

      {/* Main Multi-Step Wizard Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 border-orange-200 shadow-2xl overflow-hidden">
        
        {/* Wizard Step Progress Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            
            {[
              { num: 1, label: '1. Choisir Billet' },
              { num: 2, label: '2. Informations' },
              { num: 3, label: '3. Résumé' },
              { num: 4, label: '4. Paiement DEMO' },
              { num: 5, label: '5. Mon Billet & QR' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;

              return (
                <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone 
                      ? 'bg-[#168A45] text-white shadow-sm' 
                      : isCurrent 
                      ? 'bg-[#F47B20] text-white ring-4 ring-[#F47B20]/20 shadow-sm' 
                      : 'bg-stone-200 text-stone-500'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold hidden md:inline ${
                    isCurrent ? 'text-stone-900 font-extrabold' : isDone ? 'text-[#168A45]' : 'text-stone-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}

          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 sm:p-10">

          {/* ======================================================== */}
          {/* STEP 1: CHOICE OF TICKET (STANDARD 15 USD / VIP 25 USD)  */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-black tracking-widest text-[#F47B20] uppercase bg-[#FFF5EB] px-3 py-1 rounded-full border border-orange-200">
                  Étape 1 sur 5
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                  Choisissez votre Formule de Billet
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Les deux pass donnent accès à la grande journée du <strong>18 octobre 2026</strong> au Musée national de la RDC.
                </p>
              </div>

              {/* Strict Notice inside Step 1 */}
              <div className="bg-[#FFF5EB] border-l-4 border-[#F47B20] p-4 rounded-xl text-xs text-stone-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F47B20] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F47B20] uppercase tracking-wide block font-black">
                    Note Importante sur la validité :
                  </strong>
                  Tous les billets achetés sur cette page sont <strong>VALABLES UNIQUEMENT LE 18 OCTOBRE 2026</strong> pour la grande célébration au Musée national. Ils ne s'appliquent pas à la randonnée du 24 octobre.
                </div>
              </div>

              {/* Tickets Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* STANDARD CARD (15 USD) */}
                <div 
                  onClick={() => setTicketType('STANDARD')}
                  className={`relative rounded-3xl p-6 sm:p-7 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    ticketType === 'STANDARD'
                      ? 'border-[#F47B20] bg-white ring-4 ring-[#F47B20]/15 shadow-xl'
                      : 'border-stone-200 hover:border-[#F47B20]/50 bg-white shadow-sm'
                  }`}
                >
                  {ticketType === 'STANDARD' && (
                    <div className="absolute -top-3 right-6 bg-[#F47B20] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Sélectionné</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FFF5EB] text-[#F47B20] border border-orange-200 uppercase tracking-wider shadow-sm">
                        STANDARD
                      </span>
                      <div className="text-right">
                        <span className="font-heading font-black text-3xl sm:text-4xl text-stone-900">
                          15 <span className="text-sm font-bold text-stone-500">USD</span>
                        </span>
                      </div>
                    </div>

                    <div className="pb-3 mb-4 border-b border-stone-200">
                      <p className="font-heading font-bold text-base text-stone-900">
                        Pass Visiteur & Conférences
                      </p>
                      <p className="text-xs font-bold text-[#F47B20] mt-0.5">
                        Valable uniquement le 18 octobre 2026
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-stone-600 mb-6">
                      {FESTIVAL_INFO.pricing.standard.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#EDF7F1] text-[#168A45] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('STANDARD');
                      setStep(2);
                    }}
                    className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      ticketType === 'STANDARD'
                        ? 'bg-[#F47B20] text-white shadow-lg hover:bg-[#E06912]'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Choisir Standard (15 USD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* VIP CARD (25 USD) */}
                <div 
                  onClick={() => setTicketType('VIP')}
                  className={`relative rounded-3xl p-6 sm:p-7 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    ticketType === 'VIP'
                      ? 'border-[#F47B20] bg-[#FFF5EB]/40 ring-4 ring-[#F47B20]/20 shadow-xl'
                      : 'border-stone-200 hover:border-orange-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="absolute -top-3 right-6 bg-[#168A45] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>{ticketType === 'VIP' ? 'Sélectionné VIP' : 'Expérience Premium'}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#F47B20] text-white uppercase tracking-wider shadow-sm">
                        VIP PASS
                      </span>
                      <div className="text-right">
                        <span className="font-heading font-black text-3xl sm:text-4xl text-stone-900">
                          25 <span className="text-sm font-bold text-stone-500">USD</span>
                        </span>
                      </div>
                    </div>

                    <div className="pb-3 mb-4 border-b border-orange-200">
                      <p className="font-heading font-bold text-base text-stone-900">
                        Pass Prestige & Cocktail VIP
                      </p>
                      <p className="text-xs font-bold text-[#F47B20] mt-0.5">
                        Valable uniquement le 18 octobre 2026
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-stone-700 mb-6">
                      {FESTIVAL_INFO.pricing.vip.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#EDF7F1] text-[#168A45] flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-snug font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('VIP');
                      setStep(2);
                    }}
                    className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      ticketType === 'VIP'
                        ? 'bg-[#F47B20] text-white shadow-lg hover:bg-[#E06912]'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Choisir VIP (25 USD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Quantity Selector Card */}
              <div className="bg-[#FFF5EB]/50 p-5 sm:p-6 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-stone-900 block">
                    Nombre de billets :
                  </label>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chaque participant recevra son propre billet nominatif avec un QR Code unique.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-xl border border-stone-300 p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-lg bg-stone-100 font-black text-stone-700 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="font-heading font-black text-xl text-stone-900 w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-9 h-9 rounded-lg bg-stone-100 font-black text-stone-700 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right pl-3 border-l border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
                    <span className="font-heading font-black text-xl text-[#F47B20]">
                      {totalAmount} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Step Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-step1-next"
                >
                  <span>Continuer : Informations personnelles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PERSONAL INFORMATION                             */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleNextToSummary} className="space-y-6 animate-in fade-in duration-200">
              
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-black tracking-widest text-[#F47B20] uppercase bg-[#FFF5EB] px-3 py-1 rounded-full border border-orange-200">
                  Étape 2 sur 5
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                  Informations du titulaire
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Ces coordonnées figureront sur votre billet numérique officiel pour le contrôle d'accès.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Patrick"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.firstName && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.firstName}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Nom de famille *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mwamba"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.lastName && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.lastName}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Adresse e-mail (Réception des billets) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="votre.email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.email && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.email}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Numéro de Téléphone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+243 81 234 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.phone && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.phone}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Ville de résidence *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Kinshasa, Lubumbashi, Goma..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.city && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.city}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Pays *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="RDC, Congo, Belgique, France..."
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20] focus:ring-2 focus:ring-[#F47B20]/20 bg-stone-50/50"
                    />
                  </div>
                  {formErrors.country && <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.country}</span>}
                </div>

              </div>

              <div className="flex items-center justify-between pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour au choix du billet</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  id="btn-step2-next"
                >
                  <span>Voir le Résumé de la Commande</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: ORDER SUMMARY                                    */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-black tracking-widest text-[#F47B20] uppercase bg-[#FFF5EB] px-3 py-1 rounded-full border border-orange-200">
                  Étape 3 sur 5
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                  Résumé de votre Commande
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Vérifiez attentivement les détails avant de procéder au règlement en mode démonstration.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="bg-[#FFF5EB]/40 rounded-3xl p-6 sm:p-8 border-2 border-orange-200 space-y-5">
                
                {/* Event & Pass Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-orange-200/60 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F47B20] bg-white border border-orange-200 px-2.5 py-0.5 rounded-md">
                      JAMBO FESTIVAL 2026 • 3e ÉDITION
                    </span>
                    <h4 className="font-heading font-black text-xl sm:text-2xl text-stone-900 mt-1.5">
                      {ticketType === 'VIP' ? 'Pass VIP Prestige' : 'Pass Standard Visiteur'} ({quantity} {quantity > 1 ? 'billets' : 'billet'})
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                      <span className="flex items-center gap-1 font-bold text-[#F47B20]">
                        <Calendar className="w-3.5 h-3.5" />
                        18 Octobre 2026
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#168A45] font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        Musée national de la RDC
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-heading font-black text-3xl text-stone-900">
                      {totalAmount} <span className="text-lg text-[#F47B20]">USD</span>
                    </span>
                    <p className="text-xs text-stone-500">
                      ({pricePerUnit} USD × {quantity} billet{quantity > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>

                {/* Participant Recap Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-2xl border border-stone-200">
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Titulaire :</span>
                    <span className="font-heading font-bold text-sm text-stone-900">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">E-mail de confirmation :</span>
                    <span className="font-semibold text-stone-800">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Téléphone / WhatsApp :</span>
                    <span className="font-semibold text-stone-800">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">Localisation :</span>
                    <span className="font-semibold text-stone-800">{formData.city}, {formData.country}</span>
                  </div>
                </div>

                {/* STRICT VALIDITY WARNING */}
                <div className="bg-[#FFF5EB] border border-[#F47B20]/40 rounded-2xl p-4 text-xs text-stone-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#F47B20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-[#F47B20] uppercase tracking-wide block mb-0.5">
                      Rappel de validité stricte :
                    </span>
                    Ce billet est <strong>valable UNIQUEMENT le 18 octobre 2026</strong> pour la journée d'ouverture et d'exposition au Musée national de la RDC.
                  </div>
                </div>

              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier mes informations</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  id="btn-step3-next"
                >
                  <span>Passer au Paiement DEMO ({totalAmount} USD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: PAYMENT DEMO                                     */}
          {/* ======================================================== */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-black tracking-widest text-[#F47B20] uppercase bg-[#FFF5EB] px-3 py-1 rounded-full border border-orange-200">
                  Étape 4 sur 5
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                  Paiement Sécurisé (Mode DEMO)
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Sélectionnez un canal de paiement pour simuler la transaction et générer votre billet officiel.
                </p>
              </div>

              {/* Demo Notice Banner */}
              <div className="bg-[#EDF7F1] border-2 border-[#168A45]/30 rounded-3xl p-5 sm:p-6 text-stone-900 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <ShieldCheck className="w-7 h-7 text-[#168A45] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-[#168A45]">
                      Passerelle de Démonstration Officielle Active
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed mt-1">
                      Cette interface reproduit fidèlement le processus d'achat réel. En cliquant sur <strong>« Confirmer le Paiement »</strong>, aucun débit bancaire réel n'est effectué, mais un <strong>véritable billet numérique officiel sécurisé par QR Code unique</strong> sera instantanément créé dans la base de données.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                  Sélectionnez votre moyen de paiement :
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Demo Express */}
                  <div 
                    onClick={() => setPaymentProvider('DEMO_EXPRESS')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentProvider === 'DEMO_EXPRESS'
                        ? 'border-[#F47B20] bg-[#FFF5EB] ring-2 ring-[#F47B20]/20 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F47B20] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">Validation 1-Clic DEMO</p>
                        <p className="text-[11px] text-stone-500">Instantané & sans carte</p>
                      </div>
                    </div>
                    {paymentProvider === 'DEMO_EXPRESS' && <CheckCircle2 className="w-5 h-5 text-[#F47B20]" />}
                  </div>

                  {/* M-Pesa */}
                  <div 
                    onClick={() => setPaymentProvider('MPESA')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentProvider === 'MPESA'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        M-PESA
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">M-Pesa (Vodacom RDC)</p>
                        <p className="text-[11px] text-stone-500">Paiement Mobile Money</p>
                      </div>
                    </div>
                    {paymentProvider === 'MPESA' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>

                  {/* Orange Money */}
                  <div 
                    onClick={() => setPaymentProvider('ORANGE_MONEY')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentProvider === 'ORANGE_MONEY'
                        ? 'border-[#F47B20] bg-orange-50 ring-2 ring-[#F47B20]/20 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F47B20] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        OM
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">Orange Money RDC</p>
                        <p className="text-[11px] text-stone-500">Paiement Mobile Money</p>
                      </div>
                    </div>
                    {paymentProvider === 'ORANGE_MONEY' && <CheckCircle2 className="w-5 h-5 text-[#F47B20]" />}
                  </div>

                  {/* Airtel Money */}
                  <div 
                    onClick={() => setPaymentProvider('AIRTEL_MONEY')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentProvider === 'AIRTEL_MONEY'
                        ? 'border-red-600 bg-red-50 ring-2 ring-red-500/20 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        AIRTEL
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">Airtel Money RDC</p>
                        <p className="text-[11px] text-stone-500">Paiement Mobile Money</p>
                      </div>
                    </div>
                    {paymentProvider === 'AIRTEL_MONEY' && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                  </div>

                </div>

                {/* Simulated Phone Input for Mobile Money */}
                {paymentProvider !== 'DEMO_EXPRESS' && paymentProvider !== 'CARD' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-in fade-in">
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Numéro de compte Mobile Money :
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="tel"
                        placeholder="Ex: 081 234 56 78"
                        value={mobileNumber || formData.phone}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      En mode démo, aucune invite USSD réelle ne sera envoyée sur votre téléphone.
                    </span>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-stone-200">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessPayment}
                  className="px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-xl transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  id="btn-confirm-payment"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingStatus}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmer & Générer mon Billet ({totalAmount} USD)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: CONFIRMATION & DIGITAL TICKET PRESENTATION       */}
          {/* ======================================================== */}
          {step === 5 && (
            <div className="space-y-8 text-center animate-in zoom-in-95 duration-300">
              
              <div className="w-20 h-20 bg-[#EDF7F1] text-[#168A45] rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-[#168A45]/20">
                <CheckCircle2 className="w-12 h-12 text-[#168A45]" />
              </div>

              <div>
                <span className="px-4 py-1.5 rounded-full bg-[#EDF7F1] text-[#168A45] text-xs font-black uppercase tracking-widest border border-[#168A45]/30">
                  Commande Confirmée avec Succès
                </span>
                <h3 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 mt-3">
                  FÉLICITATIONS, {formData.firstName.toUpperCase()} !
                </h3>
                <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-xl mx-auto">
                  Votre billet officiel pour le <strong>JAMBO FESTIVAL 2026</strong> a été généré avec son QR Code sécurisé.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFF5EB] text-[#F47B20] border border-orange-200 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Valable UNIQUEMENT le 18 octobre 2026 au Musée national de la RDC</span>
                </div>
              </div>

              {/* List of Generated Tickets */}
              <div className="space-y-4 max-w-2xl mx-auto text-left">
                {purchasedTickets.map((t) => (
                  <div 
                    key={t.ticketId}
                    className="p-6 rounded-3xl bg-white border-2 border-[#F47B20] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.type === 'VIP' ? 'bg-[#F47B20] text-white' : 'bg-[#168A45] text-white'
                        }`}>
                          {t.type} PASS
                        </span>
                        <span className="font-mono font-black text-base text-[#F47B20]">
                          {t.ticketId}
                        </span>
                      </div>
                      <p className="font-heading font-black text-lg text-stone-900 mt-1.5">
                        {t.participant.firstName} {t.participant.lastName}
                      </p>
                      <p className="text-xs text-stone-500 font-medium">
                        18 Octobre 2026 • Musée national de la RDC, Kinshasa
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveDigitalTicket(t)}
                        className="px-5 py-3 rounded-2xl text-xs font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Ouvrir Billet & QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-xl mx-auto">
                {purchasedTickets.length > 0 && (
                  <button
                    onClick={() => setActiveDigitalTicket(purchasedTickets[0])}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger / Imprimer mon Billet (PDF)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setStep(1);
                    if (onCloseModal) onCloseModal();
                  }}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Effectuer un autre achat
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Render Digital Ticket Modal when active */}
      {activeDigitalTicket && (
        <DigitalTicketModal
          ticket={activeDigitalTicket}
          onClose={() => setActiveDigitalTicket(null)}
        />
      )}

    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-4xl my-8 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#F47B20] text-white">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-white" />
              <span className="font-heading font-black text-sm uppercase tracking-wider">
                Billetterie JAMBO Festival 2026
              </span>
            </div>
            <button
              onClick={onCloseModal}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Fermer ✕
            </button>
          </div>
          <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="billetterie" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-kuba-subtle opacity-30 pointer-events-none" />
      <div className="relative z-10">
        {content}
      </div>
    </section>
  );
};
