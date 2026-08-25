import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Ticket as TicketIcon, 
  Users, 
  QrCode, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  Search, 
  ArrowLeft, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Trees, 
  GraduationCap, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  Image as ImageIcon,
  FileText,
  Settings as SettingsIcon,
  UserCheck,
  LogOut,
  Upload,
  Eye,
  Menu,
  X,
  Copy,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Check,
  AlertTriangle,
  History,
  Camera,
  FolderPlus,
  Send,
  MessageSquare,
  Globe
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { 
  AdminUser, 
  Ticket, 
  TicketPricingTier, 
  FestivalEvent, 
  NewsArticle, 
  GalleryAlbum, 
  MediaFile, 
  SiteSettings, 
  AuditLog, 
  ContactMessage, 
  FestivalStats 
} from '../types';

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  onBackToHome: () => void;
  onOpenScanner: () => void;
  initialTab?: string;
}

type TabType = 
  | 'overview' 
  | 'content' 
  | 'pages' 
  | 'media' 
  | 'events' 
  | 'tickets' 
  | 'news' 
  | 'gallery' 
  | 'messages' 
  | 'users' 
  | 'settings' 
  | 'profile' 
  | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onBackToHome,
  onOpenScanner,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // State Collections
  const [stats, setStats] = useState<FestivalStats & { unreadMessages?: number }>({
    totalSold: 60,
    standardSold: 42,
    vipSold: 18,
    scannedCount: 1,
    revenue: 1080,
    hikeRegistrations: 1,
    trainingRegistrations: 1,
    unreadMessages: 1,
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pricingTiers, setPricingTiers] = useState<TicketPricingTier[]>([]);
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search & Filter
  const [ticketSearch, setTicketSearch] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');

  // Modals & Editing States
  const [editingPricing, setEditingPricing] = useState<TicketPricingTier | null>(null);
  const [editingEvent, setEditingEvent] = useState<FestivalEvent | null>(null);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
    phone: '',
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all initial backend data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        pricingData,
        eventsData,
        newsData,
        galleryData,
        mediaData,
        messagesData,
        settingsData,
        contentData,
        logsData,
      ] = await Promise.all([
        apiService.stats.get(),
        apiService.pricing.getTiers(),
        apiService.events.list(),
        apiService.news.list(),
        apiService.gallery.list(),
        apiService.media.list(),
        apiService.messages.list(),
        apiService.settings.get(),
        apiService.content.get(),
        apiService.auditLogs.list(),
      ]);

      setStats(statsData);
      setPricingTiers(pricingData);
      setEvents(eventsData);
      setNews(newsData);
      setAlbums(galleryData);
      setMediaList(mediaData);
      setMessages(messagesData);
      setSettings(settingsData);
      setContent(contentData);
      setAuditLogs(logsData);

      if (currentUser?.role === 'SUPER_ADMIN') {
        const users = await apiService.users.list();
        setUsersList(users);
      }

      // Fetch tickets
      const resTickets = await fetch('/api/tickets');
      const ticketsData = await resTickets.json();
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Media Upload handler (Camera or File upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP)', 'error');
      return;
    }

    setIsUploadingMedia(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const result = await apiService.media.uploadBase64(base64Data, file.name);
      if (result.success && result.media) {
        setMediaList(prev => [result.media!, ...prev]);
        showToast('Image téléversée avec succès dans la médiathèque !');
      } else {
        showToast(result.error || 'Erreur lors du téléversement', 'error');
      }
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'image "${name}" ?`)) return;
    const res = await apiService.media.delete(id);
    if (res.success) {
      setMediaList(prev => prev.filter(m => m.id !== id));
      showToast('Image supprimée de la médiathèque.');
    }
  };

  // Pricing updates
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricing) return;
    
    if (editingPricing.id.startsWith('NEW-')) {
      const res = await apiService.pricing.createTier(editingPricing);
      if (res.success && res.tier) {
        setPricingTiers(prev => [...prev, res.tier!]);
        showToast(`Tarif ${res.tier.name} créé avec succès.`);
      }
    } else {
      const res = await apiService.pricing.updateTier(editingPricing.id, editingPricing);
      if (res.success && res.tier) {
        setPricingTiers(prev => prev.map(p => p.id === res.tier!.id ? res.tier! : p));
        showToast(`Tarif ${res.tier.name} mis à jour : ${res.tier.price} ${res.tier.currency} (visible en direct sur le site public).`);
      }
    }
    setEditingPricing(null);
  };

  const handleDeletePricing = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la formule tarifaire "${name}" ?`)) return;
    await apiService.pricing.deleteTier(id);
    setPricingTiers(prev => prev.filter(p => p.id !== id));
    showToast('Formule tarifaire supprimée.');
  };

  // Event updates
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (editingEvent.id.startsWith('NEW-')) {
      const res = await apiService.events.create(editingEvent);
      if (res.success && res.event) {
        setEvents(prev => [res.event!, ...prev]);
        showToast(`Événement "${res.event.name}" créé.`);
      }
    } else {
      const res = await apiService.events.update(editingEvent.id, editingEvent);
      if (res.success && res.event) {
        setEvents(prev => prev.map(ev => ev.id === res.event!.id ? res.event! : ev));
        showToast(`Événement "${res.event.name}" mis à jour.`);
      }
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${name}" ?`)) return;
    await apiService.events.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Événement supprimé.');
  };

  // News updates
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    if (editingArticle.id.startsWith('NEW-')) {
      const res = await apiService.news.create(editingArticle);
      if (res.success && res.article) {
        setNews(prev => [res.article!, ...prev]);
        showToast(`Actualité "${res.article.title}" publiée.`);
      }
    } else {
      const res = await apiService.news.update(editingArticle.id, editingArticle);
      if (res.success && res.article) {
        setNews(prev => prev.map(n => n.id === res.article!.id ? res.article! : n));
        showToast(`Actualité "${res.article.title}" mise à jour.`);
      }
    }
    setEditingArticle(null);
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${title}" ?`)) return;
    await apiService.news.delete(id);
    setNews(prev => prev.filter(n => n.id !== id));
    showToast('Article supprimé.');
  };

  // Gallery updates
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    if (editingAlbum.id.startsWith('NEW-')) {
      const res = await apiService.gallery.create(editingAlbum);
      if (res.success && res.album) {
        setAlbums(prev => [res.album!, ...prev]);
        showToast(`Album "${res.album.title}" créé.`);
      }
    } else {
      const res = await apiService.gallery.update(editingAlbum.id, editingAlbum);
      if (res.success && res.album) {
        setAlbums(prev => prev.map(a => a.id === res.album!.id ? res.album! : a));
        showToast(`Album "${res.album.title}" mis à jour.`);
      }
    }
    setEditingAlbum(null);
  };

  // Settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await apiService.settings.update(settings);
    if (res.success) {
      showToast('Paramètres généraux et informations de contact enregistrés avec succès.');
    }
  };

  // Content update
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    const res = await apiService.content.update(content);
    if (res.success) {
      showToast('Contenus, slogans et textes du site public enregistrés avec succès.');
    }
  };

  // Message Actions
  const handleUpdateMessageStatus = async (id: string, status: 'READ' | 'PROCESSED') => {
    await apiService.messages.updateStatus(id, status);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    showToast(`Message marqué comme ${status === 'READ' ? 'lu' : 'traité'}.`);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Supprimer définitivement ce message ?')) return;
    await apiService.messages.delete(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    showToast('Message supprimé.');
  };

  // User creation (Super Admin)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.users.create(newUserForm);
    if (res.success && res.user) {
      setUsersList(prev => [...prev, res.user!]);
      showToast(`Administrateur ${res.user.firstName} ${res.user.lastName} créé.`);
      setIsAddUserModalOpen(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'ADMIN',
        phone: '',
      });
    } else {
      showToast(res.error || 'Erreur lors de la création de l\'administrateur', 'error');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir révoquer les accès de ${name} ?`)) return;
    const res = await apiService.users.delete(id);
    if (res.success) {
      setUsersList(prev => prev.filter(u => u.id !== id));
      showToast('Utilisateur administrateur supprimé.');
    } else {
      showToast(res.error || 'Impossible de supprimer cet utilisateur', 'error');
    }
  };

  // Profile & Password Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.auth.updateProfile(profileForm);
    if (res.success) {
      showToast('Profil administrateur mis à jour avec succès.');
    } else {
      showToast(res.error || 'Erreur lors de la mise à jour', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    const res = await apiService.auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      showToast('Mot de passe changé avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(res.error || 'Erreur lors du changement de mot de passe', 'error');
    }
  };

  // Nav Items definition
  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'content', label: 'Contenu du site', icon: FileText, badge: null },
    { id: 'pages', label: 'Pages & Rubriques', icon: Layers, badge: null },
    { id: 'media', label: 'Médias & Photos', icon: ImageIcon, badge: mediaList.length },
    { id: 'events', label: 'Événements', icon: Calendar, badge: events.length },
    { id: 'tickets', label: 'Billets / Tarifs', icon: TicketIcon, badge: pricingTiers.length },
    { id: 'news', label: 'Actualités', icon: Globe, badge: news.length },
    { id: 'gallery', label: 'Galerie', icon: Camera, badge: albums.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: messages.filter(m => m.status === 'UNREAD').length },
    ...(currentUser?.role === 'SUPER_ADMIN' ? [{ id: 'users', label: 'Utilisateurs', icon: Users, badge: usersList.length }] : []),
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon, badge: null },
    { id: 'profile', label: 'Mon profil', icon: UserCheck, badge: null },
    { id: 'logs', label: 'Historique / Audit', icon: History, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col md:flex-row">
      
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-800 text-white border-emerald-600 shadow-emerald-900/30' 
              : toast.type === 'error'
              ? 'bg-red-800 text-white border-red-600 shadow-red-900/30'
              : 'bg-stone-900 text-white border-stone-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-300" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/png,image/jpeg,image/jpg,image/webp" 
        className="hidden" 
      />

      {/* ----------------------------------------------------
          MOBILE TOP BAR
      ---------------------------------------------------- */}
      <div className="md:hidden bg-stone-900 text-white p-4 border-b border-stone-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-800 text-stone-200 hover:bg-[#EA580C] hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="font-heading font-black text-sm text-white tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              JAMBO ADMIN
            </div>
            <div className="text-[10px] text-stone-400 font-mono">
              {currentUser?.firstName} ({currentUser?.role})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="p-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white text-xs font-bold flex items-center gap-1"
            title="Scanner QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold"
            title="Site Public"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER)
      ---------------------------------------------------- */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-[#083344] text-white flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out border-r border-[#0E4759]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#0E4759]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex items-center justify-center text-white shadow-lg shadow-[#EA580C]/30 font-black text-base">
                J
              </div>
              <div>
                <h1 className="font-heading font-black text-base text-white tracking-tight leading-tight">
                  JAMBO FESTIVAL
                </h1>
                <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">
                  Console Officielle 2026
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="bg-[#052633] rounded-2xl p-3 border border-[#0E4759] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0A8296] to-[#059669] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {currentUser?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-md shadow-[#EA580C]/25'
                    : 'text-stone-300 hover:bg-[#052633] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-[#EA580C]' : 'bg-[#0A8296] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#0E4759] space-y-2 bg-[#052633]">
          <button
            onClick={onOpenScanner}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0A8296] to-[#0284C7] hover:from-[#086f80] hover:to-[#0369a1] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>Contrôle Entrée (Scanner)</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onBackToHome}
              className="flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold text-stone-300 bg-[#083344] hover:bg-[#0E4759] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Site Public</span>
            </button>
            <button
              onClick={onLogout}
              className="py-2 px-3 rounded-xl text-[11px] font-bold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MAIN CONTENT AREA
      ---------------------------------------------------- */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top Header Controls Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">
              <span>JAMBO Festival 2026</span>
              <span>/</span>
              <span className="text-[#EA580C]">{activeTab}</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
              {activeTab === 'overview' && 'Tableau de Bord Général'}
              {activeTab === 'content' && 'Gestion des Textes & Slogans du Site'}
              {activeTab === 'pages' && 'Pages & Rubriques Officielles'}
              {activeTab === 'media' && 'Médiathèque & Stockage Photos'}
              {activeTab === 'events' && 'Programme & Gestion des Événements'}
              {activeTab === 'tickets' && 'Billets, Tarifs & Formules 2026'}
              {activeTab === 'news' && 'Actualités & Communiqués'}
              {activeTab === 'gallery' && 'Albums & Photothèque JAMBO'}
              {activeTab === 'messages' && 'Messages des Visiteurs & Contacts'}
              {activeTab === 'users' && 'Gestion des Utilisateurs Administrateurs'}
              {activeTab === 'settings' && 'Paramètres du Site & Réseaux Sociaux'}
              {activeTab === 'profile' && 'Mon Profil & Sécurité'}
              {activeTab === 'logs' && 'Journal d\'Audit & Historique'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#B45309] shadow-lg shadow-[#EA580C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Ouvrir le Scanner QR</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            TAB 1 : OVERVIEW (DASHBOARD)
        ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Billets Vendus</p>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-1">
                    {stats.totalSold}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    {stats.standardSold} Standard • {stats.vipSold} VIP
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                  <TicketIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Recettes Billetterie</p>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-emerald-700 mt-1">
                    {stats.revenue} USD
                  </h3>
                  <p className="text-[11px] font-bold text-stone-500 mt-1">
                    Payé & Enregistré
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Entrées Scannées</p>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#0A8296] mt-1">
                    {stats.scannedCount} / {stats.totalSold}
                  </h3>
                  <p className="text-[11px] font-bold text-stone-500 mt-1">
                    {stats.totalSold > 0 ? `${Math.round((stats.scannedCount / stats.totalSold) * 100)}% de présence` : 'En attente'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0A8296]/10 text-[#0A8296] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Messages Non Lus</p>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-1">
                    {messages.filter(m => m.status === 'UNREAD').length}
                  </h3>
                  <p className="text-[11px] font-bold text-stone-500 mt-1">
                    {messages.length} messages reçus
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
              <h3 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <span>Actions Rapides d'Administration</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-left hover:border-[#EA580C] hover:bg-orange-50/50 transition-all cursor-pointer group"
                >
                  <Upload className="w-5 h-5 text-[#EA580C] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-stone-900">Ajouter une Photo</div>
                  <div className="text-[10px] text-stone-500">Médiathèque persistante</div>
                </button>

                <button
                  onClick={() => {
                    setEditingPricing({
                      id: `NEW-${Date.now()}`,
                      type: 'STANDARD',
                      name: 'Nouvelle Formule',
                      price: 20,
                      currency: 'USD',
                      validity: 'Valable UNIQUEMENT le 18 octobre 2026',
                      description: 'Accès festival',
                      features: ['Accès général 18 octobre'],
                      availableQuantity: 100,
                      soldQuantity: 0,
                      status: 'ACTIVE',
                    });
                    setActiveTab('tickets');
                  }}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-left hover:border-[#EA580C] hover:bg-orange-50/50 transition-all cursor-pointer group"
                >
                  <TicketIcon className="w-5 h-5 text-[#EA580C] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-stone-900">Ajuster les Tarifs</div>
                  <div className="text-[10px] text-stone-500">Mise à jour en temps réel</div>
                </button>

                <button
                  onClick={() => {
                    setEditingEvent({
                      id: `NEW-${Date.now()}`,
                      name: 'Nouvelle Session / Activité',
                      description: '',
                      date: '18 Octobre 2026',
                      time: 'Horaire à confirmer',
                      location: 'Kinshasa',
                      venue: 'Musée national de la RDC',
                      status: 'PUBLISHED',
                      category: 'Général',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    setActiveTab('events');
                  }}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-left hover:border-[#0A8296] hover:bg-emerald-50/50 transition-all cursor-pointer group"
                >
                  <Calendar className="w-5 h-5 text-[#0A8296] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-stone-900">Créer un Événement</div>
                  <div className="text-[10px] text-stone-500">Ajout au programme</div>
                </button>

                <button
                  onClick={onOpenScanner}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#083344] to-[#0A8296] text-white text-left shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <QrCode className="w-5 h-5 text-amber-300 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white">Scanner d'Entrée</div>
                  <div className="text-[10px] text-stone-200">Caméra smartphone</div>
                </button>
              </div>
            </div>

            {/* Recent Audit Logs stream */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-600" />
                  <span>Dernières Activités Administratives</span>
                </h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-bold text-[#EA580C] hover:underline"
                >
                  Voir tout l'historique →
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px]">
                          {log.userName} ({log.userRole})
                        </span>
                        <span>{log.action}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 2 : CONTENT (CONTENU DU SITE)
        ---------------------------------------------------- */}
        {activeTab === 'content' && content && (
          <form onSubmit={handleSaveContent} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900">
                    Slogans, Titres & En-tête Principal
                  </h3>
                  <p className="text-xs text-stone-500">
                    Toutes les modifications saisies ici sont répercutées en direct sur le site public.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le Contenu</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Titre Principal (Hero)
                  </label>
                  <input
                    type="text"
                    value={content.hero?.headline || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Badge de Bannière
                  </label>
                  <input
                    type="text"
                    value={content.hero?.bannerBadge || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, bannerBadge: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Slogan Officiel (« Pesa tourisme ya mboka chance ! »)
                  </label>
                  <input
                    type="text"
                    value={content.hero?.slogan || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, slogan: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Tagline Principale
                  </label>
                  <textarea
                    rows={2}
                    value={content.hero?.tagline || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Citation de Clôture (Hero Closing)
                  </label>
                  <textarea
                    rows={2}
                    value={content.hero?.closingTagline || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, closingTagline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="border-t border-stone-200 pt-6 space-y-4">
                <h4 className="font-heading font-black text-base text-stone-900">
                  Mission, Vision & Présentation
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Mission Officielle
                  </label>
                  <textarea
                    rows={3}
                    value={content.about?.mission || ''}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, mission: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Vision Stratégique
                  </label>
                  <textarea
                    rows={3}
                    value={content.about?.vision || ''}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, vision: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>
              </div>

              {/* Randonnée & Transport */}
              <div className="border-t border-stone-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Grande Randonnée (24 Octobre) — Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.hike?.description || ''}
                    onChange={(e) => setContent({ ...content, hike: { ...content.hike, description: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Transport & Navettes — Détails
                  </label>
                  <textarea
                    rows={3}
                    value={content.transport?.details || ''}
                    onChange={(e) => setContent({ ...content, transport: { ...content.transport, details: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900"
                  />
                </div>
              </div>

            </div>
          </form>
        )}

        {/* ----------------------------------------------------
            TAB 3 : PAGES & SECTIONS
        ---------------------------------------------------- */}
        {activeTab === 'pages' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-heading font-black text-base text-stone-900 mb-2">
              Rubriques & Structure du Site Public
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Visualisez l'état des sections actives sur la page principale et l'espace participant.
            </p>

            <div className="divide-y divide-stone-100">
              {[
                { name: 'Bannière d\'Accueil (Hero)', route: '#hero', status: 'Actif', type: 'Section' },
                { name: 'Qu\'est-ce que JAMBO Festival ?', route: '#about', status: 'Actif', type: 'Section' },
                { name: 'Histoire & Timeline des éditions', route: '#histoire', status: 'Actif', type: 'Section' },
                { name: '5 Objectifs Stratégiques', route: '#objectifs', status: 'Actif', type: 'Section' },
                { name: 'Programme (18 & 24 Octobre 2026)', route: '#programme', status: 'Actif', type: 'Section' },
                { name: 'Billetterie Officielle', route: '#billetterie', status: 'Actif', type: 'Section' },
                { name: 'Grande Randonnée (Amani Eco-Park)', route: '#randonnee', status: 'Actif', type: 'Section' },
                { name: 'Formations Métiers de l\'Accueil', route: '#formations', status: 'Actif', type: 'Section' },
                { name: 'Grande Exposition au Musée National', route: '#exposition', status: 'Actif', type: 'Section' },
                { name: 'Invités de Marque & Personnalités', route: '#invites', status: 'Actif', type: 'Section' },
                { name: 'Transport & Mobilité', route: '#transport', status: 'Actif', type: 'Section' },
                { name: 'Galerie Photos', route: '#galerie', status: 'Actif', type: 'Section' },
                { name: 'Contact & FAQ', route: '#contact', status: 'Actif', type: 'Section' },
                { name: 'Mon Espace JAMBO (Participant)', route: '/mon-jambo', status: 'Actif', type: 'Page Dédiée' },
              ].map((p, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{p.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{p.route} • {p.type}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 4 : MEDIA LIBRARY
        ---------------------------------------------------- */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            
            {/* Media Upload Header */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Médiathèque Officielle ({mediaList.length} photos)
                </h3>
                <p className="text-xs text-stone-500">
                  Téléversez des photos depuis votre ordinateur ou smartphone (JPG, PNG, WEBP).
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Rechercher une photo..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs w-full sm:w-48"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
                >
                  {isUploadingMedia ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Ajouter une Photo</span>
                </button>
              </div>
            </div>

            {/* Media Grid */}
            {mediaList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
                <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="font-heading font-bold text-stone-700 text-sm">Aucune image personnalisée</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Cliquez sur "Ajouter une Photo" pour importer vos photos de l'édition 2026, conférences ou randonnées.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C]"
                >
                  Choisir un fichier
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaList
                  .filter(m => m.originalName.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map(media => (
                    <div key={media.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden group shadow-sm flex flex-col justify-between">
                      <div className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setPreviewMediaUrl(media.url)}>
                        <img 
                          src={media.url} 
                          alt={media.originalName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-2 rounded-full bg-white/90 text-stone-900 hover:bg-white">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="text-xs font-bold text-stone-900 truncate" title={media.originalName}>
                          {media.originalName}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center justify-between mt-1">
                          <span>{Math.round(media.size / 1024)} Ko</span>
                          <span>{new Date(media.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(media.url);
                              showToast('Lien de l\'image copié dans le presse-papier !');
                            }}
                            className="text-[11px] font-bold text-[#0A8296] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copier URL</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(media.id, media.originalName)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 5 : EVENTS MANAGEMENT
        ---------------------------------------------------- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Événements du Programme ({events.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Les événements au statut "PUBLIÉ" sont immédiatement visibles sur le site public.
                </p>
              </div>

              <button
                onClick={() => setEditingEvent({
                  id: `NEW-${Date.now()}`,
                  name: '',
                  description: '',
                  date: '18 Octobre 2026',
                  time: '08h30',
                  location: 'Kinshasa',
                  venue: 'Musée national de la RDC',
                  status: 'PUBLISHED',
                  category: 'Conférence',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Événement</span>
              </button>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(ev => (
                <div key={ev.id} className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        ev.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {ev.status === 'PUBLISHED' ? 'Publié' : ev.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                      </span>
                      <h4 className="font-heading font-black text-base text-stone-900 mt-1.5">{ev.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingEvent(ev)}
                        className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.name)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">{ev.description}</p>

                  <div className="text-xs text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{ev.date} • {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trees className="w-3.5 h-3.5 text-[#0A8296]" />
                      <span>{ev.venue} ({ev.location})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 6 : TICKETS & PRICING
        ---------------------------------------------------- */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Formules Tarifaires & Billets ({pricingTiers.length})
                </h3>
                <p className="text-xs text-stone-500">
                  La modification des prix s'applique immédiatement à la billetterie publique en temps réel.
                </p>
              </div>

              <button
                onClick={() => setEditingPricing({
                  id: `TIER-CUSTOM-${Date.now()}`,
                  type: 'CUSTOM',
                  name: 'Nouveau Pass',
                  price: 30,
                  currency: 'USD',
                  validity: 'Valable UNIQUEMENT le 18 octobre 2026',
                  description: 'Accès spécial festival',
                  features: ['Accès général journée 18 octobre'],
                  availableQuantity: 100,
                  soldQuantity: 0,
                  status: 'ACTIVE',
                })}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Formule</span>
              </button>
            </div>

            {/* Pricing Tiers Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map(tier => (
                <div key={tier.id} className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  {tier.highlight && (
                    <div className="absolute top-0 right-0 bg-[#EA580C] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                      Populaire
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{tier.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        tier.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {tier.status}
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-xl text-stone-900">{tier.name}</h4>
                    
                    <div className="my-4">
                      <span className="text-3xl font-black text-stone-900">{tier.price}</span>
                      <span className="text-sm font-bold text-stone-500 ml-1.5">{tier.currency}</span>
                    </div>

                    <p className="text-xs text-stone-600 mb-4">{tier.description}</p>

                    <div className="space-y-2 mb-6">
                      {tier.features?.map((f, i) => (
                        <div key={i} className="text-xs text-stone-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0A8296] flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-[11px] text-stone-500 font-semibold">
                      {tier.soldQuantity} vendus / {tier.availableQuantity}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPricing(tier)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeletePricing(tier.id, tier.name)}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 7 : NEWS & ARTICLES
        ---------------------------------------------------- */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Articles & Communiqués ({news.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Rédigez et publiez les annonces officielles pour le public et la presse.
                </p>
              </div>

              <button
                onClick={() => setEditingArticle({
                  id: `NEWS-${Date.now()}`,
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  category: 'Communiqué',
                  author: `${currentUser?.firstName} ${currentUser?.lastName}`,
                  status: 'PUBLISHED',
                  publishedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Rédiger une Actualité</span>
              </button>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {news.map(article => (
                <div key={article.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0A8296]/10 text-[#0A8296]">
                        {article.category}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(article.publishedAt).toLocaleDateString('fr-FR')} • Par {article.author}
                      </span>
                    </div>
                    <h4 className="font-heading font-black text-lg text-stone-900">{article.title}</h4>
                    <p className="text-xs text-stone-600">{article.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id, article.title)}
                      className="p-2 text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 8 : GALLERY ALBUMS
        ---------------------------------------------------- */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Albums & Photothèque ({albums.length} albums)
                </h3>
                <p className="text-xs text-stone-500">
                  Gérez les albums photos de l'édition 2025 et les futures photos 2026.
                </p>
              </div>

              <button
                onClick={() => setEditingAlbum({
                  id: `ALB-${Date.now()}`,
                  title: '',
                  description: '',
                  category: 'Édition 2026',
                  year: '2026',
                  images: [],
                  isPublished: true,
                  createdAt: new Date().toISOString(),
                })}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Créer un Album</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {albums.map(alb => (
                <div key={alb.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">{alb.category} • {alb.year}</span>
                      <h4 className="font-heading font-black text-lg text-stone-900 mt-0.5">{alb.title}</h4>
                    </div>
                    <button
                      onClick={() => setEditingAlbum(alb)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700"
                    >
                      Gérer ({alb.images?.length || 0} photos)
                    </button>
                  </div>

                  <p className="text-xs text-stone-600">{alb.description}</p>

                  <div className="grid grid-cols-3 gap-2">
                    {alb.images?.slice(0, 3).map((img, i) => (
                      <img key={i} src={img.url} alt={img.title || ''} className="w-full h-20 object-cover rounded-xl bg-stone-100" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 9 : CONTACT MESSAGES
        ---------------------------------------------------- */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Messages Reçus depuis le Formulaire Public ({messages.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Demandes de partenariats, questions sur les tarifs et réservations.
                </p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                Aucun message pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          msg.status === 'UNREAD' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {msg.status === 'UNREAD' ? 'Nouveau' : msg.status === 'READ' ? 'Lu' : 'Traité'}
                        </span>
                        <h4 className="font-heading font-black text-sm text-stone-900">{msg.subject}</h4>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70">
                      {msg.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-800">{msg.name}</span>
                        <span>•</span>
                        <a href={`mailto:${msg.email}`} className="text-[#0A8296] hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              {msg.phone}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.status === 'UNREAD' && (
                          <button
                            onClick={() => handleUpdateMessageStatus(msg.id, 'READ')}
                            className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700"
                          >
                            Marquer comme lu
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateMessageStatus(msg.id, 'PROCESSED')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800"
                        >
                          Marquer comme traité
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-stone-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 10 : USERS (SUPER ADMIN)
        ---------------------------------------------------- */}
        {activeTab === 'users' && currentUser?.role === 'SUPER_ADMIN' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-stone-900">
                  Comptes Administrateurs ({usersList.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Gérez les permissions et accréditations du personnel de JAMBO Festival.
                </p>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Administrateur</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-black tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nom & Prénom</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50/60">
                        <td className="px-6 py-4 font-bold text-stone-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 text-stone-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            u.role === 'SUPER_ADMIN' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                              className="text-stone-400 hover:text-red-600 p-1"
                              title="Révoquer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 11 : SETTINGS (PARAMÈTRES)
        ---------------------------------------------------- */}
        {activeTab === 'settings' && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900">
                    Paramètres Généraux, Coordonnées & SEO
                  </h3>
                  <p className="text-xs text-stone-500">
                    Informations persistantes de JAMBO Festival 2026.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les Paramètres</span>
                </button>
              </div>

              {/* General info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Nom du Site</label>
                  <input
                    type="text"
                    value={settings.general?.siteName || ''}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, siteName: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Édition</label>
                  <input
                    type="text"
                    value={settings.general?.edition || ''}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, edition: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-heading font-black text-sm text-stone-900 uppercase tracking-wider mb-4">
                  Coordonnées Officielles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email de Contact</label>
                    <input
                      type="email"
                      value={settings.contact?.email || ''}
                      onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={settings.contact?.phone || ''}
                      onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={settings.contact?.whatsapp || ''}
                      onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Social Networks */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-heading font-black text-sm text-stone-900 uppercase tracking-wider mb-4">
                  Réseaux Sociaux
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Facebook</label>
                    <input
                      type="text"
                      value={settings.socials?.facebook || ''}
                      onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, facebook: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={settings.socials?.instagram || ''}
                      onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, instagram: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">TikTok</label>
                    <input
                      type="text"
                      value={settings.socials?.tiktok || ''}
                      onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, tiktok: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">YouTube</label>
                    <input
                      type="text"
                      value={settings.socials?.youtube || ''}
                      onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, youtube: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-heading font-black text-sm text-stone-900 uppercase tracking-wider mb-4">
                  Référencement Naturel & Partage (SEO)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Meta Titre (Google)</label>
                    <input
                      type="text"
                      value={settings.seo?.metaTitle || ''}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={settings.seo?.metaDescription || ''}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                    />
                  </div>
                </div>
              </div>

            </div>
          </form>
        )}

        {/* ----------------------------------------------------
            TAB 12 : PROFILE & SECURITY
        ---------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Edit Info */}
            <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#EA580C]" />
                <span>Mes Informations Administrateur</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] shadow-md cursor-pointer"
                >
                  Mettre à jour mon profil
                </button>
              </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#0A8296]" />
                <span>Sécurité & Changement de Mot de Passe</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ancien Mot de Passe</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nouveau Mot de Passe (min. 6 car.)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Confirmer le Nouveau Mot de Passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-[#0A8296] hover:bg-[#086f80] shadow-md cursor-pointer"
                >
                  Valider le nouveau mot de passe
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 13 : AUDIT LOGS
        ---------------------------------------------------- */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-heading font-black text-base text-stone-900 mb-2">
              Journal d'Audit & Historique des Modifications ({auditLogs.length})
            </h3>
            
            <div className="divide-y divide-stone-100">
              {auditLogs.map(log => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-black">
                        {log.action}
                      </span>
                      <span>{log.userName} ({log.userRole})</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ----------------------------------------------------
          EDIT MODAL : PRICING TIER
      ---------------------------------------------------- */}
      {editingPricing && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h3 className="font-heading font-black text-lg text-stone-900">
                Modifier la Formule Tarifaire
              </h3>
              <button onClick={() => setEditingPricing(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nom du Billet / Pass</label>
                <input
                  type="text"
                  required
                  value={editingPricing.name}
                  onChange={(e) => setEditingPricing({ ...editingPricing, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Prix</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingPricing.price}
                    onChange={(e) => setEditingPricing({ ...editingPricing, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Devise</label>
                  <select
                    value={editingPricing.currency}
                    onChange={(e) => setEditingPricing({ ...editingPricing, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="FC">FC (Francs Congolais)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Notice de Validité</label>
                <input
                  type="text"
                  value={editingPricing.validity}
                  onChange={(e) => setEditingPricing({ ...editingPricing, validity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description courte</label>
                <textarea
                  rows={2}
                  value={editingPricing.description}
                  onChange={(e) => setEditingPricing({ ...editingPricing, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Avantages inclus (1 par ligne)</label>
                <textarea
                  rows={4}
                  value={editingPricing.features?.join('\n') || ''}
                  onChange={(e) => setEditingPricing({ ...editingPricing, features: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingPricing(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  Enregistrer et Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          EDIT MODAL : EVENT
      ---------------------------------------------------- */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h3 className="font-heading font-black text-lg text-stone-900">
                {editingEvent.id.startsWith('NEW-') ? 'Créer un Événement' : 'Modifier l\'Événement'}
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nom de l'Événement</label>
                <input
                  type="text"
                  required
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                    placeholder="18 Octobre 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Horaire</label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                    placeholder="08h30 - 18h00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Lieu & Salle</label>
                <input
                  type="text"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                  placeholder="Musée national de la RDC"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Statut</label>
                <select
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold"
                >
                  <option value="PUBLISHED">Publié (En ligne)</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description complète</label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL : CREATE ADMIN USER
      ---------------------------------------------------- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h3 className="font-heading font-black text-lg text-stone-900">
                Ajouter un Administrateur
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Professionnel</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mot de Passe Sécurisé (min. 6 car.)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Rôle</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold"
                >
                  <option value="ADMIN">Administrateur (Gestion standard)</option>
                  <option value="SUPER_ADMIN">Super Administrateur (Accès complet & utilisateurs)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL : IMAGE PREVIEW
      ---------------------------------------------------- */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewMediaUrl(null)}>
          <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700">Aperçu Haute Définition</span>
              <button onClick={() => setPreviewMediaUrl(null)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>
            <img src={previewMediaUrl} alt="Preview" className="w-full max-h-[70vh] object-contain rounded-2xl bg-stone-100" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono truncate">{previewMediaUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewMediaUrl);
                  showToast('URL de l\'image copiée !');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0A8296] text-white text-xs font-bold"
              >
                Copier le lien
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
