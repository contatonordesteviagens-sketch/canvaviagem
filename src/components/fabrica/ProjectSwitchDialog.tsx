import { useEffect, useRef } from "react";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";

type ProjectSwitchDialogProps = {
  open: boolean;
  currentName: string;
  targetName: string;
  locale?: "pt" | "es";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ProjectSwitchDialog = ({
  open,
  currentName,
  targetName,
  locale = "pt",
  busy = false,
  onCancel,
  onConfirm,
}: ProjectSwitchDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(busy);
  const cancelRef = useRef(onCancel);

  busyRef.current = busy;
  cancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => confirmRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        cancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [open]);

  if (!open) return null;

  const copy = locale === "es"
    ? {
        eyebrow: "Cambio de proyecto",
        title: `¿Abrir “${targetName}”?`,
        body: `Vas a salir de “${currentName}”. Canva Viaje guarda automáticamente tus cambios antes de cargar el otro proyecto.`,
        saved: "Tu proyecto actual permanece guardado y podrás volver a él cuando quieras.",
        cancel: "Seguir editando",
        confirm: "Cambiar proyecto",
      }
    : {
        eyebrow: "Troca de projeto",
        title: `Abrir “${targetName}”?`,
        body: `Você vai sair de “${currentName}”. O Canva Viagem salva automaticamente suas alterações antes de carregar o outro projeto.`,
        saved: "Seu projeto atual continuará salvo e poderá ser reaberto quando quiser.",
        cancel: "Continuar editando",
        confirm: "Trocar de projeto",
      };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-busy={busy}
        aria-labelledby="project-switch-title"
        aria-describedby="project-switch-description"
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#111214] text-white shadow-2xl"
      >
        <div className="border-b border-white/10 bg-gradient-to-br from-[#F5F906]/10 to-transparent p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F5F906]/35 bg-[#F5F906]/10 text-[#F5F906]">
            <ArrowRightLeft className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#F5F906]">
            {copy.eyebrow}
          </p>
          <h2 id="project-switch-title" className="text-xl font-black leading-tight sm:text-2xl">
            {copy.title}
          </h2>
          <p id="project-switch-description" className="mt-3 text-sm leading-6 text-white/70">
            {copy.body}
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3.5 text-sm leading-5 text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{copy.saved}</span>
          </div>
        </div>
        <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.cancel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 rounded-xl bg-[#F5F906] px-4 text-sm font-black text-black transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F906] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? (locale === "es" ? "Guardando y cambiando…" : "Salvando e trocando…") : copy.confirm}
          </button>
        </div>
      </section>
    </div>
  );
};
