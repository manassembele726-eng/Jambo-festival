import { 
  Ticket, 
  Order, 
  Activity, 
  HikeRegistration, 
  TrainingRegistration, 
  CheckInResult, 
  TicketType,
  ContactMessage,
  FestivalStats
} from '../types';
import { INITIAL_ACTIVITIES } from '../data/festivalData';

const TICKETS_KEY = 'jambo_tickets_v1';
const ORDERS_KEY = 'jambo_orders_v1';
const HIKE_KEY = 'jambo_hike_registrations_v1';
const TRAINING_KEY = 'jambo_training_registrations_v1';
const ACTIVITIES_KEY = 'jambo_activities_v1';
const MESSAGES_KEY = 'jambo_contact_messages_v1';
const SCAN_LOGS_KEY = 'jambo_scan_logs_v1';

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  query: string;
  code: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'UNPAID';
  ticketId?: string;
  participantName?: string;
  ticketType?: TicketType;
  details?: string;
}

function generateTicketNumber(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `JF26-${randomNum}`;
}

function generateQrToken(ticketId: string, email: string): string {
  const timestamp = Date.now().toString(36);
  const salt = Math.random().toString(36).substring(2, 8);
  return `TKN-${ticketId}-${timestamp}-${salt}`;
}

// Initial demo seed tickets for testing all 4 scanner conditions
const SEED_TICKETS: Ticket[] = [
  {
    ticketId: 'JF26-004582',
    orderId: 'ORD-DEMO-001',
    type: 'VIP',
    price: 25,
    currency: 'USD',
    eventDate: '18 Octobre 2026',
    validityNotice: 'UNIQUEMENT LE 18 OCTOBRE 2026',
    status: 'PAID',
    qrToken: 'TKN-JF26-004582-k9a21b-m8z7',
    participant: {
      firstName: 'Ketsia',
      lastName: 'Mwamba',
      email: 'ketsia.mwamba@example.cd',
      phone: '+243 81 234 5678',
      city: 'Kinshasa',
      country: 'RDC',
    },
    checkedIn: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    ticketId: 'JF26-008914',
    orderId: 'ORD-DEMO-002',
    type: 'STANDARD',
    price: 15,
    currency: 'USD',
    eventDate: '18 Octobre 2026',
    validityNotice: 'UNIQUEMENT LE 18 OCTOBRE 2026',
    status: 'PAID',
    qrToken: 'TKN-JF26-008914-j8c34f-l4p1',
    participant: {
      firstName: 'Patrick',
      lastName: 'Lumumba',
      email: 'patrick.lumumba@example.cd',
      phone: '+243 99 876 5432',
      city: 'Kinshasa',
      country: 'RDC',
    },
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    usedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    ticketId: 'JF26-001209',
    orderId: 'ORD-DEMO-003',
    type: 'STANDARD',
    price: 15,
    currency: 'USD',
    eventDate: '18 Octobre 2026',
    validityNotice: 'UNIQUEMENT LE 18 OCTOBRE 2026',
    status: 'PAID',
    qrToken: 'TKN-JF26-001209-h4d71x-v3w9',
    participant: {
      firstName: 'Dorcas',
      lastName: 'Kalala',
      email: 'dorcas.kalala@example.cd',
      phone: '+243 85 432 1098',
      city: 'Goma',
      country: 'RDC',
    },
    checkedIn: false,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    ticketId: 'JF26-009999',
    orderId: 'ORD-DEMO-004',
    type: 'STANDARD',
    price: 15,
    currency: 'USD',
    eventDate: '18 Octobre 2026',
    validityNotice: 'UNIQUEMENT LE 18 OCTOBRE 2026',
    status: 'PENDING',
    qrToken: 'TKN-JF26-009999-unpaid-pending',
    participant: {
      firstName: 'Éric',
      lastName: 'Tshisekedi',
      email: 'eric.t@example.cd',
      phone: '+243 82 000 1122',
      city: 'Kinshasa',
      country: 'RDC',
    },
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const storageService = {
  getTickets(): Ticket[] {
    try {
      const stored = localStorage.getItem(TICKETS_KEY);
      if (!stored) {
        localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED_TICKETS));
        return SEED_TICKETS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_TICKETS;
    }
  },

  getTicketById(ticketId: string): Ticket | undefined {
    const tickets = this.getTickets();
    const cleanId = ticketId.trim().toUpperCase();
    return tickets.find(t => t.ticketId.trim().toUpperCase() === cleanId);
  },

  getTicketByToken(token: string): Ticket | undefined {
    const tickets = this.getTickets();
    const cleanToken = token.trim();
    return tickets.find(t => t.qrToken === cleanToken || t.ticketId.toUpperCase() === cleanToken.toUpperCase());
  },

  getTicketsByEmail(email: string): Ticket[] {
    const tickets = this.getTickets();
    const cleanEmail = email.trim().toLowerCase();
    return tickets.filter(t => t.participant.email.toLowerCase() === cleanEmail);
  },

  createOrderAndTickets(params: {
    type: TicketType;
    quantity: number;
    price: number;
    participant: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      city: string;
      country: string;
    };
    paymentMethod: string;
  }): { order: Order; tickets: Ticket[] } {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const generatedTickets: Ticket[] = [];

    for (let i = 0; i < params.quantity; i++) {
      const ticketId = generateTicketNumber();
      const qrToken = generateQrToken(ticketId, params.participant.email);
      const ticket: Ticket = {
        ticketId,
        orderId,
        type: params.type,
        price: params.price,
        currency: 'USD',
        eventDate: '18 Octobre 2026',
        validityNotice: 'UNIQUEMENT LE 18 OCTOBRE 2026',
        status: 'PAID',
        qrToken,
        participant: { ...params.participant },
        checkedIn: false,
        createdAt: now,
      };
      generatedTickets.push(ticket);
    }

    const order: Order = {
      orderId,
      tickets: generatedTickets,
      totalAmount: params.price * params.quantity,
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentMethod: params.paymentMethod || 'Paiement Démonstration (Sécurisé)',
      paymentReference: `DEMO-TX-${Date.now()}`,
      createdAt: now,
      customer: { ...params.participant },
    };

    // Save to localStorage
    const existingTickets = this.getTickets();
    const updatedTickets = [...generatedTickets, ...existingTickets];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));

    const existingOrders = this.getOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existingOrders]));

    // Synchronize asynchronously with backend API
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, tickets: generatedTickets }),
    }).catch(() => {});

    return { order, tickets: generatedTickets };
  },

  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  updateTicketStatus(ticketId: string, updates: Partial<Ticket>): Ticket | undefined {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.ticketId.toUpperCase() === ticketId.trim().toUpperCase());
    if (idx === -1) return undefined;

    tickets[idx] = { ...tickets[idx], ...updates };
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    return tickets[idx];
  },

  /**
   * Complete Check-in System with 4 Strict Outcomes:
   * 1. VALID -> BILLET VALIDE
   * 2. ALREADY_USED -> BILLET DÉJÀ UTILISÉ
   * 3. INVALID -> BILLET INVALIDE
   * 4. UNPAID -> PAIEMENT NON CONFIRMÉ
   */
  verifyAndCheckInTicket(query: string, adminName: string = 'Staff Contrôle Entrée'): CheckInResult {
    const cleanQuery = query.trim();
    const cleanUpper = cleanQuery.toUpperCase();
    const tickets = this.getTickets();

    // Look up by ticketId or by full qrToken
    const ticketIndex = tickets.findIndex(
      t => t.ticketId.toUpperCase() === cleanUpper || t.qrToken === cleanQuery || t.qrToken.toUpperCase() === cleanUpper
    );

    // 1. NON-EXISTENT TICKET -> BILLET INVALIDE
    if (ticketIndex === -1) {
      this.recordScanLog({
        query: cleanQuery,
        code: 'INVALID',
        details: 'Aucun enregistrement correspondant trouvé dans la billetterie officielle.',
      });

      return {
        valid: false,
        code: 'INVALID',
        message: 'BILLET INVALIDE : Ce code ne correspond à aucun billet officiel enregistré.',
      };
    }

    const ticket = tickets[ticketIndex];

    // 2. UNCONFIRMED PAYMENT -> PAIEMENT NON CONFIRMÉ
    if (ticket.status !== 'PAID' && ticket.status !== 'USED') {
      this.recordScanLog({
        query: cleanQuery,
        code: 'UNPAID',
        ticketId: ticket.ticketId,
        participantName: `${ticket.participant.firstName} ${ticket.participant.lastName}`,
        ticketType: ticket.type,
        details: `Statut paiement : ${ticket.status}. Veuillez rediriger le participant vers la caisse.`,
      });

      return {
        valid: false,
        code: 'UNPAID',
        message: 'PAIEMENT NON CONFIRMÉ : Le règlement de ce billet n\'a pas encore été validé.',
        ticket,
      };
    }

    // 3. ALREADY CHECKED IN -> BILLET DÉJÀ UTILISÉ (PREVENTS DOUBLE USAGE)
    if (ticket.checkedIn === true || ticket.status === 'USED') {
      const formattedTime = ticket.checkedInAt 
        ? new Date(ticket.checkedInAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : 'Précédemment';

      this.recordScanLog({
        query: cleanQuery,
        code: 'ALREADY_USED',
        ticketId: ticket.ticketId,
        participantName: `${ticket.participant.firstName} ${ticket.participant.lastName}`,
        ticketType: ticket.type,
        details: `Tentative de réutilisation. Billet déjà validé à ${formattedTime}.`,
      });

      return {
        valid: false,
        code: 'ALREADY_USED',
        message: `BILLET DÉJÀ UTILISÉ : Ce billet a déjà été scanné et validé à l'entrée à ${formattedTime}.`,
        ticket,
      };
    }

    // 4. VALID TICKET -> BILLET VALIDE & IMMEDIATE CHECK-IN RECORDING
    const checkInTime = new Date().toISOString();
    ticket.checkedIn = true;
    ticket.checkedInAt = checkInTime;
    ticket.usedAt = checkInTime;
    ticket.usedByAdmin = adminName;
    ticket.status = 'USED'; // marked as used in database

    tickets[ticketIndex] = ticket;
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

    // Record in local scan logs
    this.recordScanLog({
      query: cleanQuery,
      code: 'VALID',
      ticketId: ticket.ticketId,
      participantName: `${ticket.participant.firstName} ${ticket.participant.lastName}`,
      ticketType: ticket.type,
      details: `Check-in enregistré le 18 Octobre 2026 à ${new Date(checkInTime).toLocaleTimeString('fr-FR')}.`,
    });

    // Synchronize check-in immediately to server backend
    fetch('/api/tickets/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.ticketId, adminName }),
    }).catch(() => {});

    return {
      valid: true,
      code: 'VALID',
      message: 'BILLET VALIDE : Accès autorisé au Musée national de la RDC pour la journée du 18 octobre 2026.',
      ticket,
    };
  },

  // Scan Logs Management
  getScanLogs(): ScanLogEntry[] {
    try {
      const stored = localStorage.getItem(SCAN_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  recordScanLog(entry: Omit<ScanLogEntry, 'id' | 'timestamp'>): ScanLogEntry {
    const newEntry: ScanLogEntry = {
      id: `SCAN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const current = this.getScanLogs();
    const updated = [newEntry, ...current].slice(0, 50); // keep last 50
    localStorage.setItem(SCAN_LOGS_KEY, JSON.stringify(updated));
    return newEntry;
  },

  clearScanLogs(): void {
    localStorage.removeItem(SCAN_LOGS_KEY);
  },

  resetDemoTickets(): void {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED_TICKETS));
    this.clearScanLogs();
  },

  // HIKE REGISTRATIONS (24 Octobre)
  getHikeRegistrations(): HikeRegistration[] {
    try {
      const stored = localStorage.getItem(HIKE_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: 'HIKE-001',
          firstName: 'Sarah',
          lastName: 'Mpemba',
          email: 'sarah.m@example.cd',
          phone: '+243 82 111 2233',
          groupSize: 2,
          comments: 'Passionnée de randonnée pédestre',
          status: 'CONFIRMED',
          registeredAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  addHikeRegistration(data: Omit<HikeRegistration, 'id' | 'status' | 'createdAt' | 'registeredAt'>): HikeRegistration {
    const reg: HikeRegistration = {
      id: `HIKE-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      status: 'CONFIRMED',
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const current = this.getHikeRegistrations();
    localStorage.setItem(HIKE_KEY, JSON.stringify([reg, ...current]));
    return reg;
  },

  // TRAINING REGISTRATIONS
  getTrainingRegistrations(): TrainingRegistration[] {
    try {
      const stored = localStorage.getItem(TRAINING_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: 'TRN-001',
          firstName: 'Chantal',
          lastName: 'Bukasa',
          email: 'chantal.b@example.cd',
          phone: '+243 89 555 4433',
          trainingType: 'Hôtesse professionnelle',
          experienceLevel: 'Débutante motivée',
          motivation: 'Je souhaite travailler dans l\'accueil touristique lors de grands événements.',
          status: 'CONFIRMÉ',
          registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  addTrainingRegistration(data: Omit<TrainingRegistration, 'id' | 'status' | 'createdAt' | 'registeredAt'>): TrainingRegistration {
    const reg: TrainingRegistration = {
      id: `TRN-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      status: 'CONFIRMÉ',
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const current = this.getTrainingRegistrations();
    localStorage.setItem(TRAINING_KEY, JSON.stringify([reg, ...current]));
    return reg;
  },

  // ACTIVITIES MANAGEMENT
  getActivities(): Activity[] {
    try {
      const stored = localStorage.getItem(ACTIVITIES_KEY);
      if (!stored) {
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
        return INITIAL_ACTIVITIES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  updateActivity(id: string, updates: Partial<Activity>): Activity | undefined {
    const activities = this.getActivities();
    const idx = activities.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    activities[idx] = { ...activities[idx], ...updates };
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    return activities[idx];
  },

  // CONTACT MESSAGES
  getContactMessages(): ContactMessage[] {
    try {
      const stored = localStorage.getItem(MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: 'MSG-001',
          name: 'Jean-Luc Kazadi',
          email: 'jeanluc.k@example.cd',
          subject: 'Partenariat Agence de voyage',
          message: 'Bonjour, notre agence souhaite exposer un stand lors de la journée du 18 octobre. Pouvez-vous nous transmettre la grille tarifaire exposants ?',
          status: 'UNREAD',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  addContactMessage(data: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage {
    const msg: ContactMessage = {
      id: `MSG-${Date.now().toString(36).toUpperCase()}`,
      status: 'UNREAD',
      ...data,
      createdAt: new Date().toISOString(),
    };
    const current = this.getContactMessages();
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([msg, ...current]));
    return msg;
  },

  // STATS
  getStats(): FestivalStats {
    const tickets = this.getTickets();
    const hikes = this.getHikeRegistrations();
    const trainings = this.getTrainingRegistrations();

    const standardSold = tickets.filter(t => t.type === 'STANDARD').length;
    const vipSold = tickets.filter(t => t.type === 'VIP').length;
    const scannedCount = tickets.filter(t => t.checkedIn || t.status === 'USED').length;
    const revenue = tickets
      .filter(t => t.status === 'PAID' || t.status === 'USED')
      .reduce((sum, t) => sum + (t.price || 0), 0);

    return {
      totalSold: tickets.length,
      standardSold,
      vipSold,
      scannedCount,
      revenue,
      hikeRegistrations: hikes.reduce((acc, h) => acc + (h.groupSize || 1), 0),
      trainingRegistrations: trainings.length,
    };
  },
};
