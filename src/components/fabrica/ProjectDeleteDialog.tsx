import { useEffect, useRef } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";

type ProjectDeleteDialogProps = {
  open: boolean;
  projectName: string;
  locale?: "pt" | "es";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ProjectDeleteDialog = ({
  open,
  projectName,
  locale = "pt",
  busy = false,
  onCancel,
  onConfirm,
}: ProjectDeleteDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(busy);
  const onCancelRef = useRef(onCancel);

  busyRef.current = busy;
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[tabindex]:not([tabindex="-1"])',
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
        eyebrow: "Eliminar proyecto",
        title: `¿Eliminar "${projectName}" definitivamente?`,
        body: "El proyecto y su sitio publicado vinculado desaparecerán de tu lista. Esta acción no se puede deshacer.",
        protected: "Los leads capturados se conservarán en el historial de tu cuenta.",
        cancel: "Conservar proyecto",
        confirm: "Eliminar definitivamente",
        busy: "Eliminando...",
      }
    : {
        eyebrow: "Excluir projeto",
        title: `Excluir "${projectName}" definitivamente?`,
        body: "O projeto e o site publicado vinculado serão removidos da sua lista. Esta ação não pode ser desfeita.",
        protected: "Os leads já capturados continuarão preservados no histórico da sua conta.",
        cancel: "Manter projeto",
        confirm: "Excluir definitivamente",
        busy: "Excluindo...",
      };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
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
        aria-labelledby="project-delete-title"
        aria-describedby="project-delete-description"
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-red-400/25 bg-[#111214] text-white shadow-2xl"
      >
        <div className="border-b border-white/10 bg-red-500/[0.06] p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-400">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mb-2 text-[11px] font-black uppercase text-red-400">
            {copy.eyebrow}
          </p>
          <h2 id="project-delete-title" className="text-xl font-black leading-tight sm:text-2xl">
            {copy.title}
          </h2>
          <p id="project-delete-description" className="mt-3 text-sm leading-6 text-white/70">
            {copy.body}
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3.5 text-sm leading-5 text-emerald-100">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{copy.protected}</span>
          </div>
        </div>
        <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 rounded-xl bg-red-500 px-4 text-sm font-black text-white transition-colors hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? copy.busy : copy.confirm}
          </button>
        </div>
      </section>
    </div>
  );
};
