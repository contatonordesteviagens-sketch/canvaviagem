import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Bot, Clapperboard, Download, FolderOpen, Globe, Home, ImageIcon, LayoutGrid, Layers, Menu, MessageSquareText, Moon, Package, Play,
  Sparkles, Sun, UserRound, Users, X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import "@/styles/fabrica-tema-claro.css";
import "./fabrica-nova.css";
import { AvisoPlanoCompleto } from "./AvisoPlanoCompleto";

// PROTÓTIPO (só localhost): um menu só para o sistema inteiro (Início novo, portal, Fábrica, Vendedor IA),
// com um botão de tema que vale para todas as telas. Aparece quando a pessoa entrou pelo Início novo.

const AMARELO = "#F5F906";
export { CHAVE_INICIO_NOVO, usaMenuNovo } from "./menu-novo-flag";

// ——— tema único: claro ou escuro, salvo no aparelho, igual em todas as telas ———
const lerClaro = () => { try { return localStorage.getItem("cv-fabrica-tema") === "claro"; } catch { return false; } };
let claroAtual = lerClaro();
const ouvintes = new Set<() => void>();
const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
function mudarTema(claro: boolean) {
  claroAtual = claro;
  try { localStorage.setItem("cv-fabrica-tema", claro ? "claro" : "escuro"); } catch { /* sem storage */ }
  ouvintes.forEach((f) => f());
}

export function useTemaNovo() {
  const claro = useSyncExternalStore(assinar, () => claroAtual);
  const { setTheme } = useTheme();
  const { pathname } = useLocation();
  // reaplica a cada troca de tela: a Fábrica tira a classe quando fecha
  useEffect(() => {
    // a troca de cores do tema claro só vale nas telas da Fábrica (feitas escuras); o portal já tem o próprio claro
    const telaDaFabrica = pathname.startsWith("/fabrica") || pathname.startsWith("/dev/");
    document.documentElement.classList.toggle("fabrica-claro", claro && telaDaFabrica);
    setTheme(claro ? "light" : "dark");
  }, [claro, pathname, setTheme]);
  return { claro, alternar: () => mudarTema(!claroAtual) };
}

type Item = { nome: string; icone: typeof Home; para: string; categoria?: string; novo?: boolean };
const GRUPOS: { titulo: string; itens: Item[] }[] = [
  { titulo: "", itens: [{ nome: "Início", icone: Home, para: "/dev/fabrica-nova" }] },
  { titulo: "Criar", itens: [
    { nome: "Gerador de vídeo", icone: Clapperboard, para: "/dev/fabrica-nova?criar=video", novo: true },
    { nome: "Anúncio", icone: ImageIcon, para: "/dev/fabrica-nova?criar=arte" },
    { nome: "Carrossel", icone: Layers, para: "/fabrica/carrossel" },
    { nome: "Site", icone: Globe, para: "/fabrica/site" },
  ] },
  { titulo: "Clientes", itens: [
    { nome: "CRM", icone: Users, para: "/fabrica/crm" },
    { nome: "Vendedor IA", icone: Bot, para: "/vendedor-ia" },
    { nome: "Meus Pacotes", icone: Package, para: "/fabrica/planos" },
  ] },
  { titulo: "Conteúdo pronto", itens: [
    { nome: "Vídeos Reels", icone: Play, para: "/", categoria: "videos" },
    { nome: "Feed & Stories", icone: LayoutGrid, para: "/", categoria: "feed" },
    { nome: "Ofertas & Legendas", icone: MessageSquareText, para: "/", categoria: "offers" },
    { nome: "Pacotes de Vídeos & Drive", icone: FolderOpen, para: "/", categoria: "downloads" },
    { nome: "Central de Downloads", icone: Download, para: "/downloads" },
    { nome: "Ferramentas de IA", icone: Sparkles, para: "/", categoria: "tools" },
  ] },
  { titulo: "Você", itens: [
    { nome: "Meus conteúdos", icone: FolderOpen, para: "/fabrica/biblioteca" },
    { nome: "Dados do Perfil", icone: UserRound, para: "/fabrica" },
  ] },
];

function useAtivo() {
  const { pathname, search, state } = useLocation();
  const categoria = (state as { category?: string } | null)?.category;
  return (it: Item) => {
    if (it.categoria) return pathname === "/" && categoria === it.categoria;
    if (it.para === "/dev/fabrica-nova") return pathname.startsWith("/dev/fabrica-nova") && !/criar=|arte=|video=/.test(search);
    if (it.para.endsWith("criar=arte")) return pathname.startsWith("/dev/fabrica-nova") && /criar=arte|arte=/.test(search);
    if (it.para.includes("?")) return pathname + search === it.para;
    return pathname === it.para;
  };
}

