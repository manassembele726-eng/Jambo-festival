import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  AdminUser, 
  TicketPricingTier, 
  FestivalEvent, 
  NewsArticle, 
  GalleryAlbum, 
  MediaFile, 
  SiteSettings, 
  AuditLog, 
  ContactMessage, 
  Ticket, 
  Order, 
  HikeRegistration, 
  TrainingRegistration 
} from '../src/types';
import { FESTIVAL_INFO, INITIAL_ACTIVITIES } from '../src/data/festivalData';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface StoredUser extends AdminUser {
  passwordHash: string;
  passwordSalt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  settings: SiteSettings;
  pricingTiers: TicketPricingTier[];
  events: FestivalEvent[];
  news: NewsArticle[];
  galleryAlbums: GalleryAlbum[];
  mediaFiles: MediaFile[];
  messages: ContactMessage[];
  tickets: Ticket[];
  orders: Order[];
  hikes: HikeRegistration[];
  trainings: TrainingRegistration[];
  auditLogs: AuditLog[];
  content: {
    hero: {
      headline: string;
      subheadline: string;
      slogan: string;
      tagline: string;
      closingTagline: string;
      bannerBadge: string;
    };
    about: {
      title: string;
      mission: string;
      vision: string;
      historyShort: string;
    };
    transport: {
      title: string;
      details: string;
      status: string;
    };
    hike: {
      title: string;
      date: string;
      location: string;
      description: string;
      pricingNotice: string;
    };
  };
}

// Password Hashing using PBKDF2 (Native Node.js Crypto)
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

// Initial Admin Credentials (Salted & Hashed for Security)
const initialAdminPwd = hashPassword('AdminJambo2026!');
const superAdminUser: StoredUser = {
  id: 'USR-SUPER-001',
  email: 'admin@jambofestival.cd',
  firstName: 'Direction',
  lastName: 'JAMBO Festival',
  role: 'SUPER_ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  phone: '+243 81 000 2026',
  active: true,
  createdAt: new Date().toISOString(),
  passwordHash: initialAdminPwd.hash,
  passwordSalt: initialAdminPwd.salt,
};

// Initial Site Settings
const initialSettings: SiteSettings = {
  general: {
    siteName: 'JAMBO FESTIVAL 2026',
    edition: '3e édition',
    slogan: '« Pesa tourisme ya mboka chance ! »',
    mainTagline: '« À la découverte des richesses naturelles, culturelles et touristiques de la République démocratique du Congo. »',
    heroClosingTagline: '« JAMBO Festival, plus qu\'un événement : une vitrine du tourisme congolais et une invitation à porter l\'image de la RDC plus loin ! »',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    description: 'Portail officiel de la 3e édition du JAMBO Festival (18 & 24 Octobre 2026) : billetterie numérique avec QR code, réservations grande randonnée, formations métiers de l\'accueil et contrôle d\'accès.',
  },
  contact: {
    email: 'contact@jambofestival.cd',
    phone: '+243 81 000 2026',
    whatsapp: '+243 81 000 2026',
    address: 'Boulevard Triomphal',
    city: 'Kinshasa',
    country: 'République démocratique du Congo',
  },
  socials: {
    facebook: 'https://facebook.com/jambofestival',
    instagram: 'https://instagram.com/jambofestival',
    tiktok: 'https://tiktok.com/@jambofestival',
    youtube: 'https://youtube.com/@jambofestival',
    twitter: 'https://twitter.com/jambofestival',
    linkedin: 'https://linkedin.com/company/jambofestival',
  },
  seo: {
    metaTitle: 'JAMBO FESTIVAL 2026 | 3e Édition Officielle — Kinshasa, RDC',
    metaDescription: 'Rejoignez la 3e édition du JAMBO Festival les 18 et 24 octobre 2026 à Kinshasa. Billetterie officielle, pass VIP, grande randonnée et valorisation du tourisme congolais.',
    ogImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    keywords: 'JAMBO Festival 2026, Tourisme RDC, Kinshasa, Musée national RDC, Amani Eco-Park, Malicka Mukuba, Billetterie officielle',
  },
  dates: {
    day1: '18 Octobre 2026',
    day2: '24 Octobre 2026',
    summary: '18 & 24 OCTOBRE 2026',
  },
};

