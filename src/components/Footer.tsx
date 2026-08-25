import React from 'react';
import { 
  Compass, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ArrowUp,
  Heart,
  QrCode,
  Lock
} from 'lucide-react';
import { FESTIVAL_INFO } from '../data/festivalData';

interface FooterProps {
  onNavigate: (view: any) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateSection,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#121815] text-white border-t border-stone-800 relative no-print">
      
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F47B20] via-white to-[#168A45]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Slogan (2 cols width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F47B20] flex items-center justify-center text-white shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="font-heading font-black text-xl tracking-tight text-white block">
                  JAMBO FESTIVAL
                </span>
                <span className="text-[10px] font-bold text-[#F47B20] uppercase tracking-widest block">
                  3e ÉDITION • RDC 2026
                </span>
              </div>
            </div>

            <p className="text-stone-300 text-sm italic leading-relaxed">
              « {FESTIVAL_INFO.mainTagline} »
            </p>

            <div className="inline-block px-3 py-1 rounded-md bg-[#168A45] border border-[#168A45]/40 text-white text-xs font-extrabold tracking-wide">
              « PESA TOURISME YA MBOKA CHANCE ! »
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm pt-2">
              Plateforme officielle de valorisation de l'écotourisme, de la culture et de l'insertion professionnelle des jeunes femmes en République démocratique du Congo.
            </p>
          </div>

          {/* Col 2: Navigation rapide */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#F47B20] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button 
                  onClick={() => onNavigateSection('accueil')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('apropos')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  À Propos & Histoire
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('programme')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  Programme (18 & 24 Oct.)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('billetterie')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  Billetterie 18 Octobre
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('randonnee')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  Grande Randonnée 24 Oct.
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('formations')} 
                  className="hover:text-[#F47B20] transition-colors cursor-pointer"
                >
                  Formations Métiers Accueil
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Programme & Lieux */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#F47B20] uppercase tracking-wider">
              Dates & Lieux 2026
            </h4>
            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-[#F47B20] block">18 Octobre 2026</span>
                <span className="text-[11px] text-stone-300 block">Musée National de la RDC</span>
                <span className="text-[10px] text-stone-400 font-medium">Billet Standard (15$) / VIP (25$)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-[#168A45] block">24 Octobre 2026</span>
                <span className="text-[11px] text-stone-300 block">Amani Eco-Park, Mitendi</span>
                <span className="text-[10px] text-stone-400">Grande Randonnée Écotourisme</span>
              </div>
            </div>
          </div>

          {/* Col 4: Espaces & Accès Pro */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#F47B20] uppercase tracking-wider">
              Espaces Dédiés
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('mon-jambo')}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Mon Espace JAMBO</span>
              </button>

              <button
                onClick={() => onNavigate('admin-scanner')}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#F47B20]/15 hover:bg-[#F47B20]/25 text-[#F47B20] hover:text-orange-300 transition-colors flex items-center gap-2 cursor-pointer font-bold"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scanner Contrôle d'Accès</span>
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Administration Festival</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © 2026 JAMBO FESTIVAL. Tous droits réservés. République démocratique du Congo.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-[#F47B20] hover:bg-[#E06912] text-white transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
};