function Lista({ aoTocar }: { aoTocar?: () => void }) {
  const navigate = useNavigate();
  const ativo = useAtivo();
  return (
    <>
      {GRUPOS.map((g) => (
        <div key={g.titulo || "inicio"} className="mb-2">
          {g.titulo && <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-white/35">{g.titulo}</div>}
          {g.itens.map((it) => {
            const on = ativo(it);
            return (
              <button
                key={it.nome}
                data-menu-item={it.nome}
                onClick={() => { aoTocar?.(); navigate(it.para, it.categoria ? { state: { category: it.categoria } } : undefined); }}
                className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13.5px] font-semibold ${on ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5"}`}
              >
                <it.icone className="h-4 w-4 shrink-0" style={on ? { color: "var(--cv-acento-texto, #F5F906)" } : undefined} />
                <span className="truncate">{it.nome}</span>
                {it.novo && <span className="ml-auto rounded-full px-1.5 text-[9px] font-black text-black" style={{ background: AMARELO }}>NOVO</span>}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}

function BotaoTema({ compacto = false }: { compacto?: boolean }) {
  const tema = useTemaNovo();
  if (compacto) {
    return (
      <button id="trocar-tema-celular" aria-label={tema.claro ? "Mudar para o tema escuro" : "Mudar para o tema claro"} onClick={tema.alternar} className="grid h-11 w-11 place-items-center rounded-full border border-white/10">
        {tema.claro ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
    );
  }
  return (
    <button id="trocar-tema" onClick={tema.alternar} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-white/65 hover:bg-white/5">
      {tema.claro ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}{tema.claro ? "Tema escuro" : "Tema claro"}
    </button>
  );
}

/** Voltar e avançar do navegador, sempre à mão. */
function VoltarAvancar() {
  const navigate = useNavigate();
  return (
    <div className="flex gap-1">
      <button data-voltar aria-label="Voltar" title="Voltar" onClick={() => navigate(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></button>
      <button data-avancar aria-label="Avançar" title="Avançar" onClick={() => navigate(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:bg-white/5"><ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}

/** Menu lateral (computador) e barra de baixo + menu cheio (celular). */
export function MenuNovo() {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const { pathname, search } = useLocation();
  // no celular, as telas do Início novo já têm o próprio Voltar; nas outras aparece este
  const voltarFlutuante = !(pathname.startsWith("/dev/fabrica-nova") && search !== "") && pathname !== "/dev/fabrica-nova";
  useTemaNovo();
  return (
    <>
      <aside data-menu-novo className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-white/10 bg-[#141416] p-3 text-white lg:flex">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 pt-1">
          <button onClick={() => navigate("/dev/fabrica-nova")} className="px-2 text-left text-[15px] font-black tracking-tight">Canva Viagem</button>
          <VoltarAvancar />
        </div>
        <Lista />
        <div className="mt-auto pt-2"><BotaoTema /></div>
      </aside>

      <AvisoPlanoCompleto />
      {voltarFlutuante && (
        <div data-voltar-celular-barra className="flex px-3 pt-3 lg:hidden"><button data-voltar-celular aria-label="Voltar" onClick={() => navigate(-1)} className="flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[13px] font-bold text-white">
          <ArrowLeft className="h-4 w-4" />Voltar
        </button></div>
      )}
      <nav data-barra-novo className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-[#0A0A0B]/95 text-white backdrop-blur lg:hidden">
        {[
          { n: "Início", i: Home, ir: () => navigate("/dev/fabrica-nova") },
          { n: "Vídeo", i: Clapperboard, ir: () => navigate("/dev/fabrica-nova?criar=video") },
          { n: "Anúncio", i: ImageIcon, ir: () => navigate("/dev/fabrica-nova?criar=arte") },
          { n: "Prontos", i: Play, ir: () => navigate("/", { state: { category: "videos" } }) },
          { n: "Menu", i: Menu, ir: () => setAberto(true) },
        ].map((b) => (
          <button key={b.n} onClick={b.ir} className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-white/60">
            <b.i className="h-5 w-5" /> {b.n}
          </button>
        ))}
      </nav>

      {aberto && (
        <div data-menu-cheio className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0A0B] p-4 text-white lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-black">Canva Viagem</div>
            <div className="flex gap-2">
              <BotaoTema compacto />
              <button aria-label="Fechar o menu" onClick={() => setAberto(false)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <Lista aoTocar={() => setAberto(false)} />
        </div>
      )}
    </>
  );
}

export { BotaoTema };
