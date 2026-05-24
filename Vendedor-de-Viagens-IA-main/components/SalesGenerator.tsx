
import React, { useState, useRef, useEffect } from 'react';
import { Message, GeneratedOption, UserProfile } from '../types';
import { generateChatResponse } from '../services/gemini';
import { ChatInput, RayBackground } from './BoltChat';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Sparkles, Zap, Brain, MessageSquare, ShieldCheck, Lightbulb, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
  userProfile?: UserProfile | null;
  darkMode: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  userProfile,
  darkMode
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const speak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (speakingId === id) {
          setSpeakingId(null);
          return;
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Infelizmente seu navegador não suporta leitura em voz alta.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-[#0f0f0f]">
      <RayBackground />
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin relative z-10">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-32 pt-4 sm:pt-8">
          
          <AnimatePresence initial={false}>
            {messages.map((msg, msgIdx) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "w-full max-w-[90%] sm:max-w-[85%] flex flex-col gap-2",
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}>
                  
                    <div className={cn(
                      "relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-lg group/msg",
                      msg.role === 'user' 
                        ? 'bg-[#1488fc] text-white rounded-tr-none' 
                        : 'bg-[#1e1e22] text-[#e0e0e0] border border-white/[0.08] rounded-tl-none'
                    )}>
                      {/* Render content explicitly */}
                      <div className="flex flex-col gap-2">
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                        {msg.role === 'model' && msg.error && (
                          <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium leading-relaxed">
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="size-3" />
                              <span className="uppercase tracking-widest font-black text-[9px]">Erro do Mentor</span>
                            </div>
                            {msg.content}
                          </div>
                        )}
                      </div>
                
                      {msg.role === 'model' && !msg.error && (
                        <div className="flex justify-end mt-2 pt-2 border-t border-white/[0.05]">
                          <button 
                            onClick={() => speak(msg.content, msg.id)}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-all",
                              speakingId === msg.id ? "text-blue-400" : "text-[#5a5a5f]"
                            )}
                          >
                            <Volume2 className={cn("size-3.5", speakingId === msg.id && "animate-pulse")} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Ouvir</span>
                          </button>
                        </div>
                      )}
                    </div>

                  {msg.options && (
                    <div className="w-full mt-4 space-y-6">
                      {msg.options.map((option, idx) => {
                        const optionId = `${msg.id}-opt-${idx}`;
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-2xl bg-[#1a1a1e]/80 backdrop-blur-md border border-white/[0.08] overflow-hidden shadow-2xl"
                          >
                            <div className="px-5 py-3 flex items-center justify-between bg-white/[0.03] border-b border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <Zap className="size-3 text-blue-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{option.technique}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => speak(option.content, optionId)}
                                  className={cn(
                                    "p-1.5 rounded-full hover:bg-white/5 transition-colors",
                                    speakingId === optionId ? "text-blue-400" : "text-[#8a8a8f]"
                                  )}
                                  title="Ouvir script"
                                >
                                  <Volume2 className={cn("size-4", speakingId === optionId && "animate-pulse")} />
                                </button>
                                <button 
                                  onClick={() => copyToClipboard(option.content, optionId)}
                                  className="p-1.5 text-[#8a8a8f] hover:text-white transition-colors"
                                >
                                  {copiedId === optionId ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="p-4 sm:p-5">
                              <p className="text-[15px] sm:text-[16px] font-medium leading-relaxed text-white mb-4 sm:mb-6 whitespace-pre-wrap">
                                {option.content}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Brain className="size-3.5 text-blue-400" />
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Estratégia</h4>
                                  </div>
                                  <p className="text-[12px] leading-relaxed text-[#a0a0a5]">{option.methodology}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="size-3.5 text-purple-400" />
                                    <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gatilho</h4>
                                  </div>
                                  <p className="text-[12px] leading-relaxed text-[#a0a0a5]">{option.psychologyTip}</p>
                                </div>
                              </div>

                              {option.branches && (
                                <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-3">
                                  <button 
                                    onClick={() => copyToClipboard(option.branches!.positive, `${optionId}-pos`)}
                                    className="flex flex-col gap-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors text-left group"
                                  >
                                    <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Se aceitar</span>
                                    <span className="text-[11px] text-emerald-400 truncate group-hover:whitespace-normal">{option.branches.positive}</span>
                                  </button>
                                  <button 
                                    onClick={() => copyToClipboard(option.branches!.negative, `${optionId}-neg`)}
                                    className="flex flex-col gap-1 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors text-left group"
                                  >
                                    <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">Se negar</span>
                                    <span className="text-[11px] text-red-400 truncate group-hover:whitespace-normal">{option.branches.negative}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex gap-2 items-center p-4 bg-[#1e1e22] border border-white/[0.08] rounded-2xl w-fit animate-pulse">
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[12px] text-[#8a8a8f] ml-2">Mentor analisando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/90 to-transparent">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={onSendMessage} isLoading={isLoading} placeholder="Como o cliente respondeu?" />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
