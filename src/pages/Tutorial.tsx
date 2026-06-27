import React from "react";
import { Link } from "react-router-dom";
import { PlayCircle, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

// Definindo a lista de aulas baseada nas solicitações do usuário
const TUTORIAL_VIDEOS = [
  {
    id: 1,
    title: "AULA 1 - BOAS VINDAS AO CANVA VIAGEM",
    duration: "0:31",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop", // Placeholder image
    videoUrl: "https://www.youtube.com/@CanvaViagem" // Placeholder URL
  },
  {
    id: 2,
    title: "AULA 2 - LOGIN APÓS A COMPRA CANVA VIAGEM",
    duration: "1:46",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  },
  {
    id: 3,
    title: "AULA 3 - COMO EDITAR VIDEO REELS DE VIAGENS NO CANVA VIAGEM",
    duration: "5:31",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  },
  {
    id: 4,
    title: "AULA 4 - OPÇÕES EXTRAS DE EDIÇÃO NO CANVA",
    duration: "6:12",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  },
  {
    id: 5,
    title: "AULA 5 - ERRO VIDEO REELS",
    duration: "0:58",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  },
  {
    id: 6,
    title: "AULA 6 - OFERTAS E VIDEOS PRONTOS CANVA VIAGEM",
    duration: "1:34",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  },
  {
    id: 7,
    title: "AULA 7 - FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL CANVA VIAGEM",
    duration: "3:00",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/@CanvaViagem"
  }
];

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Voltar ao Painel</span>
          </Link>
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Academia Canva Viagem
          </h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-10">
          <h2 className="text-3xl font-black mb-2">Primeiros Passos</h2>
          <p className="text-zinc-400">Assista aos tutoriais abaixo para dominar a plataforma de ponta a ponta.</p>
        </div>

        {/* VIDEOS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TUTORIAL_VIDEOS.map((video) => (
            <a 
              key={video.id} 
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md">
                  {video.duration}
                </div>
                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              {/* Video Info */}
              <div>
                <h3 className="font-semibold text-sm leading-tight text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Canva Viagem</p>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Tutorial;
