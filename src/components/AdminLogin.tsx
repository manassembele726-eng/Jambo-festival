import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserCheck, 
  Info,
  HelpCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('admin@jambofestival.cd');
  const [password, setPassword] = useState('AdminJambo2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ message?: string; tempCode?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await apiService.auth.login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Identifiants invalides. Veuillez vérifier vos accès.');
      }
    } catch (err: any) {
      setErrorMessage('Une erreur de connexion est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await apiService.auth.forgotPassword(forgotEmail);
    setForgotStatus(res);
  };

  const handleFillDemo = (role: 'SUPER_ADMIN' | 'ADMIN') => {
    if (role === 'SUPER_ADMIN') {
      setEmail('admin@jambofestival.cd');
      setPassword('AdminJambo2026!');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F47B20]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#168A45]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Nav */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#F47B20] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site public</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F47B20] to-[#E06912] text-white shadow-xl shadow-orange-500/25 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Espace Administrateur
          </h2>
          <p className="text-sm text-stone-600 mt-1 font-medium">
            Plateforme de Gestion Officielle • JAMBO Festival 2026
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/60 rounded-3xl border border-stone-200">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Adresse Email Professionnelle
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20] focus:border-transparent transition-all"
                  placeholder="admin@jambofestival.cd"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotEmail(email);
                    setForgotStatus(null);
                  }}
                  className="text-xs font-semibold text-[#F47B20] hover:text-[#E06912] transition-colors cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20] focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-[#F47B20] hover:bg-[#E06912] shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authentification sécurisée...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Se connecter au Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* First Admin Helper Badge */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#168A45]" />
                  Compte Administrateur Initial
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#168A45]">
                  Prêt à l'emploi
                </span>
              </div>
              <p className="text-xs text-stone-500 mb-2.5">
                Le compte Super Administrateur est initialisé avec mot de passe crypté côté serveur.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('SUPER_ADMIN')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-[11px] font-bold text-stone-700 hover:bg-stone-100 hover:border-stone-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#F47B20]" />
                  <span>Remplir les accès Super Admin</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-stone-500 mt-6 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span>Accès réservé au personnel autorisé de JAMBO Festival. Authentification chiffrée.</span>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h3 className="font-heading font-black text-lg text-stone-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F47B20]" />
                <span>Réinitialisation de mot de passe</span>
              </h3>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {forgotStatus ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Demande enregistrée</span>
                  </div>
                  <p>{forgotStatus.message}</p>
                  {forgotStatus.tempCode && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-300 font-mono text-center font-black text-base text-emerald-700">
                      Code : {forgotStatus.tempCode}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-stone-600">
                  Indiquez votre adresse email administrateur pour recevoir une clé temporaire sécurisée.
                </p>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm"
                    placeholder="admin@jambofestival.cd"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F47B20] hover:bg-[#E06912]"
                  >
                    Envoyer les instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
