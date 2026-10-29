import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_PUBLIC_KEY, SUPABASE_PUBLIC_URL } from "@/lib/supabase-public";
import { useToast } from "@/hooks/use-toast";

type Capture = {
  email: string;
  source: string;
  hits: number;
  first_seen_at: string;
  last_seen_at: string;
  has_account: boolean;
};

/**
 * Base de e-mail marketing: todo e-mail digitado na tela de login (com ou sem conta criada).
 * Lê a função admin_email_captures() (só admin enxerga) e exporta CSV para o painel de e-mail.
 */
export function EmailCapturesCard() {
  const [rows, setRows] = useState<Capture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/rpc/admin_email_captures`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLIC_KEY,
            Authorization: `Bearer ${session?.access_token || SUPABASE_PUBLIC_KEY}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Capture[];
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[EmailCaptures]", err);
        if (alive) setError("A base de e-mails ainda não está disponível (migração 20261029150000 pendente).");
      }
    })();
    return () => { alive = false; };
  }, []);

  const semConta = rows?.filter((r) => !r.has_account) ?? [];

  const exportCsv = () => {
    if (!rows?.length) return;
    const header = "email,origem,vezes,primeiro_contato,ultimo_contato,tem_conta";
    const lines = rows.map((r) => [r.email, r.source, r.hits, r.first_seen_at, r.last_seen_at, r.has_account ? "sim" : "nao"].join(","));
    const blob = new Blob(["﻿" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emails_capturados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${rows.length} e-mails exportados`, description: `${semConta.length} ainda sem conta.` });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" /> E-mails capturados no login (base para e-mail marketing)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : rows === null ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground">e-mails únicos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{semConta.length}</div>
              <p className="text-xs text-muted-foreground">digitaram e não criaram conta</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{rows.length - semConta.length}</div>
              <p className="text-xs text-muted-foreground">já têm conta</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