// Initial Pricing Tiers
const initialPricingTiers: TicketPricingTier[] = [
  {
    id: 'TIER-STD',
    type: 'STANDARD',
    name: 'Billet Standard',
    price: 15,
    currency: 'USD',
    validity: 'Valable UNIQUEMENT le 18 octobre 2026',
    description: 'Accès complet à la journée professionnelle, culturelle et touristique au Musée national de la RDC.',
    features: [
      'Accès complet à la journée du 18 octobre 2026',
      'Accès à l\'exposition au Musée national de la RDC',
      'Participation aux panels & ateliers thématiques',
      'Accès à l\'espace networking et rencontres',
      'Billet numérique nominatif avec QR Code sécurisé',
    ],
    availableQuantity: 500,
    soldQuantity: 42,
    status: 'ACTIVE',
    highlight: false,
  },
  {
    id: 'TIER-VIP',
    type: 'VIP',
    name: 'Pass VIP Accès Privilège',
    price: 25,
    currency: 'USD',
    validity: 'Valable UNIQUEMENT le 18 octobre 2026',
    description: 'Expérience haut de gamme avec espace lounge VIP, cocktail et rencontres d\'honneur.',
    features: [
      'Accès VIP privilégié à la journée du 18 octobre 2026',
      'Accès à l\'espace VIP Lounge & cocktail de bienvenue',
      'Places réservées au premier rang lors des conférences',
      'Accès prioritaire à l\'exposition au Musée national',
      'Kit festival exclusif & badge collector',
      'Rencontre privilégiée avec les invités et personnalités',
    ],
    availableQuantity: 150,
    soldQuantity: 18,
    status: 'ACTIVE',
    highlight: true,
  },
  {
    id: 'TIER-PREMIUM',
    type: 'PREMIUM',
    name: 'Pass Entreprise & Délégation',
    price: 60,
    currency: 'USD',
    validity: 'Valable UNIQUEMENT le 18 octobre 2026',
    description: 'Formule entreprise incluant badge personnalisé, mention catalogue et accès carré VIP.',
    features: [
      'Accès VIP 18 octobre 2026',
      'Table réservée au déjeuner protocolaire',
      'Visibilité de votre organisation dans le livret officiel',
      'Rencontre B2B ciblée avec les opérateurs touristiques',
    ],
    availableQuantity: 50,
    soldQuantity: 8,
    status: 'ACTIVE',
    highlight: false,
  },
];

