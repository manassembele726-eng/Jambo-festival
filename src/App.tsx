import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { HistoryTimeline } from './components/HistoryTimeline';
import { ObjectivesSection } from './components/ObjectivesSection';
import { ProgramSection } from './components/ProgramSection';
import { TicketingSection } from './components/TicketingSection';
import { HikeSection } from './components/HikeSection';
import { TrainingsSection } from './components/TrainingsSection';
import { ExhibitionSection } from './components/ExhibitionSection';
import { GuestsSection } from './components/GuestsSection';
import { TransportSection } from './components/TransportSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { JamboAssistant } from './components/JamboAssistant';
import { ParticipantSpace } from './components/ParticipantSpace';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminScanner } from './components/AdminScanner';
import { AdminLogin } from './components/AdminLogin';
import { TicketType, AdminUser } from './types';
import { apiService } from './services/apiService';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'mon-jambo' | 'admin' | 'admin-scanner'>('home');
  const [isTicketingModalOpen, setIsTicketingModalOpen] = useState(false);
  const [ticketingInitialType, setTicketingInitialType] = useState<TicketType>('STANDARD');
  const [isHikeModalOpen, setIsHikeModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => apiService.auth.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => apiService.auth.isAuthenticated());

  // Check auth session on startup
  useEffect(() => {
    if (apiService.auth.isAuthenticated()) {
      apiService.auth.fetchMe().then(user => {
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      });
    }
  }, []);

  // Sync pathname and hash routing
  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (path === '/admin/scanner' || hash === '#/admin/scanner' || hash === '#admin-scanner') {
        setCurrentView('admin-scanner');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path === '/admin' || hash === '#/admin' || hash === '#admin' || path === '/admin/login' || hash === '#/admin/login') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path === '/mon-jambo' || hash === '#/mon-jambo' || hash === '#mon-jambo') {
        setCurrentView('mon-jambo');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '' && (path === '/' || path === '')) {
        if (currentView !== 'home') {
          setCurrentView('home');
        }
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [currentView]);

  const handleNavigateView = (view: 'home' | 'mon-jambo' | 'admin' | 'admin-scanner') => {
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = '';
    } else if (view === 'mon-jambo') {
      window.location.hash = '/mon-jambo';
    } else if (view === 'admin') {
      window.location.hash = '/admin';
    } else if (view === 'admin-scanner') {
      window.location.hash = '/admin/scanner';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenTicketing = (type?: TicketType) => {
    if (type) setTicketingInitialType(type);
    setIsTicketingModalOpen(true);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    apiService.auth.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    handleNavigateView('home');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#0A8296] selection:text-white flex flex-col justify-between">
      
      {/* Header is shown on public views */}
      {currentView !== 'admin' && currentView !== 'admin-scanner' && (
        <Header
          activeView={currentView}
          onNavigate={handleNavigateView}
          onNavigateSection={handleNavigateSection}
          onOpenTicketing={() => handleOpenTicketing('STANDARD')}
        />
      )}

      {/* Main Content switcher */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            {/* 1. Hero */}
            <Hero
              onOpenTicketing={handleOpenTicketing}
              onNavigateSection={handleNavigateSection}
            />

            {/* 2. Qu'est-ce que JAMBO Festival ? (Mission, Vision, Valeurs) */}
            <AboutSection />

            {/* 3. Histoire & Timeline des éditions */}
            <HistoryTimeline />

            {/* 4. Nos 5 Objectifs Stratégiques */}
            <ObjectivesSection
              onOpenTicketing={() => handleOpenTicketing('STANDARD')}
            />

            {/* 5. Programme (18 & 24 Octobre 2026) */}
            <ProgramSection
              onOpenTicketing={handleOpenTicketing}
              onOpenHikeModal={() => setIsHikeModalOpen(true)}
              onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
            />

            {/* 6. Billetterie (18 Octobre 2026) */}
            <TicketingSection />

            {/* 7. Grande Randonnée (24 Octobre 2026 - Amani Eco-Park) */}
            <HikeSection
              isOpenModal={isHikeModalOpen}
              onCloseModal={() => setIsHikeModalOpen(false)}
            />

            {/* 8. Formations Professionnelles (Hôtesses & Guides) */}
            <TrainingsSection
              isOpenModal={isTrainingModalOpen}
              onCloseModal={() => setIsTrainingModalOpen(false)}
            />

            {/* 9. Grande Exposition au Musée National */}
            <ExhibitionSection
              onOpenTicketing={() => handleOpenTicketing('STANDARD')}
            />

            {/* 10. Invités de Marque & Personnalités */}
            <GuestsSection />

            {/* 11. Transport & Mobilité */}
            <TransportSection />

            {/* 12. Galerie JAMBO avec Lightbox */}
            <GallerySection />

            {/* 13. Questions Fréquentes (FAQ) & Formulaire de Contact */}
            <ContactSection />
          </>
        )}

        {currentView === 'mon-jambo' && (
          <ParticipantSpace
            onBackToHome={() => handleNavigateView('home')}
            onOpenTicketing={() => handleOpenTicketing('STANDARD')}
          />
        )}

        {currentView === 'admin' && (
          isAuthenticated && currentUser ? (
            <AdminDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onBackToHome={() => handleNavigateView('home')}
              onOpenScanner={() => handleNavigateView('admin-scanner')}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onBackToHome={() => handleNavigateView('home')}
            />
          )
        )}

        {currentView === 'admin-scanner' && (
          <AdminScanner
            onBackToAdmin={() => handleNavigateView('admin')}
          />
        )}
      </main>

      {/* Ticketing Modal if triggered from quick CTAs */}
      {isTicketingModalOpen && (
        <TicketingSection
          initialType={ticketingInitialType}
          isOpenAsModal={true}
          onCloseModal={() => setIsTicketingModalOpen(false)}
        />
      )}

      {/* Footer shown on public views */}
      {currentView !== 'admin' && currentView !== 'admin-scanner' && (
        <Footer
          onNavigate={handleNavigateView}
          onNavigateSection={handleNavigateSection}
        />
      )}

      {/* Floating AI Assistant (JAMBO Assistant) */}
      {currentView !== 'admin' && currentView !== 'admin-scanner' && (
        <JamboAssistant
          onOpenTicketing={handleOpenTicketing}
          onOpenHike={() => setIsHikeModalOpen(true)}
          onOpenTraining={() => setIsTrainingModalOpen(true)}
          onNavigateSection={handleNavigateSection}
        />
      )}

    </div>
  );
}
