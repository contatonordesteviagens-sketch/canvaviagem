import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isBlackFridayOpen } from "@/components/checkout/checkout-plans";

/**
 * Telas de carregamento com o formato do conteúdo real (em vez de um spinner no meio da tela).
 * Usadas enquanto o código da página chega (troca de rota) e enquanto as permissões são conferidas.
 * Cada variante repete a largura, a altura e o fundo da página que ela substitui, para não haver salto de layout.
 */

type Tom = "claro" | "escuro";

const bloco = (tom: Tom) => (tom === "escuro" ? "bg-white/10" : "bg-black/10");

/** Funil de vendas (/black, /inicio, /black-friday, /planos): cabeçalho, título, botão e vitrine. */
export function FunilSkeleton({ tom = "claro" }: { tom?: Tom }) {
  const b = bloco(tom);
  return (
    <div className="min-h-[100dvh]" style={{ background: tom === "escuro" ? "#08080b" : "#fbf6e9" }} aria-busy="true" aria-label="Carregando">
      <div className="flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-5xl items-center justify-between px-3 py-2">
          <Skeleton className={cn("h-[26px] w-[26px] rounded-full", b)} />
          <Skeleton className={cn("h-9 w-28 rounded-full", b)} />
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 sm:pt-16">
        <Skeleton className={cn("h-5 w-44 rounded-full", b)} />
        <Skeleton className={cn("mt-5 h-10 w-full max-w-xl rounded-xl sm:h-14", b)} />
        <Skeleton className={cn("mt-2 h-10 w-4/5 max-w-lg rounded-xl sm:h-14", b)} />
        <Skeleton className={cn("mt-5 h-4 w-full max-w-md", b)} />
        <Skeleton className={cn("mt-2 h-4 w-3/4 max-w-sm", b)} />
        <Skeleton className={cn("mt-7 h-14 w-full max-w-sm rounded-full", b)} />
        <div className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className={cn("aspect-[4/5] w-full rounded-2xl", b)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Quiz (/onboarding): coluna de celular com barra de progresso, pergunta e respostas. */
export function QuizSkeleton({ tom = "claro" }: { tom?: Tom }) {
  const b = bloco(tom);
  return (
    <div className="min-h-[100dvh]" style={{ background: tom === "escuro" ? "#08080b" : "#fbf6e9" }} aria-busy="true" aria-label="Carregando">
      <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col px-5 pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className={cn("h-8 w-8 rounded-full", b)} />
          <Skeleton className={cn("h-2 flex-1 rounded-full", b)} />
        </div>
        <Skeleton className={cn("mt-10 h-8 w-11/12 rounded-lg", b)} />
        <Skeleton className={cn("mt-2 h-8 w-2/3 rounded-lg", b)} />
        <Skeleton className={cn("mt-4 h-4 w-4/5", b)} />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className={cn("h-16 w-full rounded-2xl", b)} />
          ))}
        </div>
        <Skeleton className={cn("mb-6 mt-auto h-14 w-full rounded-full", b)} />
      </div>
    </div>
  );
}

/** Pagamento (/checkout, /pix): voltar, duas formas de pagamento e o painel. */
export function CheckoutSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-white" aria-busy="true" aria-label="Carregando">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
        <Skeleton className="h-9 w-9 rounded-full bg-slate-200" />
        <Skeleton className="h-5 w-40 bg-slate-200" />
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-2xl bg-slate-200" />
          <Skeleton className="h-16 rounded-2xl bg-slate-200" />
        </div>
        <Skeleton className="mx-auto mt-6 h-[420px] max-w-2xl rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

/** Fábrica (/fabrica): barra do topo, título e os cartões das ferramentas. */
export function FabricaSkeleton() {
  const b = "bg-white/10";
  return (
    <div className="min-h-screen bg-[#0A0A0B]" aria-busy="true" aria-label="Carregando">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <Skeleton className={cn("h-7 w-36 rounded-lg", b)} />
        <div className="flex gap-2">
          <Skeleton className={cn("h-8 w-8 rounded-full", b)} />
          <Skeleton className={cn("h-8 w-8 rounded-full", b)} />
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Skeleton className={cn("h-8 w-64 rounded-lg", b)} />
        <Skeleton className={cn("mt-3 h-4 w-80 max-w-full", b)} />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={cn("h-40 rounded-2xl", b)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Biblioteca (página inicial do assinante): topo, busca e a grade de vídeos em 9:16. */
export function BibliotecaSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Carregando">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-9 w-40 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-5">
        <Skeleton className="h-11 w-full max-w-xl rounded-full" />
        <div className="mt-4 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-6 w-40" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Conteúdo de um painel (Gestão): cartões de número e uma tabela. Entra dentro da aba, sem ocupar a tela toda. */
export function PainelSkeleton({ cartoes = 4, linhas = 6 }: { cartoes?: number; linhas?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      {cartoes > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: cartoes }, (_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      )}
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: linhas }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Gestão (página inteira): título, abas e o conteúdo do painel. */
export function GestaoSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Carregando">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Skeleton className="h-8 w-56" />
        <div className="my-5 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-md" />
          ))}
        </div>
        <PainelSkeleton />
      </div>
    </div>
  );
}

/** Página de texto (blog, termos, conta e as demais): título, parágrafos e uma imagem. */
export function TextoSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Carregando">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/3" />
        <Skeleton className="mt-6 aspect-video w-full rounded-xl" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className={cn("h-4", i === 4 ? "w-2/3" : "w-full")} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Escolhe o esqueleto pelo endereço: o formato da tela que está para abrir. */
export function PageSkeleton({ pathname }: { pathname?: string }) {
  const path = (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/")).replace(/\/+$/, "") || "/";
  const black = isBlackFridayOpen();

  if (path === "/onboarding") return <QuizSkeleton tom={black ? "escuro" : "claro"} />;
  if (path === "/es/onboarding") return <QuizSkeleton tom="claro" />;
  if (path === "/black" || path === "/black-friday") return <FunilSkeleton tom="escuro" />;
  if (path === "/inicio" || path === "/inicio2") return <FunilSkeleton tom={black ? "escuro" : "claro"} />;
  if (path === "/planos" || path === "/es/inicio" || path === "/es/planos") return <FunilSkeleton />;
  if (path === "/checkout" || path === "/pix") return <CheckoutSkeleton />;
  if (path.startsWith("/fabrica") || path.startsWith("/es/fabrica") || path === "/vendedor-ia") return <FabricaSkeleton />;
  if (path.startsWith("/gestao") || path.startsWith("/admin")) return <GestaoSkeleton />;
  if (path === "/" || path === "/pt" || path === "/es" || path.endsWith("/calendar") || path.endsWith("/downloads")) return <BibliotecaSkeleton />;
  return <TextoSkeleton />;
}
