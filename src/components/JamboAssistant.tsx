import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Compass, 
  Calendar, 
  Ticket, 
  Trees, 
  GraduationCap, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { AssistantMessage } from '../types';

interface JamboAssistantProps {
  onOpenTicketing?: (type?: 'STANDARD' | 'VIP') => void;
  onOpenHike?: () => void;
  onOpenTraining?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const JamboAssistant: React.FC<JamboAssistantProps> = ({
  onOpenTicketing,
  onOpenHike,
  onOpenTraining,
  onNavigateSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Mbote & Jambo ! Je suis l'Assistant Officiel de JAMBO Festival 2026. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'interroger sur le programme des 18 & 24 octobre, les billets, les formations ou la randonnée à Amani Eco-Park.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const quickPrompts = [
    { label: 'Billetterie 18 Octobre', query: 'Quels sont les prix et modalités des billets pour le 18 octobre ?' },
    { label: 'Randonnée 24 Octobre', query: 'Comment participer à la grande randonnée du 24 octobre à Amani Eco-Park ?' },
    { label: 'Formations Métiers', query: 'Quelles sont les formations proposées et comment postuler ?' },
    { label: 'Dates & Lieux', query: 'Quelles sont les deux dates et où se déroulent les activités ?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Call backend API /api/assistant
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const assistantMsg: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Je suis à votre disposition pour toute information sur JAMBO Festival 2026.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Local fallback response
      let fallbackText = "JAMBO FESTIVAL 2026 (3e édition) se tiendra les 18 et 24 octobre 2026 à Kinshasa. Le 18 octobre est la journée professionnelle au Musée national (Billets Standard 15 USD, VIP 25 USD). Le 24 octobre est la grande randonnée à Amani Eco-Park (Mitendi).";
      
      const qLower = query.toLowerCase();
      if (qLower.includes('billet') || qLower.includes('prix') || qLower.includes('tarif')) {
        fallbackText = "Pour la journée du 18 octobre au Musée national de la RDC, deux formules sont disponibles : Billet Standard à 15 USD et Billet VIP à 25 USD. Attention : ces billets sont valables UNIQUEMENT le 18 octobre 2026.";
      } else if (qLower.includes('randonn') || qLower.includes('amani') || qLower.includes('24 oct')) {
        fallbackText = "La Grande Randonnée Touristique aura lieu le 24 octobre 2026 à Amani Eco-Park (Mitendi). Elle est distincte du 18 octobre. Vous pouvez dès à présent pré-réserver votre participation sur le site.";
      } else if (qLower.includes('formation') || qLower.includes('hôtess') || qLower.includes('guide')) {
        fallbackText = "JAMBO Festival organise des formations professionnelles certifiantes : Hôtesse d'événement, Guide touristique et Accueil/Protocole. Les inscriptions sont ouvertes via notre formulaire en ligne.";
      }

      const assistantMsg: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print">
      
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative px-4 py-3.5 rounded-full bg-gradient-to-r from-[#0A8296] via-[#0284C7] to-[#083344] text-white shadow-2xl hover:shadow-cyan-500/30 transition-all transform hover:scale-105 flex items-center gap-3 border border-cyan-300/40 cursor-pointer"
          id="btn-open-assistant"
          aria-label="Ouvrir l'Assistant JAMBO"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-white animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-none">Assistant JAMBO</p>
            <p className="text-[10px] text-cyan-200 leading-tight">Une question ? Parlons-en !</p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-3xl shadow-2xl border border-[#E2D9CC] flex flex-col overflow-hidden transition-all duration-300 ${
          isMinimized 
            ? 'w-80 h-16' 
            : 'w-[92vw] sm:w-96 md:w-[420px] h-[580px] max-h-[85vh]'
        }`}>
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-[#083344] via-[#0d4f68] to-[#0A8296] text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-amber-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Assistant JAMBO 2026</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </h3>
                <p className="text-[10px] text-cyan-200">Guide officiel de l'événement</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Prompts Bar */}
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-stone-200 flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.query)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#0A8296] hover:text-white text-stone-600 text-[10px] font-semibold border border-[#E8DFC8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/60 text-xs">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#0A8296] text-white rounded-br-none'
                            : 'bg-white text-[#083344] border border-[#E8DFC8] rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#E8DFC8] max-w-[70%]">
                    <div className="w-2 h-2 rounded-full bg-[#0A8296] animate-ping" />
                    <span className="text-[11px] text-stone-500 font-medium">
                      L'Assistant recherche l'information...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Posez votre question sur le festival..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#0A8296]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-[#0A8296] hover:bg-[#086f80] text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
                  aria-label="Envoyer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>
      )}

    </div>
  );
};
