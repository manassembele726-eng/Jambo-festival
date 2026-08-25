import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Compass,
  Copy,
  Check,
  FileText,
  Sparkles,
  QrCode as QrIcon,
  Eye
} from 'lucide-react';
import { Ticket } from '../types';

interface DigitalTicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  ticket,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const ticketElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket) {
      // The QR code contains the secure verification token and ticket reference
      const qrPayload = ticket.qrToken || ticket.ticketId;
      QRCode.toDataURL(qrPayload, {
        width: 400,
        margin: 1,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [ticket]);

  if (!ticket) return null;

  const isVip = ticket.type === 'VIP';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!ticketElementRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(ticketElementRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaled image size fitting within A4 with elegant margins
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      const posY = Math.max(margin, (pdfHeight - contentHeight) / 3);

      pdf.addImage(imgData, 'JPEG', margin, posY, contentWidth, contentHeight);
      pdf.save(`JAMBO_FESTIVAL_2026_BILLET_${ticket.ticketId}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      // Fallback to print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!ticketElementRef.current) return;
    setIsDownloadingImage(true);
    try {
      const canvas = await html2canvas(ticketElementRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `BILLET_JAMBO_2026_${ticket.ticketId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur téléchargement Image:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div 
        id="print-ticket-root"
        className="relative w-full max-w-2xl my-auto bg-white rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden"
      >
        
        {/* Top Header Action Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 sm:px-8 py-4 bg-[#F47B20] text-white border-b border-orange-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-sm uppercase tracking-wider block">
                Billet Officiel Numérique
              </span>
              <span className="text-[10px] text-orange-100 font-medium">
                JAMBO FESTIVAL 2026 • 3e ÉDITION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Imprimer le billet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="p-2 rounded-xl bg-[#168A45] hover:bg-[#127038] text-white font-black transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Télécharger en PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'PDF...' : 'PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Digital Ticket Container - Highly Crafted for Display, PDF Export & Print */}
        <div className="p-4 sm:p-8 bg-stone-50">
          
          <div 
            ref={ticketElementRef}
            className={`print-ticket-container relative rounded-3xl overflow-hidden border-2 shadow-2xl transition-all ${
              isVip 
                ? 'border-[#F47B20] bg-white ring-4 ring-[#F47B20]/15' 
                : 'border-[#168A45] bg-white'
            }`}
          >
            {/* Background Decorative African Motifs */}
            <div className="absolute inset-0 bg-kuba-subtle opacity-20 pointer-events-none" />
            
            {/* Top Identity Banner */}
            <div className={`relative px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isVip 
                ? 'bg-stone-900 text-white border-orange-500/50' 
                : 'bg-stone-900 text-white border-green-500/50'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F47B20] border-2 border-white flex items-center justify-center text-white shadow-lg shrink-0">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-[#F47B20] uppercase bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight leading-none mt-1">
                    JAMBO FESTIVAL 2026
                  </h2>
                  <p className="text-xs font-bold text-orange-200 tracking-wider mt-0.5">
                    3e ÉDITION • KINSHASA • MINISTÈRE DU TOURISME & ONT
                  </p>
                </div>
              </div>

              {/* Ticket Category Badge & Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                <span className={`px-4 py-1.5 rounded-full font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-md ${
                  isVip 
                    ? 'bg-[#F47B20] text-white border border-white/30' 
                    : 'bg-[#168A45] text-white border border-white/30'
                }`}>
                  {isVip ? 'PASS VIP' : 'PASS STANDARD'}
                </span>
                <span className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
                  {ticket.price} <span className="text-sm font-bold text-[#F47B20]">{ticket.currency}</span>
                </span>
              </div>
            </div>

            {/* CRITICAL STRICT VALIDITY NOTICE BANNER */}
            <div className="relative bg-[#FFF5EB] px-4 py-3 text-center border-y border-orange-200 shadow-inner">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F47B20] shrink-0" />
                <span className="font-heading font-black text-xs sm:text-sm md:text-base uppercase tracking-wider text-[#F47B20]">
                  « VALABLE UNIQUEMENT LE 18 OCTOBRE 2026 »
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-600 font-medium mt-0.5">
                Accès exclusif à la grande journée au Musée national de la RDC (Kinshasa)
              </p>
            </div>

            {/* Core Ticket Content & Perforated Section */}
            <div className="relative p-6 sm:p-8 bg-white">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left Column: Participant & Event Information */}
                <div className="md:col-span-7 space-y-4">
                  
                  {/* Participant Name */}
                  <div className="p-4 rounded-2xl bg-[#FFF5EB]/40 border border-orange-200/60 shadow-sm backdrop-blur-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F47B20] block mb-0.5">
                      Titulaire du Billet
                    </span>
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 tracking-tight">
                      {ticket.participant.firstName} {ticket.participant.lastName}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      {ticket.participant.email}
                    </p>
                    <p className="text-xs text-stone-500">
                      Tél: {ticket.participant.phone} • {ticket.participant.city}, {ticket.participant.country}
                    </p>
                  </div>

                  {/* Date & Location Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#F47B20] mb-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>DATE UNIQUE</span>
                      </div>
                      <p className="font-heading font-black text-sm text-stone-900">
                        18 OCTOBRE 2026
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">
                        08h30 - 18h30
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#168A45] mb-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>LIEU OFFICIEL</span>
                      </div>
                      <p className="font-heading font-black text-sm text-stone-900">
                        Musée national
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">
                        Kinshasa, RDC
                      </p>
                    </div>

                  </div>

                  {/* Ticket Serial & Security Token */}
                  <div className="p-3 rounded-2xl bg-[#FFF5EB] border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 block">
                        Identifiant Unique de Billet
                      </span>
                      <span className="font-mono font-black text-sm sm:text-base text-[#F47B20] tracking-wider">
                        {ticket.ticketId}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyId}
                      className="no-print p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 transition-colors border border-stone-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      title="Copier l'identifiant"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#168A45]" />
                          <span className="text-[#168A45]">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Right Column: Unique QR Code & Security Stamp */}
                <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                  
                  <div className="relative p-4 bg-white rounded-3xl border-2 border-orange-200 shadow-lg flex flex-col items-center max-w-[240px] w-full">
                    
                    {/* Corner Accent Ornaments */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#F47B20]" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#F47B20]" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#168A45]" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#168A45]" />

                    {qrDataUrl ? (
                      <div className="relative bg-white p-1">
                        <img
                          src={qrDataUrl}
                          alt={`QR Code Billet ${ticket.ticketId}`}
                          className="w-44 h-44 object-contain rounded-xl"
                        />
                        {/* Tiny Center Shield Logo */}
                        <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#F47B20] border-2 border-white flex items-center justify-center text-white shadow">
                          <span className="font-heading font-black text-[10px] text-white">JF</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-44 h-44 bg-stone-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-stone-400">
                        Génération QR Code...
                      </div>
                    )}

                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7F1] text-[#168A45] text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-[#168A45]" />
                        <span>BILLET VALIDE & SCANNABLE</span>
                      </span>
                    </div>

                    <p className="text-[9px] font-mono text-stone-400 mt-1">
                      Token: {ticket.qrToken?.substring(0, 14)}...
                    </p>
                  </div>

                  {/* Stamp Seal Simulation */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#F47B20]" />
                    <span>Contrôle d'accès Musée national</span>
                  </div>

                </div>

              </div>

              {/* Perforated Divider Line with Scissors / Notch */}
              <div className="relative my-6">
                <div className="border-t-2 border-dashed border-stone-300" />
                <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-stone-50 border-r-2 border-stone-300" />
                <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-stone-50 border-l-2 border-stone-300" />
              </div>

              {/* Included Advantages & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-2.5 rounded-xl bg-[#FFF5EB] border border-orange-200">
                  <span className="text-[9px] font-bold uppercase text-[#F47B20] block">Accès Musée</span>
                  <span className="text-[11px] font-semibold text-stone-700">Expositions & Galeries</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF5EB] border border-orange-200">
                  <span className="text-[9px] font-bold uppercase text-[#168A45] block">Conférences</span>
                  <span className="text-[11px] font-semibold text-stone-700">Panels, Remise de Brevets</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF5EB] border border-orange-200">
                  <span className="text-[9px] font-bold uppercase text-[#F47B20] block">
                    {isVip ? 'Privilèges VIP' : 'Espace Festival'}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-700">
                    {isVip ? 'Cocktail & Networking VIP' : 'Stands & Animation culturelle'}
                  </span>
                </div>
              </div>

              {/* Slogan Footer Strip */}
              <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-medium gap-2">
                <span className="font-heading font-bold text-[#F47B20]">
                  « Pesa tourisme ya mboka chance ! »
                </span>
                <span>Réf Commande : #{ticket.orderId.substring(0, 10)}</span>
                <span className="text-stone-400">© 2026 JAMBO Festival DRC</span>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Bottom Action Controls (Hidden on print) */}
        <div className="no-print px-6 py-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-600 font-medium">
            <span className="font-bold text-stone-900">Conseil :</span> Téléchargez le billet ou faites une capture pour l'avoir hors-ligne le jour de l'événement.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#F47B20] hover:bg-[#E06912] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération PDF...' : 'Télécharger PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#168A45] hover:bg-[#127038] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingImage ? 'Export Image...' : 'Télécharger Image (HD)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
