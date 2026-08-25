import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Trees, 
  Award,
  ChevronDown
} from 'lucide-react';
import { FESTIVAL_INFO } from '../data/festivalData';

interface HeroProps {
  onOpenTicketing: (type?: 'STANDARD' | 'VIP') => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenTicketing,
  onNavigateSection,
}) => {
  // Target: 18 Octobre 2026, 08:00:00 Africa/Kinshasa (UTC+1)
  const targetDate = new Date('2026-10-18T08:00:00+01:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section 
      id="accueil" 
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#C45709] via-[#F47B20] to-[#E06912]"
    >
      {/* Background Photography & Warm African Sunset Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80"
          alt="Paysage majestueux de la RDC et nature africaine"
          className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#C45709] via-[#F47B20]/90 to-[#C45709]/80" />
      </div>

      {/* Decorative Subtle Congolese Motifs / Ambient Glows */}
      <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#168A45]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-white/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Edition Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#168A45] ring-2 ring-white animate-pulse" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
            3e ÉDITION OFFICIELLE
          </span>
          <span className="text-white/60">•</span>
          <span className="text-xs sm:text-sm font-bold text-[#EDF7F1]">
            18 & 24 OCTOBRE 2026
          </span>
        </div>

        {/* Festival Main Heading */}
        <div className="space-y-1 mb-6">
          <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-md">
            JAMBO
            <span className="block font-light tracking-widest text-white/95 drop-shadow-sm">
              FESTIVAL
            </span>
          </h1>
        </div>

        {/* Official Slogan & Tagline */}
        <div className="max-w-3xl mx-auto space-y-3 mb-10">
          <p className="text-lg sm:text-xl md:text-2xl font-serif-luxury italic text-white font-medium leading-relaxed drop-shadow">
            {FESTIVAL_INFO.mainTagline}
          </p>
          <div className="inline-block px-5 py-2 rounded-full bg-white text-[#F47B20] text-sm sm:text-base font-extrabold tracking-wide shadow-lg border border-orange-200">
            « PESA TOURISME YA MBOKA CHANCE ! »
          </div>
        </div>

        {/* CTA Buttons - Primary: Orange with white text (or high contrast on orange), Secondary: Green with white text */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={() => onOpenTicketing('STANDARD')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-[#F47B20] bg-white hover:bg-orange-50 shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-2 border-white flex items-center justify-center gap-3 cursor-pointer"
            id="hero-cta-ticket"
          >
            <Ticket className="w-5 h-5 text-[#F47B20]" />
            <span>ACHETER MON BILLET</span>
            <ArrowRight className="w-4 h-4 text-[#F47B20]" />
          </button>

          <button
            onClick={() => onNavigateSection('programme')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-[#168A45] hover:bg-[#12733A] border-2 border-white/40 shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            id="hero-cta-programme"
          >
            <Calendar className="w-5 h-5 text-white" />
            <span>VOIR LE PROGRAMME</span>
          </button>
        </div>

        {/* Dynamic Countdown Component in Crisp White Container */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-[#F47B20] font-extrabold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#168A45]" />
            <span>COMPTE À REBOURS AVANT LE 18 OCTOBRE 2026</span>
            <Sparkles className="w-3.5 h-3.5 text-[#168A45]" />
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-[#FFF5EB] rounded-xl p-2.5 sm:p-3.5 border border-orange-200">
              <span className="block font-heading font-black text-2xl sm:text-4xl text-[#F47B20]">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                JOURS
              </span>
            </div>

            <div className="bg-[#FFF5EB] rounded-xl p-2.5 sm:p-3.5 border border-orange-200">
              <span className="block font-heading font-black text-2xl sm:text-4xl text-[#F47B20]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                HEURES
              </span>
            </div>

            <div className="bg-[#FFF5EB] rounded-xl p-2.5 sm:p-3.5 border border-orange-200">
              <span className="block font-heading font-black text-2xl sm:text-4xl text-[#F47B20]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
                MINUTES
              </span>
            </div>

            <div className="bg-[#EDF7F1] rounded-xl p-2.5 sm:p-3.5 border border-[#168A45]/30">
              <span className="block font-heading font-black text-2xl sm:text-4xl text-[#168A45]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#168A45] uppercase tracking-wider">
                SECONDES
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Row in Crisp White & Green */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 text-left">
          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white shadow-lg flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#FFF5EB] text-[#F47B20]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">18 Octobre 2026</p>
              <p className="text-sm font-bold text-stone-900">Journée Professionnelle</p>
              <p className="text-[11px] text-[#F47B20] font-semibold">Musée national de la RDC</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white shadow-lg flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#EDF7F1] text-[#168A45]">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">24 Octobre 2026</p>
              <p className="text-sm font-bold text-stone-900">Grande Randonnée</p>
              <p className="text-[11px] text-[#168A45] font-semibold">Amani Eco-Park, Mitendi</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white shadow-lg flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#FFF5EB] text-[#F47B20]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">Impact & Formation</p>
              <p className="text-sm font-bold text-stone-900">Hôtesses & Guides</p>
              <p className="text-[11px] text-[#168A45] font-semibold">Insertion professionnelle</p>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <button 
        onClick={() => onNavigateSection('apropos')}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1 cursor-pointer no-print"
        aria-label="Faire défiler"
      >
        <span className="text-[11px] tracking-wider uppercase font-bold text-white">Découvrir</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-white" />
      </button>
    </section>
  );
};
