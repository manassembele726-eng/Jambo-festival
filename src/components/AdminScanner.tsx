import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  User, 
  Calendar, 
  Volume2, 
  VolumeX,
  Zap,
  ZapOff,
  SwitchCamera,
  History,
  CreditCard,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { storageService, ScanLogEntry } from '../services/storageService';
import { Ticket, CheckInResult } from '../types';

interface AdminScannerProps {
  onBackToAdmin: () => void;
}

export const AdminScanner: React.FC<AdminScannerProps> = ({ onBackToAdmin }) => {
  const [manualCode, setManualCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [stats, setStats] = useState(storageService.getStats());
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [autoResumeTimer, setAutoResumeTimer] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshData = useCallback(() => {
    setStats(storageService.getStats());
    setScanLogs(storageService.getScanLogs());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Audio synthesize feedback
  const playAudioTone = useCallback((type: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'UNPAID') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'VALID') {
        // High harmonic double success chime (C6 -> G6)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
        osc1.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.12); // G6

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else if (type === 'ALREADY_USED') {
        // Harsh double alarm tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(320, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'UNPAID') {
        // Warning double chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        // Invalid buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  }, [soundEnabled]);

  // Haptic feedback for mobile devices
  const triggerHaptics = useCallback((type: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'UNPAID') => {
    if (!hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      if (type === 'VALID') {
        navigator.vibrate([80, 50, 120]);
      } else if (type === 'ALREADY_USED') {
        navigator.vibrate([150, 100, 150, 100, 250]);
      } else if (type === 'UNPAID') {
        navigator.vibrate([100, 80, 100]);
      } else {
        navigator.vibrate([300]);
      }
    } catch {
      // Vibration not supported
    }
  }, [hapticsEnabled]);

  // Process ticket code verification
  const handleVerifyCode = useCallback((codeToVerify: string) => {
    if (!codeToVerify.trim() || isProcessing) return;
    setIsProcessing(true);

    const result = storageService.verifyAndCheckInTicket(codeToVerify.trim(), 'Staff Contrôle Entrée');
    setLastScanResult(result);
    refreshData();

    playAudioTone(result.code);
    triggerHaptics(result.code);

    setIsProcessing(false);
  }, [isProcessing, playAudioTone, triggerHaptics, refreshData]);

  // Video stream frame scanner
  const scanVideoFrame = useCallback(() => {
    if (
      videoRef.current &&
      canvasRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim().length > 0) {
          handleVerifyCode(code.data.trim());
          // Pause camera briefly so staff can view the outcome
          setCameraActive(false);
          return;
        }
      }
    }

    if (cameraActive) {
      requestRef.current = requestAnimationFrame(scanVideoFrame);
    }
  }, [cameraActive, handleVerifyCode]);

  // Handle camera start/stop
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cameraActive) {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      navigator.mediaDevices?.getUserMedia(constraints)
        .then((s) => {
          stream = s;
          streamRef.current = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.play().then(() => {
              // Check for torch track
              const track = s.getVideoTracks()[0];
              const capabilities = (track as any).getCapabilities?.();
              if (capabilities && 'torch' in capabilities) {
                setHasTorch(true);
              } else {
                setHasTorch(false);
              }
              requestRef.current = requestAnimationFrame(scanVideoFrame);
            }).catch((err) => {
              console.error('Video play error:', err);
            });
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setCameraError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre smartphone ou saisissez le code manuellement.");
          setCameraActive(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [cameraActive, cameraFacing, scanVideoFrame]);

  // Torch / Flashlight Toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const nextTorch = !torchOn;
      await (track as any).applyConstraints?.({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch not supported or failed:', e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleVerifyCode(manualCode.trim());
    setManualCode('');
  };

  const handleResetForNextScan = () => {
    setLastScanResult(null);
    setCameraActive(true);
  };

  return (
    <div className="min-h-screen bg-[#051822] text-white pt-24 pb-20 select-none">
      
      {/* Top Mobile-Optimized Status Bar */}
      <div className="bg-[#082836] border-b border-white/10 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBackToAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F47B20] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tableau de Bord</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Haptics toggle */}
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              title={hapticsEnabled ? "Vibrations activées" : "Vibrations désactivées"}
              className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                hapticsEnabled ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-white/5 text-stone-400'
              }`}
            >
              VIB
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Sons activés" : "Sons désactivés"}
              className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-stone-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* History logs button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>Historique ({scanLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Entrance Controller Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#082836] p-4 sm:p-5 rounded-2xl border border-orange-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#F47B20]">
                Poste de Contrôle Smartphone • Portique Entrée
              </span>
            </div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-white mt-1">
              CONTRÔLE D'ACCÈS JAMBO 2026
            </h1>
            <p className="text-xs text-stone-300 flex items-center gap-2 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>18 Octobre 2026 • Musée national de la RDC (Kinshasa)</span>
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <div className="text-center pr-3 border-r border-white/15">
              <p className="text-[10px] uppercase font-bold text-stone-400">Entrées</p>
              <p className="font-heading font-black text-lg text-emerald-400">{stats.scannedCount}</p>
            </div>
            <div className="text-center pr-3 border-r border-white/15">
              <p className="text-[10px] uppercase font-bold text-stone-400">VIP</p>
              <p className="font-heading font-black text-lg text-[#F47B20]">{stats.vipSold}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-stone-400">Total Vendus</p>
              <p className="font-heading font-black text-lg text-white">{stats.totalSold}</p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CRITICAL SCANNER FEEDBACK BANNER (4 OUTCOMES) */}
        {/* ---------------------------------------------------- */}
        {lastScanResult && (
          <div className="mb-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* 1. BILLET VALIDE */}
            {lastScanResult.code === 'VALID' && (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-400">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/40">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-950/60 uppercase tracking-widest text-emerald-200 border border-emerald-400/40">
                        RÉSULTAT DU SCAN
                      </span>
                      <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
                        BILLET VALIDE
                      </h2>
                    </div>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                    lastScanResult.ticket?.type === 'VIP' 
                      ? 'bg-[#D4AF37] text-[#082836] border border-amber-200' 
                      : 'bg-cyan-100 text-[#082836] border border-cyan-300'
                  }`}>
                    {lastScanResult.ticket?.type === 'VIP' ? '★ PASS VIP ACCÈS TOTAL' : 'PASS STANDARD'}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-400/30">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">Titulaire du billet</p>
                    <p className="font-heading font-black text-xl text-white">
                      {lastScanResult.ticket?.participant.firstName} {lastScanResult.ticket?.participant.lastName}
                    </p>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      {lastScanResult.ticket?.participant.city}, {lastScanResult.ticket?.participant.country}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-emerald-100 sm:border-l sm:border-emerald-500/30 sm:pl-4">
                    <p><strong className="text-white">N° Billet :</strong> <span className="font-mono">{lastScanResult.ticket?.ticketId}</span></p>
                    <p><strong className="text-white">Date autorisée :</strong> 18 Octobre 2026</p>
                    <p><strong className="text-white">Check-in :</strong> Validé et enregistré à l'instant ({new Date().toLocaleTimeString('fr-FR')})</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-emerald-100 font-medium">
                    ✓ Accès autorisé au Musée national de la RDC. Remettre le bracelet ou badge correspondant.
                  </p>
                  <button
                    onClick={handleResetForNextScan}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-heading font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scanner le Billet Suivant</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. BILLET DÉJÀ UTILISÉ */}
            {lastScanResult.code === 'ALREADY_USED' && (
              <div className="bg-gradient-to-br from-rose-700 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-rose-400 animate-in shake duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rose-500/40">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white text-rose-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <AlertTriangle className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-rose-950 uppercase tracking-widest text-rose-200 border border-rose-400/40">
                        ALERTE SÉCURITÉ ENTRÉE
                      </span>
                      <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
                        BILLET DÉJÀ UTILISÉ
                      </h2>
                    </div>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950 text-rose-200 border border-rose-400">
                    DOUBLE UTILISATION BLOQUÉE
                  </span>
                </div>

                <div className="mt-5 bg-rose-950/60 p-4 rounded-2xl border border-rose-400/40 space-y-2">
                  <p className="text-sm font-bold text-rose-100">
                    {lastScanResult.message}
                  </p>
                  {lastScanResult.ticket && (
                    <div className="text-xs text-rose-200 pt-2 border-t border-rose-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p>Titulaire enregistré : <strong className="text-white">{lastScanResult.ticket.participant.firstName} {lastScanResult.ticket.participant.lastName}</strong></p>
                      <p>Numéro : <strong className="font-mono text-white">{lastScanResult.ticket.ticketId}</strong></p>
                      <p>Type : <strong className="text-white">{lastScanResult.ticket.type} ({lastScanResult.ticket.price} USD)</strong></p>
                      <p>Premier passage : <strong className="text-white">{lastScanResult.ticket.checkedInAt ? new Date(lastScanResult.ticket.checkedInAt).toLocaleString('fr-FR') : 'Heure antérieure'}</strong></p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-rose-200 font-semibold">
                    ⛔ Refuser l'accès. Vérifier l'identité de la personne ou contacter le responsable de billetterie.
                  </p>
                  <button
                    onClick={handleResetForNextScan}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-rose-100 text-rose-900 font-heading font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Nouveau Scan</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. BILLET INVALIDE */}
            {lastScanResult.code === 'INVALID' && (
              <div className="bg-gradient-to-br from-amber-600 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 animate-in shake duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/40">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white text-amber-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <XCircle className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-950 uppercase tracking-widest text-amber-200 border border-amber-400/40">
                        NON RECONNU DANS LA BASE
                      </span>
                      <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
                        BILLET INVALIDE
                      </h2>
                    </div>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-950 text-amber-200 border border-amber-400">
                    CODE INEXISTANT
                  </span>
                </div>

                <div className="mt-5 bg-amber-950/60 p-4 rounded-2xl border border-amber-400/40 space-y-2">
                  <p className="text-sm font-bold text-amber-100">
                    {lastScanResult.message}
                  </p>
                  <p className="text-xs text-amber-200">
                    Aucun billet officiel correspondant n'a été trouvé. Il peut s'agir d'un QR code tiers, d'une erreur de saisie ou d'un faux billet.
                  </p>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-amber-200 font-medium">
                    ⚠️ Vérifiez que le participant présente bien son billet numérique officiel JAMBO 2026.
                  </p>
                  <button
                    onClick={handleResetForNextScan}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-heading font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Réessayer le Scan</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. PAIEMENT NON CONFIRMÉ */}
            {lastScanResult.code === 'UNPAID' && (
              <div className="bg-gradient-to-br from-yellow-600 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 animate-in shake duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-yellow-400/40">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white text-yellow-800 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <CreditCard className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-yellow-950 uppercase tracking-widest text-yellow-200 border border-yellow-400/40">
                        STATUT COMMANDE
                      </span>
                      <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
                        PAIEMENT NON CONFIRMÉ
                      </h2>
                    </div>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-950 text-yellow-200 border border-yellow-400">
                    STATUT : {lastScanResult.ticket?.status || 'EN ATTENTE'}
                  </span>
                </div>

                <div className="mt-5 bg-yellow-950/60 p-4 rounded-2xl border border-yellow-300/40 space-y-2">
                  <p className="text-sm font-bold text-yellow-100">
                    {lastScanResult.message}
                  </p>
                  {lastScanResult.ticket && (
                    <div className="text-xs text-yellow-200 pt-2 border-t border-yellow-400/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p>Participant : <strong className="text-white">{lastScanResult.ticket.participant.firstName} {lastScanResult.ticket.participant.lastName}</strong></p>
                      <p>Numéro : <strong className="font-mono text-white">{lastScanResult.ticket.ticketId}</strong></p>
                      <p>Montant à régler : <strong className="text-white">{lastScanResult.ticket.price} USD ({lastScanResult.ticket.type})</strong></p>
                      <p>Statut actuel : <strong className="text-yellow-300 uppercase">{lastScanResult.ticket.status}</strong></p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-yellow-100 font-medium">
                    💳 Rediriger le participant vers le guichet de régularisation pour procéder au paiement.
                  </p>
                  <button
                    onClick={handleResetForNextScan}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-yellow-100 text-yellow-900 font-heading font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Continuer le Contrôle</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MAIN SCANNER INTERFACE (SMARTPHONE OPTIMIZED) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Real-time Camera Viewfinder */}
          <div className="lg:col-span-7 bg-[#082836] rounded-3xl p-5 sm:p-6 border border-white/15 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-300" />
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    Caméra Smartphone (QR Code)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Torch Toggle */}
                  {cameraActive && hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        torchOn ? 'bg-amber-400 text-stone-900' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      title={torchOn ? "Éteindre la torche" : "Allumer la torche"}
                    >
                      {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Switch Front/Back Camera */}
                  {cameraActive && (
                    <button
                      onClick={() => setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Changer de caméra"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {cameraError && (
                <div className="mb-4 bg-amber-950/60 p-3.5 rounded-2xl border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Viewfinder Target */}
              <div className="relative aspect-square max-h-[380px] sm:max-h-[420px] mx-auto w-full rounded-2xl overflow-hidden bg-black/80 border-2 border-dashed border-orange-500/40 flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover" 
                      playsInline 
                      muted 
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* High-tech Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 sm:w-64 sm:h-64 relative">
                        {/* 4 Corners */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#F47B20] rounded-tl-xl shadow-lg" />
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#F47B20] rounded-tr-xl shadow-lg" />
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#F47B20] rounded-bl-xl shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#F47B20] rounded-br-xl shadow-lg" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F47B20] to-transparent shadow-[0_0_12px_#F47B20] animate-[bounce_2s_infinite]" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <QrCode className="w-24 h-24 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                      <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#F47B20] border border-orange-500/30">
                        Visez le QR Code du billet
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-stone-400">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Caméra en Pause</p>
                      <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                        Cliquez ci-dessous pour activer le lecteur de billets à l'entrée du Musée national.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Camera Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  setCameraError(null);
                  setCameraActive(!cameraActive);
                }}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-heading font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  cameraActive 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-[#F47B20] hover:bg-[#E06912] text-white shadow-orange-950/40'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{cameraActive ? 'Arrêter la Caméra' : 'Activer la Caméra'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Manual Lookup & Staff Test Tools */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Manual Code Input */}
            <div className="bg-[#082836] rounded-3xl p-5 sm:p-6 border border-white/15 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-[#F47B20]" />
                <h3 className="font-heading font-bold text-base text-white">
                  Saisie Manuelle de Code
                </h3>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase font-bold text-stone-300 block mb-1">
                    Numéro de billet ou Token QR
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: JF26-004582"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white font-mono text-sm uppercase placeholder:normal-case placeholder:text-stone-500 focus:outline-none focus:border-[#F47B20] focus:ring-1 focus:ring-[#F47B20]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="w-full py-3 rounded-xl text-xs font-heading font-black uppercase tracking-wider text-white bg-[#F47B20] hover:bg-[#E06912] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vérifier & Valider l'Accès</span>
                </button>
              </form>
            </div>

            {/* Quick Testing Panel for Staff Simulator (Validates all 4 states) */}
            <div className="bg-black/40 rounded-3xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-200">
                    Boutons de Test Rapide (4 Cas)
                  </h4>
                </div>
                <button
                  onClick={() => {
                    storageService.resetDemoTickets();
                    refreshData();
                    setLastScanResult(null);
                  }}
                  className="text-[10px] text-cyan-300 hover:text-white underline cursor-pointer"
                  title="Réinitialiser les billets de démo"
                >
                  Réinitialiser Démo
                </button>
              </div>

              <p className="text-[11px] text-stone-400 mb-3">
                Simulez instantanément les 4 cas obligatoires de contrôle :
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleVerifyCode('JF26-004582')}
                  className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-left transition-colors cursor-pointer"
                >
                  <p className="font-bold">1. Billet Valide (VIP)</p>
                  <p className="text-[10px] text-emerald-400 font-mono">JF26-004582</p>
                </button>

                <button
                  onClick={() => handleVerifyCode('JF26-001209')}
                  className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-left transition-colors cursor-pointer"
                >
                  <p className="font-bold">1b. Billet Valide (STD)</p>
                  <p className="text-[10px] text-emerald-400 font-mono">JF26-001209</p>
                </button>

                <button
                  onClick={() => handleVerifyCode('JF26-008914')}
                  className="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-left transition-colors cursor-pointer"
                >
                  <p className="font-bold">2. Billet Déjà Utilisé</p>
                  <p className="text-[10px] text-rose-400 font-mono">JF26-008914</p>
                </button>

                <button
                  onClick={() => handleVerifyCode('JF26-009999')}
                  className="p-2.5 rounded-xl bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-500/40 text-yellow-200 text-left transition-colors cursor-pointer"
                >
                  <p className="font-bold">3. Paiement Non Confirmé</p>
                  <p className="text-[10px] text-yellow-400 font-mono">JF26-009999</p>
                </button>

                <button
                  onClick={() => handleVerifyCode('FAKE-999-INVALIDE')}
                  className="col-span-2 p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">4. Billet Invalide / Inexistant</p>
                    <p className="text-[10px] text-amber-400 font-mono">FAKE-999-INVALIDE</p>
                  </div>
                  <XCircle className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Official Entrance Rules Box */}
            <div className="bg-[#082836]/60 rounded-3xl p-5 border border-white/10 text-xs text-stone-300 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#D4AF37]">
                Protocole Officiel du Contrôle :
              </h4>
              <ul className="space-y-1.5 text-[11px] text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <span>Validité : <strong>Exclusivement le 18 octobre 2026</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span>Chaque scan valide enregistre immédiatement le check-in dans Firestore/Base locale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                  <span>Double scan bloqué automatiquement pour éviter les doublons à l'entrée.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* RECENT SCAN LOGS DRAWER / SECTION */}
        {/* ---------------------------------------------------- */}
        {showHistory && (
          <div className="mt-8 bg-[#082836] rounded-3xl p-6 border border-white/15 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-lg text-white">
                  Journal des Scans en Temps Réel
                </h3>
              </div>
              
              {scanLogs.length > 0 && (
                <button
                  onClick={() => {
                    storageService.clearScanLogs();
                    refreshData();
                  }}
                  className="text-xs text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Effacer l'historique</span>
                </button>
              )}
            </div>

            {scanLogs.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">
                Aucun scan enregistré pour le moment. Scannez un billet pour voir l'historique.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {scanLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {log.code === 'VALID' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {log.code === 'ALREADY_USED' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                      {log.code === 'INVALID' && <XCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                      {log.code === 'UNPAID' && <CreditCard className="w-4 h-4 text-yellow-400 shrink-0" />}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.code === 'VALID' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                            log.code === 'ALREADY_USED' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                            log.code === 'UNPAID' ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/30' :
                            'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}>
                            {log.code === 'VALID' ? 'BILLET VALIDE' :
                             log.code === 'ALREADY_USED' ? 'DÉJÀ UTILISÉ' :
                             log.code === 'UNPAID' ? 'NON CONFIRMÉ' : 'INVALIDE'}
                          </span>
                          {log.ticketType && (
                            <span className="text-[10px] text-stone-400 font-bold">
                              {log.ticketType}
                            </span>
                          )}
                          <span className="font-mono text-stone-300 font-bold">
                            {log.ticketId || log.query}
                          </span>
                        </div>
                        {log.participantName && (
                          <p className="text-[11px] text-stone-300 mt-0.5">
                            {log.participantName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-stone-400">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
