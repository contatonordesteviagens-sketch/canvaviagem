import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Play,
  Youtube,
} from "lucide-react";

type TutorialVideo = {
  id: number;
  title: string;
  shortTitle: string;
  lesson: string;
  videoId: string;
  url: string;
  thumbnail: string;
};

export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: 1,
    lesson: "Aula 1",
    title: "AULA 1 - BOAS VINDAS AO CANVA VIAGEM",
    shortTitle: "Boas-vindas ao Canva Viagem",
    videoId: "ZNegTIt05i4",
    url: "https://www.youtube.com/watch?v=ZNegTIt05i4",
    thumbnail: "https://i3.ytimg.com/vi/ZNegTIt05i4/hqdefault.jpg",
  },
  {
    id: 2,
    lesson: "Aula 2",
    title: "AULA 2 - LOGIN APOS A COMPRA CANVA VIAGEM",
    shortTitle: "Login apos a compra",
    videoId: "Ris4PvVTYNM",
    url: "https://www.youtube.com/watch?v=Ris4PvVTYNM",
    thumbnail: "https://i3.ytimg.com/vi/Ris4PvVTYNM/hqdefault.jpg",
  },
  {
    id: 3,
    lesson: "Aula 3",
    title: "AULA 3 - COMO EDITAR VIDEO REELS DE VIAGENS NO CANVA VIAGEM",
    shortTitle: "Editar Reels de viagens no Canva",
    videoId: "-AmTWng3q-Y",
    url: "https://www.youtube.com/watch?v=-AmTWng3q-Y",
    thumbnail: "https://i2.ytimg.com/vi/-AmTWng3q-Y/hqdefault.jpg",
  },
  {
    id: 4,
    lesson: "Aula 4",
    title: "AULA 4 - OPCOES EXTRAS DE EDICAO NO CANVA",
    shortTitle: "Opcoes extras de edicao",
    videoId: "1VTN8gh65kM",
    url: "https://www.youtube.com/watch?v=1VTN8gh65kM",
    thumbnail: "https://i2.ytimg.com/vi/1VTN8gh65kM/hqdefault.jpg",
  },
  {
    id: 5,
    lesson: "Aula 5",
    title: "AULA 5 - OFERTAS E VIDEOS PRONTOS CANVA VIAGEM",
    shortTitle: "Ofertas e videos prontos",
    videoId: "llybalfBjAo",
    url: "https://www.youtube.com/watch?v=llybalfBjAo",
    thumbnail: "https://i1.ytimg.com/vi/llybalfBjAo/hqdefault.jpg",
  },
  {
    id: 6,
    lesson: "Aula 6",
    title: "AULA 6 - ERRO VIDEO REELS",
    shortTitle: "Corrigir erro em video Reels",
    videoId: "T0SCGt35shE",
    url: "https://www.youtube.com/watch?v=T0SCGt35shE",
    thumbnail: "https://i1.ytimg.com/vi/T0SCGt35shE/hqdefault.jpg",
  },
  {
    id: 7,
    lesson: "Aula 7",
    title: "AULA 7 - FERRAMENTAS DE INTELIGENCIA ARTIFICIAL CANVA VIAGEM",
    shortTitle: "Ferramentas de inteligencia artificial",
    videoId: "i9B4sLFBlJc",
    url: "https://www.youtube.com/watch?v=i9B4sLFBlJc",
    thumbnail: "https://i2.ytimg.com/vi/i9B4sLFBlJc/hqdefault.jpg",
  },
  {
    id: 8,
    lesson: "Aula 8",
    title: "AULA 8 - FABRICA DE DESTINOS",
    shortTitle: "Fabrica de Destinos",
    videoId: "Z8-aFoblDu0",
    url: "https://www.youtube.com/watch?v=Z8-aFoblDu0",
    thumbnail: "https://i3.ytimg.com/vi/Z8-aFoblDu0/hqdefault.jpg",
  },
];

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@CanvaViagem";
const INSTAGRAM_URL = "https://www.instagram.com/lucasferrari.pro/";

export const TutorialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = TUTORIAL_VIDEOS[activeIndex];
  const nextVideo = TUTORIAL_VIDEOS[activeIndex + 1];

  const progress = useMemo(
    () => Math.round(((activeIndex + 1) / TUTORIAL_VIDEOS.length) * 100),
    [activeIndex],
  );

  return (
    <section className="w-full space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#070b12] shadow-2xl shadow-black/30">
        <div className="grid min-h-[640px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col">
            <div className="flex flex-col gap-5 border-b border-white/10 bg-[#0b1220] px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                    Area de membros
                  </div>
                  <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                    Academia Canva Viagem
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Assista na ordem, aplique dentro da plataforma e avance para a proxima aula quando terminar.
                  </p>
                </div>

                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-300 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
                <div className="aspect-video w-full">
                  <iframe
                    key={activeVideo.videoId}
                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=0&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {activeVideo.lesson}
                  </div>
                  <h3 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
                    {activeVideo.shortTitle}
                  </h3>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-200"
                  >
                    Abrir no YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => nextVideo && setActiveIndex(activeIndex + 1)}
                  disabled={!nextVideo}
                  className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition-all hover:-translate-y-0.5 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#070b12] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {nextVideo ? "Avancar para a proxima aula" : "Curso concluido"}
                  {nextVideo ? <ArrowRight className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[#0a101b] xl:border-l xl:border-t-0">
            <div className="border-b border-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Trilha completa</p>
              <p className="mt-1 text-sm text-slate-300">{TUTORIAL_VIDEOS.length} aulas organizadas do canal oficial.</p>
            </div>

            <div className="max-h-[680px] space-y-2 overflow-y-auto p-3">
              {TUTORIAL_VIDEOS.map((video, index) => {
                const isActive = index === activeIndex;
                const isWatched = index < activeIndex;

                return (
                  <button
                    key={video.videoId}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group grid w-full grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-2xl border p-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                      isActive
                        ? "border-cyan-300/60 bg-cyan-300/10"
                        : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        {isWatched ? (
                          <CheckCircle2 className="h-7 w-7 text-cyan-200" />
                        ) : (
                          <Play className="h-7 w-7 fill-white text-white" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 py-1">
                      <div className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-cyan-200" : "text-slate-500"}`}>
                        {video.lesson}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white">
                        {video.shortTitle}
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-500">
                        Canva Viagem
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>

      <footer className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[#0b1220] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-white">Continue acompanhando o Canva Viagem</p>
          <p className="mt-1 text-sm text-slate-400">Novas aulas, melhorias da plataforma e conteudos para vender mais viagens.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/[0.08]"
          >
            <Instagram className="h-5 w-5" />
            Seguir no Instagram
          </a>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-100"
          >
            <Youtube className="h-5 w-5" />
            Inscrever-se no YouTube
          </a>
        </div>
      </footer>
    </section>
  );
};
