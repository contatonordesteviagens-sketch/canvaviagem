import React, { useMemo, useState, useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Play,
  Youtube,
  PlayCircle,
  Trophy,
  Star
} from "lucide-react";

type TutorialVideo = {
  id: number;
  lesson: string;
  title: string;
  shortTitle: string;
  videoId: string;
  url: string;
  thumbnail: string;
  duration?: string;
};

// Organized classes based on user instructions and Canva Viagem content
export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: 1,
    lesson: "Aula 1",
    title: "AULA 1 - BOAS VINDAS AO CANVA VIAGEM",
    shortTitle: "Boas-vindas ao Canva Viagem",
    videoId: "ZNegTIt05i4",
    url: "https://www.youtube.com/watch?v=ZNegTIt05i4",
    thumbnail: "https://i3.ytimg.com/vi/ZNegTIt05i4/hqdefault.jpg",
    duration: "03:45",
  },
  {
    id: 2,
    lesson: "Aula 2",
    title: "AULA 2 - LOGIN APÓS A COMPRA CANVA VIAGEM",
    shortTitle: "Login após a compra",
    videoId: "Ris4PvVTYNM",
    url: "https://www.youtube.com/watch?v=Ris4PvVTYNM",
    thumbnail: "https://i3.ytimg.com/vi/Ris4PvVTYNM/hqdefault.jpg",
    duration: "05:12",
  },
  {
    id: 3,
    lesson: "Aula 3",
    title: "AULA 3 - OPÇÕES EXTRAS DE EDIÇÃO NO CANVA",
    shortTitle: "Opções extras de edição",
    videoId: "1VTN8gh65kM",
    url: "https://www.youtube.com/watch?v=1VTN8gh65kM",
    thumbnail: "https://i3.ytimg.com/vi/1VTN8gh65kM/hqdefault.jpg",
    duration: "08:30",
  },
  {
    id: 4,
    lesson: "Aula 4",
    title: "AULA 4 - OFERTAS E VÍDEOS PRONTOS CANVA VIAGEM",
    shortTitle: "Ofertas e vídeos prontos",
    videoId: "llybalfBjAo",
    url: "https://www.youtube.com/watch?v=llybalfBjAo",
    thumbnail: "https://i3.ytimg.com/vi/llybalfBjAo/hqdefault.jpg",
    duration: "06:15",
  },
  {
    id: 5,
    lesson: "Aula 5",
    title: "AULA 5 - ERRO VÍDEO REELS",
    shortTitle: "Corrigir erro em vídeo Reels",
    videoId: "T0SCGt35shE",
    url: "https://www.youtube.com/watch?v=T0SCGt35shE",
    thumbnail: "https://i3.ytimg.com/vi/T0SCGt35shE/hqdefault.jpg",
    duration: "04:20",
  },
  {
    id: 6,
    lesson: "Aula 6",
    title: "AULA 6 - FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL CANVA VIAGEM",
    shortTitle: "Inteligência Artificial",
    videoId: "i9B4sLFBlJc",
    url: "https://www.youtube.com/watch?v=i9B4sLFBlJc",
    thumbnail: "https://i3.ytimg.com/vi/i9B4sLFBlJc/hqdefault.jpg",
    duration: "07:10",
  },
  {
    id: 7,
    lesson: "Aula 7",
    title: "AULA 7 - COMO EDITAR VÍDEO REELS DE VIAGENS",
    shortTitle: "Editar Reels de viagens",
    videoId: "-AmTWng3q-Y",
    url: "https://www.youtube.com/watch?v=-AmTWng3q-Y",
    thumbnail: "https://i3.ytimg.com/vi/-AmTWng3q-Y/hqdefault.jpg",
    duration: "09:45",
  },
  {
    id: 8,
    lesson: "Aula 8",
    title: "AULA 8 - FÁBRICA DE DESTINOS",
    shortTitle: "Fábrica de Destinos",
    videoId: "Z8-aFoblDu0",
    url: "https://www.youtube.com/watch?v=Z8-aFoblDu0",
    thumbnail: "https://i3.ytimg.com/vi/Z8-aFoblDu0/hqdefault.jpg",
    duration: "05:55",
  },
];

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@CanvaViagem";
const INSTAGRAM_URL = "https://www.instagram.com/lucasferrari.pro/";

