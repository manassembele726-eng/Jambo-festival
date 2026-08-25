import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Ticket, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  QrCode,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenTicketing: (type?: 'STANDARD' | 'VIP') => void;
  ticketsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenTicketing,
  ticketsCount = 0,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À Propos' },
    { id: 'programme', label: 'Programme' },
    { id: 'activites', label: 'Activités' },
    { id: 'invites', label: 'Invités' },
    { id: 'billetterie', label: 'Billetterie' },
    { id: 'randonnee', label: 'Randonnée (24 Oct)' },
    { id: 'formations', label: 'Formations' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    
    // If it's a section on home page, scroll to it smoothly
    if (currentView === 'home') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Notification Strip */}
      <div className="bg-[#168A45] text-white text-xs font-medium py-1.5 px-4 text-center border-b border-[#0D572B] flex items-center justify-between sm:justify-center gap-4">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F47B20] text-white uppercase tracking-wider shadow-sm">
            3e Édition
          </span>
          <span className="hidden sm:inline">🇨🇩 Kinshasa, RDC —</span>
          <span className="font-semibold text-white">18 & 24 Octobre 2026</span>
          <span className="hidden md:inline italic opacity-90 text-amber-100">
            « Pesa tourisme ya mboka chance ! »
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-[11px]">
          <button 
            onClick={() => onNavigate('mon-jambo')}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">Mon Espace</span>
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div 
        className={`transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-orange-100' 
            : 'bg-white/90 backdrop-blur-sm border-b border-stone-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group"
              id="header-brand-logo"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#168A45] p-0.5 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Compass className="w-7 h-7 text-[#F47B20] group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-2xl tracking-tight text-[#F47B20]">
                    JAMBO
                  </span>
                  <span className="font-heading font-light text-2xl tracking-widest text-[#168A45]">
                    FESTIVAL
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#168A45] text-white">
                    2026
                  </span>
                </div>
                <p className="text-[11px] font-medium text-stone-600 tracking-wide">
                  Tourisme & Culture en RDC
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1" id="desktop-nav-menu">
              {navLinks.map((link) => {
                const isActive = currentView === link.id || (currentView === 'home' && link.id === 'accueil');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#F47B20] bg-[#FFF5EB] font-bold'
                        : 'text-stone-700 hover:text-[#F47B20] hover:bg-[#FFF5EB]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => onNavigate('mon-jambo')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#168A45] bg-[#EDF7F1] hover:bg-[#168A45] hover:text-white border border-[#168A45]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Consulter mes billets"
                id="btn-mon-jambo-header"
              >
                <QrCode className="w-4 h-4 text-current" />
                <span>Mes Billets</span>
              </button>

              <button
                onClick={() => onOpenTicketing('STANDARD')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#F47B20] hover:bg-[#E06912] shadow-md hover:shadow-orange-500/25 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
                id="btn-buy-ticket-header"
              >
                <Ticket className="w-4 h-4" />
                <span>ACHETER MON BILLET</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => onOpenTicketing('STANDARD')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#F47B20] sm:hidden flex items-center gap-1 shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Billet</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-700 hover:text-[#F47B20] hover:bg-orange-50 focus:outline-none"
                aria-label="Menu principal"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-200">
            <button
              onClick={() => {
                onNavigate('mon-jambo');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-[#EDF7F1] text-[#168A45] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#168A45]/20"
            >
              <QrCode className="w-4 h-4 text-[#168A45]" />
              Mon Espace Billet
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-[#FFF5EB] text-[#F47B20] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#F47B20]/20"
            >
              <ShieldCheck className="w-4 h-4 text-[#F47B20]" />
              Administration
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#FFF5EB] hover:text-[#F47B20] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={() => {
                onOpenTicketing('STANDARD');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl text-center font-bold text-white bg-[#F47B20] hover:bg-[#E06912] shadow-md flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              <span>ACHETER MON BILLET (Dès 15 USD)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
