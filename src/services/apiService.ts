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
  FestivalStats 
} from '../types';
import { FESTIVAL_INFO, INITIAL_ACTIVITIES } from '../data/festivalData';

const TOKEN_KEY = 'jambo_admin_jwt_token';
const USER_KEY = 'jambo_admin_user_session';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiService = {
  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  auth: {
    getToken(): string | null {
      return localStorage.getItem(TOKEN_KEY);
    },
    getCurrentUser(): AdminUser | null {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    isAuthenticated(): boolean {
      return !!localStorage.getItem(TOKEN_KEY);
    },
    async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: AdminUser; error?: string }> {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || 'Identifiants incorrects' };
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, token: data.token, user: data.user };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur réseau lors de la connexion' };
      }
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    async fetchMe(): Promise<AdminUser | null> {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { ...getAuthHeader() },
        });
        if (!res.ok) {
          this.logout();
          return null;
        }
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
        return null;
      } catch (err) {
        return this.getCurrentUser();
      }
    },
    async updateProfile(updates: Partial<AdminUser>): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || 'Erreur lors de la mise à jour' };
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || 'Erreur de mot de passe' };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    async forgotPassword(email: string): Promise<{ success: boolean; message: string; tempCode?: string }> {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // USERS MANAGEMENT
  // ----------------------------------------------------
  users: {
    async list(): Promise<AdminUser[]> {
      const res = await fetch('/api/users', { headers: { ...getAuthHeader() } });
      const data = await res.json();
      return data.users || [];
    },
    async create(user: any): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, user: data.user };
    },
    async update(id: string, updates: any): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, user: data.user };
    },
    async delete(id: string): Promise<{ success: boolean; error?: string }> {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    },
  },

  // ----------------------------------------------------
  // SETTINGS & DYNAMIC CONTENT
  // ----------------------------------------------------
  settings: {
    async get(): Promise<SiteSettings> {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        return data.settings;
      } catch (e) {
        return {
          general: {
            siteName: FESTIVAL_INFO.name,
            edition: FESTIVAL_INFO.edition,
            slogan: FESTIVAL_INFO.slogan,
            mainTagline: FESTIVAL_INFO.mainTagline,
            heroClosingTagline: FESTIVAL_INFO.heroClosingTagline,
            description: 'Portail officiel du JAMBO Festival 2026',
          },
          contact: {
            email: FESTIVAL_INFO.contact.email,
            phone: FESTIVAL_INFO.contact.phone,
            whatsapp: FESTIVAL_INFO.contact.phone,
            address: FESTIVAL_INFO.contact.address,
            city: FESTIVAL_INFO.location.mainCity,
            country: FESTIVAL_INFO.location.country,
          },
          socials: {
            facebook: 'https://facebook.com/jambofestival',
            instagram: 'https://instagram.com/jambofestival',
            tiktok: 'https://tiktok.com/@jambofestival',
            youtube: 'https://youtube.com/@jambofestival',
          },
          seo: {
            metaTitle: 'JAMBO FESTIVAL 2026',
            metaDescription: '3e édition officielle du JAMBO Festival',
            keywords: 'JAMBO Festival 2026, Tourisme RDC',
          },
          dates: {
            day1: FESTIVAL_INFO.dates.day1,
            day2: FESTIVAL_INFO.dates.day2,
            summary: FESTIVAL_INFO.dates.summary,
          },
        };
      }
    },
    async update(settings: Partial<SiteSettings>): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return data;
    },
  },

  content: {
    async get(): Promise<any> {
      try {
        const res = await fetch('/api/content');
        const data = await res.json();
        return data.content;
      } catch (e) {
        return null;
      }
    },
    async update(content: any): Promise<{ success: boolean; content?: any; error?: string }> {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(content),
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // TICKETS & PRICING
  // ----------------------------------------------------
  pricing: {
    async getTiers(): Promise<TicketPricingTier[]> {
      try {
        const res = await fetch('/api/tickets/pricing');
        const data = await res.json();
        return data.tiers || [];
      } catch (e) {
        return [
          {
            id: 'TIER-STD',
            type: 'STANDARD',
            name: 'Billet Standard',
            price: FESTIVAL_INFO.pricing.standard.price,
            currency: 'USD',
            validity: FESTIVAL_INFO.pricing.standard.validity,
            description: 'Accès complet journée 18 octobre 2026',
            features: FESTIVAL_INFO.pricing.standard.features,
            availableQuantity: 500,
            soldQuantity: 42,
            status: 'ACTIVE',
          },
          {
            id: 'TIER-VIP',
            type: 'VIP',
            name: 'Pass VIP Accès Privilège',
            price: FESTIVAL_INFO.pricing.vip.price,
            currency: 'USD',
            validity: FESTIVAL_INFO.pricing.vip.validity,
            description: 'Expérience haut de gamme avec espace lounge VIP',
            features: FESTIVAL_INFO.pricing.vip.features,
            availableQuantity: 150,
            soldQuantity: 18,
            status: 'ACTIVE',
            highlight: true,
          },
        ];
      }
    },
    async createTier(tier: any): Promise<{ success: boolean; tier?: TicketPricingTier; error?: string }> {
      const res = await fetch('/api/tickets/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(tier),
      });
      return res.json();
    },
    async updateTier(id: string, updates: any): Promise<{ success: boolean; tier?: TicketPricingTier; error?: string }> {
      const res = await fetch(`/api/tickets/pricing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    async deleteTier(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/tickets/pricing/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // EVENTS
  // ----------------------------------------------------
  events: {
    async list(): Promise<FestivalEvent[]> {
      try {
        const res = await fetch('/api/events', { headers: { ...getAuthHeader() } });
        const data = await res.json();
        return data.events || [];
      } catch (e) {
        return [];
      }
    },
    async create(event: any): Promise<{ success: boolean; event?: FestivalEvent; error?: string }> {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(event),
      });
      return res.json();
    },
    async update(id: string, updates: any): Promise<{ success: boolean; event?: FestivalEvent; error?: string }> {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // NEWS & ARTICLES
  // ----------------------------------------------------
  news: {
    async list(): Promise<NewsArticle[]> {
      try {
        const res = await fetch('/api/news', { headers: { ...getAuthHeader() } });
        const data = await res.json();
        return data.news || [];
      } catch (e) {
        return [];
      }
    },
    async create(article: any): Promise<{ success: boolean; article?: NewsArticle; error?: string }> {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(article),
      });
      return res.json();
    },
    async update(id: string, updates: any): Promise<{ success: boolean; article?: NewsArticle; error?: string }> {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // GALLERY
  // ----------------------------------------------------
  gallery: {
    async list(): Promise<GalleryAlbum[]> {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        return data.albums || [];
      } catch (e) {
        return [];
      }
    },
    async create(album: any): Promise<{ success: boolean; album?: GalleryAlbum; error?: string }> {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(album),
      });
      return res.json();
    },
    async update(id: string, updates: any): Promise<{ success: boolean; album?: GalleryAlbum; error?: string }> {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // MEDIA LIBRARY
  // ----------------------------------------------------
  media: {
    async list(): Promise<MediaFile[]> {
      try {
        const res = await fetch('/api/media', { headers: { ...getAuthHeader() } });
        const data = await res.json();
        return data.media || [];
      } catch (e) {
        return [];
      }
    },
    async uploadBase64(base64Data: string, originalName?: string): Promise<{ success: boolean; media?: MediaFile; error?: string }> {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ base64Data, originalName }),
      });
      return res.json();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // CONTACT MESSAGES
  // ----------------------------------------------------
  messages: {
    async send(msg: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<{ success: boolean; message: string; error?: string }> {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      return res.json();
    },
    async list(): Promise<ContactMessage[]> {
      try {
        const res = await fetch('/api/messages', { headers: { ...getAuthHeader() } });
        const data = await res.json();
        return data.messages || [];
      } catch (e) {
        return [];
      }
    },
    async updateStatus(id: string, status: 'UNREAD' | 'READ' | 'PROCESSED'): Promise<{ success: boolean }> {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.json();
    },
  },

  // ----------------------------------------------------
  // AUDIT LOGS & STATS
  // ----------------------------------------------------
  auditLogs: {
    async list(): Promise<AuditLog[]> {
      try {
        const res = await fetch('/api/audit-logs', { headers: { ...getAuthHeader() } });
        const data = await res.json();
        return data.logs || [];
      } catch (e) {
        return [];
      }
    },
  },

  stats: {
    async get(): Promise<FestivalStats & { unreadMessages?: number; totalTickets?: number }> {
      try {
        const res = await fetch('/api/stats');
        return res.json();
      } catch (e) {
        return {
          totalSold: 60,
          standardSold: 42,
          vipSold: 18,
          scannedCount: 1,
          revenue: 1080,
          hikeRegistrations: 1,
          trainingRegistrations: 1,
        };
      }
    },
  },
};
