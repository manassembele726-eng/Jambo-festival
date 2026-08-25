export type TicketType = 'STANDARD' | 'VIP';

export type TicketStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'USED' | 'EXPIRED';

export interface Ticket {
  ticketId: string; // e.g. JF26-004582
  orderId: string;
  type: TicketType;
  price: number; // in USD
  currency: string;
  eventDate: string; // "18 Octobre 2026"
  validityNotice: string; // "UNIQUEMENT LE 18 OCTOBRE 2026"
  status: TicketStatus;
  qrToken: string; // unique hash token for server verification
  participant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
  createdAt: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  usedAt?: string;
  usedByAdmin?: string;
}

export interface Order {
  orderId: string;
  tickets: Ticket[];
  totalAmount: number;
  currency: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'Formation' | 'Exposition' | 'Networking' | 'Cérémonie' | 'Randonnée' | 'Échange' | string;
  capacity?: string;
  isConfirmed: boolean;
  registrationOpen?: boolean;
}

export interface HikeRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  groupSize: number;
  comments?: string;
  status: 'CONFIRMED' | 'PENDING';
  registeredAt?: string;
  createdAt: string;
}

export interface TrainingRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trainingType: 'Hôtesse professionnelle' | 'Guide touristique' | 'Accueil & Protocole' | 'Tous' | string;
  experienceLevel: string;
  motivation: string;
  status: 'EN ATTENTE' | 'CONFIRMÉ';
  registeredAt?: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  title?: string;
  role: string;
  organization: string;
  bio: string;
  photo?: string;
  avatarText?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src?: string;
  imageUrl?: string;
  description?: string;
  caption?: string;
  year?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'PROCESSED';
  createdAt: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  avatarUrl?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
}

export interface TicketPricingTier {
  id: string;
  type: string; // 'STANDARD' | 'VIP' | 'PREMIUM' | 'BACKSTAGE' | 'VVIP'
  name: string;
  price: number;
  currency: string;
  validity: string;
  description: string;
  features: string[];
  availableQuantity: number;
  soldQuantity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
  highlight?: boolean;
}

export interface FestivalEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  coverImage?: string;
  galleryImages?: string[];
  price?: string;
  additionalInfo?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  category: string;
  year: string;
  images: {
    id: string;
    url: string;
    title?: string;
    caption?: string;
  }[];
  isPublished: boolean;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface SiteSettings {
  general: {
    siteName: string;
    edition: string;
    slogan: string;
    mainTagline: string;
    heroClosingTagline: string;
    logoUrl?: string;
    faviconUrl?: string;
    description: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    country: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    twitter?: string;
    linkedin?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
    keywords: string;
  };
  dates: {
    day1: string;
    day2: string;
    summary: string;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface FestivalStats {
  totalSold: number;
  standardSold: number;
  vipSold: number;
  scannedCount: number;
  revenue: number;
  hikeRegistrations: number;
  trainingRegistrations: number;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CheckInResult {
  valid: boolean;
  code: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'UNPAID';
  message: string;
  ticket?: Ticket;
}