export const TutorialSection = () => {
  // Load saved progress from localStorage
  const getSavedProgress = () => {
    try {
      const saved = localStorage.getItem("cv_tutorial_progress");
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data?.index === "number" && data.index >= 0 && data.index < TUTORIAL_VIDEOS.length) {
          return { index: data.index, time: typeof data.time === "number" ? data.time : 0 };
        }
      }
    } catch (e) {
      console.error("Failed to load tutorial progress", e);
    }
    return { index: 0, time: 0 };
  };

  const [activeIndex, setActiveIndex] = useState(() => getSavedProgress().index);
  const [startTime, setStartTime] = useState(() => getSavedProgress().time);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayer>(null);

  // Save index when it changes, and reset playing state
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.stopVideo === 'function') {
          playerRef.current.stopVideo();
        }
      } catch (e) {}
    }
    setIsPlaying(false);

    const current = getSavedProgress();
    if (current.index !== activeIndex) {
      localStorage.setItem("cv_tutorial_progress", JSON.stringify({ index: activeIndex, time: 0 }));
      setStartTime(0);
    } else {
      setStartTime(current.time || 0);
    }
  }, [activeIndex]);

  // Ensure video stops and resets to cover when tab is hidden, window blurred, or component unmounts
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (playerRef.current) {
          try {
            if (typeof playerRef.current.stopVideo === 'function') {
              playerRef.current.stopVideo();
            }
          } catch (e) {}
        }
        setIsPlaying(false);
      }
    };

    const handleWindowBlur = () => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
        } catch (e) {}
      }
      setIsPlaying(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (e) {}
      }
      setIsPlaying(false);
    };
  }, []);

  // Periodically save timestamp while playing
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        if (time > 0) {
          localStorage.setItem("cv_tutorial_progress", JSON.stringify({ index: activeIndex, time }));
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);
  const activeVideo = TUTORIAL_VIDEOS[activeIndex];
  const nextVideo = TUTORIAL_VIDEOS[activeIndex + 1];

  const progress = useMemo(
    () => Math.round(((activeIndex) / TUTORIAL_VIDEOS.length) * 100),
    [activeIndex]
  );

  return (
    <section className="w-full flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group aspect-video">
            {!isPlaying ? (
              <div 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center relative overflow-hidden bg-slate-950"
              >
                <img 
                  src={activeVideo.thumbnail} 
                  alt={activeVideo.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="relative z-10 flex flex-col items-center gap-4 text-center p-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] group-hover:scale-110 group-hover:bg-cyan-400 transition-all duration-300 animate-pulse">
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-slate-950 ml-1.5" />
                  </div>
                  <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-xl">
                    <span className="text-xs sm:text-sm font-black text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      Clique para iniciar a aula {activeIndex + 1}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white max-w-xl leading-tight drop-shadow-md">
                    {activeVideo.title}
                  </h3>
                </div>
              </div>
            ) : (
              <YouTube
                key={activeVideo.videoId}
                videoId={activeVideo.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    start: startTime > 0 ? Math.floor(startTime) : 0,
                  },
                }}
                onReady={(e) => {
                  playerRef.current = e.target;
                }}
                onStateChange={(e) => {
                  // 0 = ended
                  if (e.data === 0) {
                    if (TUTORIAL_VIDEOS[activeIndex + 1]) {
                      const nextIdx = activeIndex + 1;
                      setActiveIndex(nextIdx);
                      setIsPlaying(false);
                      setStartTime(0);
                      localStorage.setItem("cv_tutorial_progress", JSON.stringify({ index: nextIdx, time: 0 }));
                    }
                  }
                }}
                className="absolute top-0 left-0 w-full h-full border-0"
                iframeClassName="w-full h-full border-0"
              />
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-[#0b1220] to-[#0d1627] border border-white/5 shadow-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                  {activeVideo.lesson}
                </span>
                {progress === 100 && (
                  <span className="flex items-center gap-1 px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-400 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                    <Trophy className="w-3 h-3" /> Curso Concluído
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeVideo.shortTitle}
              </h2>
              <p className="mt-2 text-slate-400 text-sm font-medium flex items-center gap-2">
                Canva Viagem Academia <Star className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (nextVideo) {
                    const nextIdx = activeIndex + 1;
                    setActiveIndex(nextIdx);
                    setIsPlaying(false);
                    setStartTime(0);
                    localStorage.setItem("cv_tutorial_progress", JSON.stringify({ index: nextIdx, time: 0 }));
                  }
                }}
                disabled={!nextVideo}
                className="relative group inline-flex items-center justify-center gap-3 px-8 py-4 text-sm sm:text-base font-black text-slate-900 bg-cyan-400 rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)] focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {nextVideo ? "Avançar para Próxima Aula" : "Trilha Concluída"}
                  {nextVideo ? <ArrowRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-[#0b1220] border border-white/5 shadow-lg flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-black text-white mb-1">Conteúdo do Curso</h3>
              <p className="text-sm text-slate-400 font-medium">Seu progresso atual</p>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-2.5 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{activeIndex} de {TUTORIAL_VIDEOS.length} aulas</span>
              <span className="text-cyan-400">{progress}% completo</span>
            </div>
          </div>

          <div className="flex-1 bg-[#0b1220] border border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col max-h-[600px]">
            <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {TUTORIAL_VIDEOS.map((video, index) => {
                const isActive = index === activeIndex;
                const isWatched = index < activeIndex;

                return (
                  <button
                    key={video.videoId}
                    onClick={() => {
                      setActiveIndex(index);
                      setIsPlaying(false);
                      const current = getSavedProgress();
                      const newTime = current.index === index ? (current.time || 0) : 0;
                      setStartTime(newTime);
                      localStorage.setItem("cv_tutorial_progress", JSON.stringify({ index, time: newTime }));
                    }}
                    className={`w-full text-left group relative p-3 rounded-xl transition-all duration-300 flex gap-4 ${
                      isActive
                        ? "bg-cyan-500/10 border border-cyan-500/30"
                        : "bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110 opacity-60' : 'group-hover:scale-110 opacity-80'}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/80 flex items-center justify-center backdrop-blur-sm animate-pulse">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        ) : isWatched ? (
                          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center min-w-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                        {video.lesson}
                      </span>
                      <h4 className={`text-sm font-bold truncate leading-tight ${isActive ? "text-white" : "text-slate-300"}`}>
                        {video.shortTitle}
                      </h4>
                      {video.duration && (
                        <span className="text-xs text-slate-500 mt-1 font-medium">
                          {video.duration}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Social Footer */}
      <footer className="mt-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#070c15] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-black text-white">Faça parte da nossa comunidade</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Siga o Canva Viagem nas redes sociais para receber dicas exclusivas, atualizações da plataforma e estratégias para vender mais.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(219,39,119,0.5)]"
          >
            <Instagram className="w-5 h-5" />
            Seguir no Instagram
          </a>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]"
          >
            <Youtube className="w-5 h-5" />
            Inscrever-se no Canal
          </a>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </section>
  );
};
