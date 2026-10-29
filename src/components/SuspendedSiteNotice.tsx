import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Quem parou de pagar cai no /inicio. Se essa pessoa tinha site publicado, ele foi
 * suspenso (public_sites.is_active = false): avisamos que o site está fora do ar e
 * que volta sozinho, com tudo o que ela criou, assim que o pagamento for regularizado.
 */
export function SuspendedSiteNotice() {
  const { user } = useAuth();
  const [sites, setSites] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setSites([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("public_sites")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_active", false)
      .then(({ data }) => {
        if (!cancelled) setSites((data ?? []).map((row: { id: string }) => row.id));
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (sites.length === 0) return null;

  return (
    <div role="alert" className="sticky top-0 z-[70] w-full bg-red-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-5xl items-start gap-3 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="leading-snug">
          <strong>{sites.map((id) => `${id}.canvaviagem.com`).join(", ")}</strong>{" "}
          {sites.length > 1 ? "estão fora do ar" : "está fora do ar"} porque a assinatura não está em dia.
          Seus pacotes, textos e clientes continuam guardados: renove abaixo e o site volta na hora.
        </p>
      </div>
    </div>
  );
}
