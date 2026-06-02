import { useFabricaContext } from "@/hooks/useFabricaContext";
import { Cloud, CloudOff, Loader2, CheckCircle2 } from "lucide-react";

export const CloudSaveIndicatorES = () => {
  const { syncStatus, lastSyncedAt } = useFabricaContext();

  const time = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  let icon = <Cloud className="w-3.5 h-3.5 opacity-50" />;
  let label = time ? `Nube · ${time}` : "Sincronizando…";
  let cls = "bg-white/5 text-white/40 border-white/10";

  if (syncStatus === "saving") {
    icon = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    label = "Guardando en la nube…";
    cls = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
  } else if (syncStatus === "saved") {
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    label = time ? `Guardado en la nube · ${time}` : "Guardado en la nube";
    cls = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  } else if (syncStatus === "error") {
    icon = <CloudOff className="w-3.5 h-3.5" />;
    label = "Error al guardar — reintentando";
    cls = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
  }

  return (
    <div
      title={lastSyncedAt ? `Última confirmación del servidor: ${lastSyncedAt.toLocaleString("es-ES")}` : "Aún no hay confirmación del servidor en esta sesión"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cls} transition-colors`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
