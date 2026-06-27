import React, { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const TUTORIAL_VIDEOS = [
  {
    id: 1,
    title: "AULA 1 - BOAS VINDAS AO CANVA VIAGEM",
    duration: "0:31",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop", 
    videoId: "M7lc1UVf-VE" // Placeholder ID, o usuário vai enviar os corretos
  },
  {
    id: 2,
    title: "AULA 2 - LOGIN APÓS A COMPRA CANVA VIAGEM",
    duration: "1:46",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  },
  {
    id: 3,
    title: "AULA 3 - COMO EDITAR VIDEO REELS DE VIAGENS NO CANVA VIAGEM",
    duration: "5:31",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  },
  {
    id: 4,
    title: "AULA 4 - OPÇÕES EXTRAS DE EDIÇÃO NO CANVA",
    duration: "6:12",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  },
  {
    id: 5,
    title: "AULA 5 - ERRO VIDEO REELS",
    duration: "0:58",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  },
  {
    id: 6,
    title: "AULA 6 - OFERTAS E VIDEOS PRONTOS CANVA VIAGEM",
    duration: "1:34",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  },
  {
    id: 7,
    title: "AULA 7 - FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL CANVA VIAGEM",
    duration: "3:00",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    videoId: "M7lc1UVf-VE"
  }
];

export const TutorialSection = () => {
  const [activeVideo, setActiveVideo] = useState<typeof TUTORIAL_VIDEOS[0] | null>(null);

  return (
    <div className="w-full">
      {/* HEADER TÍTULO (Opcional caso já tenha o SectionHeader por fora, mas fica bonito aqui) */}
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2 text-white">Academia Canva Viagem</h2>
        <p className="text-zinc-400">Assista aos tutoriais abaixo e aprenda a dominar a plataforma passo a passo.</p>
      </div>

      {/* VIDEOS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TUTORIAL_VIDEOS.map((video) => (
          <div 
            key={video.id} 
            onClick={() => setActiveVideo(video)}
            className="group flex flex-col gap-3 cursor-pointer"
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
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
              <h3 className="font-semibold text-sm leading-tight text-zinc-100 group-hover:text-primary transition-colors line-clamp-2">
                {video.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Canva Viagem</p>
            </div>
          </div>
        ))}
      </div>

      {/* INLINE VIDEO MODAL PLAYER */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking the video itself
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* YouTube iFrame */}
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
