
import React, { useState } from 'react';
import { SALES_TEMPLATES } from '../data/templates';
import { Copy, Check, BookOpen, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TemplateLibraryProps {
  darkMode: boolean;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState(SALES_TEMPLATES[0].id);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const activeCategory = SALES_TEMPLATES.find(c => c.id === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Categories Navigation */}
      <div className="flex-shrink-0 border-b border-white/[0.05] bg-[#111114]/50 backdrop-blur-md px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar flex gap-2">
        {SALES_TEMPLATES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
              selectedCategory === category.id
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                : "bg-white/5 text-[#8a8a8f] border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {category.title.split('. ')[1] || category.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 sm:size-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <BookOpen className="size-4 sm:size-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  {activeCategory?.title.split('. ')[1] || activeCategory?.title}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest">Scripts de Alta Conversão</p>
              </div>
            </div>
          </header>

          <div className="grid gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {activeCategory?.scripts.map((script, idx) => {
                const uniqueId = `${activeCategory.id}-${idx}`;
                return (
                  <motion.div 
                    key={uniqueId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all shadow-xl"
                  >
                    <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-3 text-blue-400" />
                        <h3 className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest">{script.title}</h3>
                      </div>
                      <button
                        onClick={() => handleCopy(script.content, uniqueId)}
                        className={cn(
                          "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                          copiedIndex === uniqueId
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-white/5 text-[#8a8a8f] border-white/10 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {copiedIndex === uniqueId ? (
                          <>
                            <Check className="size-3" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="relative">
                        <div className="absolute -left-3 sm:-left-4 top-0 bottom-0 w-1 bg-blue-600/30 rounded-full" />
                        <p className="text-xs sm:text-sm font-medium leading-relaxed text-white/90 whitespace-pre-wrap pl-2">
                          {script.content}
                        </p>
                      </div>

                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-start">
                        <div className="size-7 sm:size-8 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                          <Brain className="size-3.5 sm:size-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-[11px] leading-relaxed font-medium text-[#8a8a8f] italic">
                            {script.learning}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
