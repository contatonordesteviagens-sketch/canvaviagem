import React, { useState } from "react";
import { Download, Search } from "lucide-react";
import { downloadLinks, DownloadItem } from "@/data/downloads";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const renderSection = (title: string, items: DownloadItem[], icon: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-10 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground/90 border-b pb-2">
          <span>{icon}</span> {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <Card key={`${item.title}-${idx}`} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow border-primary/10">
              <h3 className="font-semibold text-sm mb-4 line-clamp-2" title={item.title}>
                {item.title}
              </h3>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-white" 
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 pt-[40px] md:pt-[60px] max-w-7xl animate-fade-in">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
            Central de Downloads
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Acesse rapidamente os links diretos do Google Drive para baixar os vídeos de todos os destinos disponíveis.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeTab === cat.id ? "default" : "outline"}
                onClick={() => setActiveTab(cat.id)}
                className="whitespace-nowrap rounded-full px-6"
              >
                {cat.icon} <span className="ml-2">{cat.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar destino..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/50"
            />
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-border/50">
            <h3 className="text-xl font-bold text-muted-foreground mb-2">Nenhum destino encontrado</h3>
            <p className="text-muted-foreground/70">Tente buscar com outras palavras.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderSection("Destinos Nacionais", nacionais, "🇧🇷")}
            {renderSection("Destinos Internacionais", internacionais, "✈️")}
            {renderSection("Extras & Dicas", extras, "💡")}
          </div>
        )}
      </main>
    </div>
  );
};

export default Downloads;
