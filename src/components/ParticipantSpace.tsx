import React, { useState } from 'react';
import { 
  User, 
  Ticket as TicketIcon, 
  Search, 
  Download, 
  QrCode, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Compass,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Ticket, HikeRegistration, TrainingRegistration } from '../types';
import { DigitalTicketModal } from './DigitalTicketModal';

interface ParticipantSpaceProps {
  onBackToHome: () => void;
  onOpenTicketing: () => void;
}

export const ParticipantSpace: React.FC<ParticipantSpaceProps> = ({
  onBackToHome,
  onOpenTicketing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [userHikes, setUserHikes] = useState<HikeRegistration[]>([]);
  const [userTrainings, setUserTrainings] = useState<TrainingRegistration[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    
    // Find tickets matching email, phone or ticketId
    const allTickets = storageService.getTickets();
    const matchedTickets = allTickets.filter(t => 
      t.ticketId.toLowerCase().includes(query) ||
      t.participant.email.toLowerCase().includes(query) ||
      t.participant.phone.includes(query) ||
      t.participant.lastName.toLowerCase().includes(query)
    );

    // Find hike registrations
    const allHikes = storageService.getHikeRegistrations();
    const matchedHikes = allHikes.filter(h => 
      h.email.toLowerCase().includes(query) || 
      h.phone.includes(query) ||
      h.lastName.toLowerCase().includes(query)
    );

    // Find training registrations
    const allTrainings = storageService.getTrainingRegistrations();
    const matchedTrainings = allTrainings.filter(tr => 
      tr.email.toLowerCase().includes(query) || 
      tr.phone.includes(query) ||
      tr.lastName.toLowerCase().includes(query)
    );

    setUserTickets(matchedTickets);
    setUserHikes(matchedHikes);
    setUserTrainings(matchedTrainings);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700 hover:text-[#F47B20] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#F47B20] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Espace Participant</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900">
            MON ESPACE JAMBO 2026
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Retrouvez vos billets du 18 octobre, vos inscriptions aux formations et vos réservations pour la randonnée du 24 octobre.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="text-xs font-bold text-stone-700 block">
              Rechercher avec votre adresse e-mail, téléphone ou numéro de billet (JF26-...) :
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: patrick.mwamba@email.com ou JF26-..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#F47B20]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Rechercher mes Billets</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Container */}
        {searched && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Section 1: Official Tickets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="font-heading font-bold text-xl text-stone-900 flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-[#F47B20]" />
                  <span>Mes Billets Officiels — 18 Octobre 2026 ({userTickets.length})</span>
                </h3>
              </div>

              {userTickets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-dashed border-stone-300 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs sm:text-sm text-stone-500">
                    Aucun billet trouvé pour cette recherche.
                  </p>
                  <button
                    onClick={onOpenTicketing}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors cursor-pointer"
                  >
                    Acheter un billet maintenant
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTickets.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="bg-white rounded-2xl p-6 border-2 border-[#F47B20] shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                            ticket.type === 'VIP' ? 'bg-[#F47B20] text-white' : 'bg-[#168A45] text-white'
                          }`}>
                            {ticket.type} PASS
                          </span>
                          <span className="font-mono font-bold text-sm text-[#F47B20]">
                            {ticket.ticketId}
                          </span>
                        </div>

                        <h4 className="font-heading font-extrabold text-lg text-stone-900 mb-1">
                          {ticket.participant.firstName} {ticket.participant.lastName}
                        </h4>

                        <div className="space-y-1 text-xs text-stone-600 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#F47B20]" />
                            <span className="font-semibold">{ticket.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span>Musée national de la RDC, Kinshasa</span>
                          </div>
                        </div>

                        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200 text-[11px] text-[#F47B20] font-semibold mb-4">
                          * Valable UNIQUEMENT le 18 octobre 2026.
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-white" />
                        <span>Afficher le Billet & QR Code</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Hike Registrations */}
            {userHikes.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <h3 className="font-heading font-bold text-xl text-stone-900">
                  Pré-inscriptions Randonnée — 24 Octobre 2026 ({userHikes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userHikes.map((hike) => (
                    <div key={hike.id} className="bg-emerald-50 rounded-2xl p-5 border border-[#168A45]/30">
                      <span className="text-[10px] font-bold uppercase text-[#168A45] bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                        Amani Eco-Park
                      </span>
                      <h4 className="font-heading font-bold text-base text-stone-900 mt-2">
                        {hike.firstName} {hike.lastName} ({hike.groupSize} {hike.groupSize > 1 ? 'personnes' : 'personne'})
                      </h4>
                      <p className="text-xs text-stone-600 mt-1">
                        Statut : En attente de publication des modalités tarifaires. Vous serez contacté par e-mail / WhatsApp.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Training Registrations */}
            {userTrainings.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <h3 className="font-heading font-bold text-xl text-stone-900">
                  Candidatures Formations JAMBO ({userTrainings.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTrainings.map((tr) => (
                    <div key={tr.id} className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
                      <span className="text-[10px] font-bold uppercase text-[#F47B20] bg-orange-100 px-2.5 py-0.5 rounded-full font-bold">
                        {tr.trainingType}
                      </span>
                      <h4 className="font-heading font-bold text-base text-stone-900 mt-2">
                        {tr.firstName} {tr.lastName}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1">
                        Statut : Dossier reçu. L'équipe de formation procède à la sélection.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modal View */}
      {selectedTicket && (
        <DigitalTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
};