// Initial Events
const initialEvents: FestivalEvent[] = [
  {
    id: 'EVT-001',
    name: 'Journée Professionnelle & Culturelle au Musée National',
    description: 'Conférences, panels d\'experts, remise officielle de brevets et grande exposition touristique.',
    date: '18 Octobre 2026',
    time: '08h30 - 18h00',
    location: 'Kinshasa, RDC',
    venue: 'Musée national de la RDC',
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    price: '15$ Standard / 25$ VIP',
    category: 'Journée Officielle',
    status: 'PUBLISHED',
    additionalInfo: 'Tenue de ville ou pagne traditionnel recommandée.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EVT-002',
    name: 'Grande Randonnée Écotouristique à Amani Eco-Park',
    description: 'Immersion nature, marche guidée, sensibilisation à la préservation de la biodiversité et repas champêtre.',
    date: '24 Octobre 2026',
    time: '07h00 - 16h00',
    location: 'Mitendi, Kinshasa',
    venue: 'Amani Eco-Park, Mitendi',
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
    price: 'Tarif et modalités de réservation à venir',
    category: 'Écotourisme',
    status: 'PUBLISHED',
    additionalInfo: 'Activité distincte de la journée du 18 octobre. Prévoir chaussures de marche adaptées.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial News
const initialNews: NewsArticle[] = [
  {
    id: 'NEWS-001',
    title: 'Lancement officiel des préparatifs de la 3e édition du JAMBO Festival',
    slug: 'lancement-officiel-preparatifs-jambo-2026',
    excerpt: 'Le comité d\'organisation dévoile les grandes orientations de l\'édition 2026 placée sous le parrainage de Madame Malicka Mukuba.',
    content: `La 3e édition du JAMBO Festival s'annonce comme le rendez-vous incontournable du tourisme en République démocratique du Congo. Avec pour mot d'ordre « Pesa tourisme ya mboka chance ! », l'événement rassemblera professionnels, passionnés d'écotourisme, investisseurs et jeunes diplômées des métiers de l'accueil.\n\nRendez-vous le 18 octobre 2026 au Musée national de la RDC et le 24 octobre pour la grande randonnée à Amani Eco-Park Mitendi.`,
    category: 'Communiqué Officiel',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    author: 'Comité de Rédaction JAMBO',
    status: 'PUBLISHED',
    publishedAt: '2026-08-20T10:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'NEWS-002',
    title: 'Focus Métiers de l\'Accueil : Des formations certifiantes pour valoriser l\'hospitalité congolaise',
    slug: 'focus-metiers-accueil-formations-certifiantes',
    excerpt: 'Comment JAMBO Festival forme et certifie chaque année des dizaines de jeunes femmes pour booster l\'emploi dans le secteur hôtelier.',
    content: `L'autonomisation des femmes et l'insertion professionnelle des jeunes demeurent au cœur de la mission de JAMBO Festival. Les modules dispensés en hôtellerie et guidage touristique visent l'excellence et le professionnalisme selon les plus hauts standards internationaux.`,
    category: 'Formation & Emploi',
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    author: 'Direction des Formations',
    status: 'PUBLISHED',
    publishedAt: '2026-08-22T14:30:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Gallery
const initialGalleryAlbums: GalleryAlbum[] = [
  {
    id: 'ALB-001',
    title: 'Édition Précédente — 15 Mars 2025 à Kinkole',
    description: 'Retour en images sur la 2e édition : conférences, randonnée et remise solennelle des brevets.',
    category: 'Rétrospective',
    year: '2025',
    isPublished: true,
    coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    images: [
      {
        id: 'IMG-01',
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
        title: 'Visite guidée et découverte fluviale',
        caption: 'Exploration touristique des berges du fleuve Congo.',
      },
      {
        id: 'IMG-02',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
        title: 'Cérémonie de remise des brevets',
        caption: 'Fierté des lauréates certifiées en accueil et protocole.',
      },
      {
        id: 'IMG-03',
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        title: 'Table ronde des acteurs du tourisme',
        caption: 'Échanges enrichissants entre l\'ONT et les promoteurs d\'éco-lodges.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Initial Seed Messages
const initialMessages: ContactMessage[] = [
  {
    id: 'MSG-001',
    name: 'Jean-Luc Kazadi',
    email: 'jeanluc.k@example.cd',
    phone: '+243 81 234 5678',
    subject: 'Partenariat Agence de voyage & Stand',
    message: 'Bonjour, notre agence souhaite exposer un stand d\'information lors de la journée du 18 octobre au Musée national. Pouvez-vous nous transmettre les modalités de sponsoring ?',
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'MSG-002',
    name: 'Clarisse Mabiala',
    email: 'clarisse.m@example.cd',
    phone: '+243 99 876 5432',
    subject: 'Inscription Groupe Randonnée 24 Octobre',
    message: 'Bonjour, nous sommes un club de randonnée de 12 personnes à Kinshasa. Quand pourrons-nous réserver nos places pour Amani Eco-Park ?',
    status: 'READ',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Initial Audit Logs
const initialAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    userId: 'USR-SUPER-001',
    userName: 'Direction JAMBO',
    userRole: 'SUPER_ADMIN',
    action: 'INITIALISATION',
    entity: 'SYSTEM',
    details: 'Initialisation sécurisée de la plateforme d\'administration JAMBO Festival 2026',
    timestamp: new Date().toISOString(),
  },
];

// Initial Dynamic Content
const initialContent = {
  hero: {
    headline: 'JAMBO FESTIVAL 2026',
    subheadline: '3e édition • 18 & 24 Octobre 2026 • Kinshasa, RDC',
    slogan: '« Pesa tourisme ya mboka chance ! »',
    tagline: '« À la découverte des richesses naturelles, culturelles et touristiques de la République démocratique du Congo. »',
    closingTagline: '« JAMBO Festival, plus qu\'un événement : une vitrine du tourisme congolais et une invitation à porter l\'image de la RDC plus loin ! »',
    bannerBadge: '3e ÉDITION OFFICIELLE • BILLETTERIE OUVERTE',
  },
  about: {
    title: 'Qu\'est-ce que JAMBO Festival ?',
    mission: 'Innover dans le secteur du tourisme grâce à des initiatives favorisant l\'insertion professionnelle, la formation et la valorisation des métiers de l\'accueil.',
    vision: 'Créer des opportunités d\'emploi, favoriser l\'insertion professionnelle et contribuer à l\'autonomisation des femmes à travers le tourisme.',
    historyShort: 'Créé en 2024, le JAMBO Festival a marqué les esprits lors de sa précédente édition le 15 mars 2025 à Kinkole. En 2026, la 3e édition franchit un nouveau cap avec deux temps forts majeurs à Kinshasa.',
  },
  transport: {
    title: 'Transport & Mobilité Officielle',
    details: 'Des navettes spéciales et points de rassemblement sécurisés seront mis en place à travers les grandes artères de Kinshasa pour faciliter l\'acheminement vers le Musée national (18 oct.) et Amani Eco-Park (24 oct.).',
    status: 'Informations de transport à venir',
  },
  hike: {
    title: 'Grande Randonnée Touristique à Amani Eco-Park',
    date: '24 Octobre 2026',
    location: 'Amani Eco-Park, Mitendi (Kinshasa)',
    description: 'Une journée exclusive au contact de la faune et flore congolaises, jalonnée d\'ateliers écotouristiques et d\'animations culturelles.',
    pricingNotice: 'Tarif et modalités de réservation à venir (Activité distincte du billet du 18 octobre).',
  },
};

// Initial Seed Database
const initialDatabase: DatabaseSchema = {
  users: [superAdminUser],
  settings: initialSettings,
  pricingTiers: initialPricingTiers,
  events: initialEvents,
  news: initialNews,
  galleryAlbums: initialGalleryAlbums,
  mediaFiles: [],
  messages: initialMessages,
  tickets: [
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
      status: 'USED',
      qrToken: 'TKN-JF26-008914-j8c34f-l4p1',
      participant: {
        firstName: 'Patrick',
        lastName: 'Lumumba',
        email: 'patrick.lumumba@example.cd',
        phone: '+243 99 876 5432',
        city: 'Kinshasa',
        country: 'RDC',
      },
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      usedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      usedByAdmin: 'Staff Scanner Entrée',
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
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  orders: [],
  hikes: [
    {
      id: 'HIKE-001',
      firstName: 'Sarah',
      lastName: 'Mpemba',
      email: 'sarah.m@example.cd',
      phone: '+243 82 111 2233',
      groupSize: 2,
      comments: 'Passionnée d\'écotourisme',
      status: 'CONFIRMED',
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  trainings: [
    {
      id: 'TRN-001',
      firstName: 'Chantal',
      lastName: 'Bukasa',
      email: 'chantal.b@example.cd',
      phone: '+243 89 555 4433',
      trainingType: 'Hôtesse professionnelle',
      experienceLevel: 'Débutante motivée',
      motivation: 'Je souhaite faire carrière dans l\'accueil touristique de haut niveau.',
      status: 'CONFIRMÉ',
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  auditLogs: initialAuditLogs,
  content: initialContent,
};

// Database Storage Controller with atomic writing
class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with defaults if new keys exist
        return {
          ...initialDatabase,
          ...parsed,
          settings: { ...initialSettings, ...(parsed.settings || {}) },
          content: { ...initialContent, ...(parsed.content || {}) },
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }
    this.saveDatabase(initialDatabase);
    return initialDatabase;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(updater: (db: DatabaseSchema) => void): DatabaseSchema {
    updater(this.data);
    this.saveDatabase(this.data);
    return this.data;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs = [newLog, ...(this.data.auditLogs || [])].slice(0, 100);
    this.saveDatabase(this.data);
    return newLog;
  }
}

export const db = new JSONDatabase();
