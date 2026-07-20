import React, { useState } from "react";
import { Download, Search, Sparkles, Video, ExternalLink, Globe } from "lucide-react";
import { downloadLinks, DownloadItem } from "@/data/downloads";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todos os Destinos", icon: "🌍" },
    { id: "nacionais", label: "Nacionais", icon: "🇧🇷" },
    { id: "internacionais", label: "Internacionais", icon: "✈️" },
    { id: "extras", label: "Extras & Dicas", icon: "💡" },
  ];

  const filteredLinks = downloadLinks.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const nacionais = filteredLinks.filter(l => l.category === 'nacionais');
  const internacionais = filteredLinks.filter(l => l.category === 'internacionais');
  const extras = filteredLinks.filter(l => l.category === 'extras');

  const renderSection = (title: string, items: DownloadItem[], icon: string, badgeColor: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-12 animate-fade-in">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-6">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-foreground">
            <span className="text-2xl">{icon}</span> {title}
          </h2>
          <Badge variant="outline" className={`font-extrabold px-3 py-1 ${badgeColor}`}>
            {items.length} vídeo{items.length > 1 ? 's' : ''} prontos
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <Card 
              key={`${item.title}-${idx}`} 
              className="p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <Video className="w-3 h-3" /> MP4 / Drive
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-sm mb-4 line-clamp-2 text-slate-800 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={item.title}>
                  {item.title}
                </h3>
              </div>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all group-hover:shadow-blue-500/20" 
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              >
                <Download className="w-4 h-4" />
                Baixar Vídeo Direto
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090C] pb-24">
      <Header />

      <main className="container mx-auto px-4 pt-[40px] md:pt-[60px] max-w-7xl animate-fade-in">
        <div className="mb-10 text-center md:text-left bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 p-6 md:p-8 rounded-3xl border border-blue-500/20 shadow-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Recursos IA & Downloads Diretos
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 mb-4 tracking-tight">
            Central de Downloads Diretos
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed">
            Acesse e baixe rapidamente os vídeos individuais e enfileirados direto do Google Drive com apenas 1 clique. Clique em qualquer destino abaixo para abrir o arquivo de vídeo MP4 pronto.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeTab === cat.id ? "default" : "outline"}
                onClick={() => setActiveTab(cat.id)}
                className={`whitespace-nowrap rounded-xl px-5 font-bold transition-all ${
                  activeTab === cat.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25" 
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-blue-500/40"
                }`}
              >
                <span>{cat.icon}</span> <span className="ml-2">{cat.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar destino (ex: Alter do Chão...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 shadow-sm font-medium"
            />
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400">Tente buscar com outras palavras no campo de pesquisa acima.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSection("Destinos Nacionais", nacionais, "🇧🇷", "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}
            {renderSection("Destinos Internacionais", internacionais, "✈️", "bg-blue-500/10 text-blue-600 border-blue-500/20")}
            {renderSection("Extras & Dicas", extras, "💡", "bg-amber-500/10 text-amber-600 border-amber-500/20")}
          </div>
        )}
      </main>
    </div>
  );
};

export default Downloads;
