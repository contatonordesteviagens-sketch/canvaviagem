import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { purgeFabricaProjectLocalCache, type FabricaState } from "./useFabricaContext";
import { toast } from "sonner";
import { buildCanvaSiteSlug, extractCanvaSiteSlug, getCanvaSiteUrl } from "@/lib/canva-site-domain";
import { recoverFabricaStateFromPublishedHtml } from "@/lib/fabrica-project-recovery";
import { isPersistedProjectId, persistFabricaProject } from "@/lib/fabrica-project-persistence";
import { deleteFabricaProject } from "@/lib/fabrica-project-deletion";

export type DiagnosticoSource = "saved" | "published_recovery";

export interface DiagnosticoSalvo {
  id: string;
  user_id: string;
  agency_name: string;
  digital_score: number;
  level: number;
  level_name: string | null;
  state_snapshot: FabricaState;
  checklist_progress: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  published_site_id?: string | null;
  published_site_url?: string | null;
  published_project_id?: string | null;
  source?: DiagnosticoSource;
}

export const materializeRecoveredProject = async (
  project: DiagnosticoSalvo,
  userId: string,
): Promise<DiagnosticoSalvo> => {
  if (project.source !== "published_recovery" || isPersistedProjectId(project.id)) {
    return project;
  }

  const persisted = await persistFabricaProject({
    state: project.state_snapshot,
    userId,
    levelName: "Site publicado recuperado",
  });
  const stateSnapshot = {
    ...persisted.stateSnapshot,
    projectId: persisted.id,
  };

  if (project.published_site_id) {
    const { error } = await supabase
      .from("public_sites")
      .update({ project_id: persisted.id })
      .eq("id", project.published_site_id)
      .eq("owner_id", userId);
    if (error) {
      console.warn("[Fabrica] Site recuperado salvo, mas o vinculo sera sincronizado depois.", error);
    }
  }

  return {
    ...project,
    id: persisted.id,
    state_snapshot: stateSnapshot,
    published_project_id: persisted.id,
    source: "saved",
  };
};

interface PublishedSiteMetadata {
  id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

const projectSlugs = (project: DiagnosticoSalvo) => {
  const snapshot = project.state_snapshot as FabricaState | undefined;
  const publishedUrl = snapshot?.siteContent?.canvaViagemUrl;
  const urlSlug = publishedUrl ? extractCanvaSiteSlug(publishedUrl) : "";
  const agencySlug = buildCanvaSiteSlug(project.agency_name || snapshot?.agencyName || "");
  return { urlSlug, agencySlug };
};

const legacyProjectId = (siteId: string) => `proj_legacy_${siteId}`;

const humanizeSiteId = (siteId: string) =>
  siteId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Site recuperado";

export const useDiagnosticos = () => {
  const { user } = useAuth();
  const locale = typeof window !== "undefined" && window.location.pathname.startsWith("/es") ? "es" : "pt-BR";
  return useQuery({
    queryKey: ["fabrica-diagnosticos", user?.id, locale],
    queryFn: async () => {
      if (!user) return [] as DiagnosticoSalvo[];

      const [projectsResult, sitesResult] = await Promise.all([
        supabase
          .from("fabrica_diagnosticos" as any)
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("public_sites")
          .select("id, project_id, created_at, updated_at")
          .eq("owner_id", user.id)
          .eq("locale", locale)
          .order("updated_at", { ascending: false }),
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (sitesResult.error) {
        console.warn("[Fábrica] Sites publicados indisponíveis; exibindo os projetos salvos.", sitesResult.error);
      }

      const savedProjects = ((projectsResult.data || []) as any[]).map((project) => ({
        ...(project as DiagnosticoSalvo),
        source: "saved" as const,
      }));
      const publishedSites = (sitesResult.error ? [] : (sitesResult.data || [])) as PublishedSiteMetadata[];
      const knownProjectIds = new Set(savedProjects.map((project) => project.id));
      const usedSiteIds = new Set<string>();
      const siteByProject = new Map<string, PublishedSiteMetadata>();

      // Primeiro respeita vínculos explícitos já gravados no banco.
      savedProjects.forEach((project) => {
        const exactMatches = publishedSites.filter(
          (site) => !usedSiteIds.has(site.id) && site.project_id === project.id,
        );
        if (!exactMatches.length) return;
        const { urlSlug, agencySlug } = projectSlugs(project);
        const chosen = exactMatches.find((site) => urlSlug && site.id === urlSlug)
          || exactMatches.find((site) => agencySlug && site.id === agencySlug)
          || exactMatches[0];
        siteByProject.set(project.id, chosen);
        usedSiteIds.add(chosen.id);
      });

      // Compatibilidade com publicações antigas sem project_id: a URL salva é a
      // evidência mais forte e sempre tem prioridade sobre o nome da agência.
      savedProjects.forEach((project) => {
        if (siteByProject.has(project.id)) return;
        const { urlSlug } = projectSlugs(project);
        if (!urlSlug) return;
        const chosen = publishedSites.find(
          (site) =>
            !usedSiteIds.has(site.id) &&
            (!site.project_id || !knownProjectIds.has(site.project_id)) &&
            site.id === urlSlug,
        );
        if (!chosen) return;
        siteByProject.set(project.id, chosen);
        usedSiteIds.add(chosen.id);
      });

      // O slug derivado do nome só é usado quando identifica um único projeto,
      // evitando ligar duas agências homônimas à publicação errada.
      const agencySlugCounts = new Map<string, number>();
      savedProjects.forEach((project) => {
        const { agencySlug } = projectSlugs(project);
        if (agencySlug) agencySlugCounts.set(agencySlug, (agencySlugCounts.get(agencySlug) || 0) + 1);
      });
      savedProjects.forEach((project) => {
        if (siteByProject.has(project.id)) return;
        const { agencySlug } = projectSlugs(project);
        if (!agencySlug || agencySlugCounts.get(agencySlug) !== 1) return;
        const chosen = publishedSites.find(
          (site) =>
            !usedSiteIds.has(site.id) &&
            (!site.project_id || !knownProjectIds.has(site.project_id)) &&
            site.id === agencySlug,
        );
        if (!chosen) return;
        siteByProject.set(project.id, chosen);
        usedSiteIds.add(chosen.id);
      });

      const enrichedProjects: DiagnosticoSalvo[] = savedProjects.map((project) => {
        const publishedSite = siteByProject.get(project.id);
        return {
          ...project,
          published_site_id: publishedSite?.id || null,
          published_site_url: publishedSite ? getCanvaSiteUrl(publishedSite.id) : null,
          published_project_id: publishedSite?.project_id || null,
          source: "saved",
        };
      });

      const orphanSites = publishedSites.filter((site) => !usedSiteIds.has(site.id));
      const htmlBySiteId = new Map<string, string>();
      if (orphanSites.length) {
        // HTML é buscado apenas para publicações sem snapshot, evitando carregar
        // o documento completo de todos os sites em cada abertura do seletor.
        const { data: htmlRows, error: htmlError } = await supabase
          .from("public_sites")
          .select("id, html")
          .eq("owner_id", user.id)
          .eq("locale", locale)
          .in("id", orphanSites.map((site) => site.id));
        if (!htmlError) {
          (htmlRows || []).forEach((row) => htmlBySiteId.set(row.id, row.html));
        }
      }

      const recoveredProjects: DiagnosticoSalvo[] = orphanSites.map((site) => {
        const siteUrl = getCanvaSiteUrl(site.id);
        const syntheticId = legacyProjectId(site.id);
        const recovered = recoverFabricaStateFromPublishedHtml(htmlBySiteId.get(site.id) || "", {
          siteId: site.id,
          siteUrl,
        });
        const agencyName = recovered.agencyName || humanizeSiteId(site.id);
        const recoveredSiteContent = recovered.siteContent || ({} as FabricaState["siteContent"]);
        const stateSnapshot = {
          ...recovered,
          projectId: syntheticId,
          agencyName,
          siteContent: {
            ...recoveredSiteContent,
            canvaViagemUrl: siteUrl,
          },
        } as FabricaState;

        return {
          id: syntheticId,
          user_id: user.id,
          agency_name: agencyName,
          digital_score: 0,
          level: 1,
          level_name: "Site publicado recuperado",
          state_snapshot: stateSnapshot,
          checklist_progress: {},
          created_at: site.created_at,
          updated_at: site.updated_at,
          published_site_id: site.id,
          published_site_url: siteUrl,
          published_project_id: site.project_id,
          source: "published_recovery",
        };
      });

      return [...enrichedProjects, ...recoveredProjects].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    },
    enabled: !!user,
  });
};

export const useSaveDiagnostico = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      state: FabricaState;
      score: number;
      level: number;
      levelName: string;
      existingId?: string;
    }) => {
      if (!user) throw new Error("Faça login para salvar");
      const state = params.existingId
        ? { ...params.state, projectId: params.existingId }
        : params.state;
      const result = await persistFabricaProject({
        state: {
          ...state,
          digitalScore: params.score,
          level: params.level,
        },
        userId: user.id,
        levelName: params.levelName,
      });
      return { id: result.id, state_snapshot: result.stateSnapshot };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] });
      // toast controlado pelo chamador para evitar duplicação
    },
    onError: (e: any) => {
      toast.error(e?.message || "Erro ao salvar diagnóstico");
    },
  });
};

export const useDeleteDiagnostico = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DiagnosticoSalvo | string) => {
      if (!user?.id) throw new Error("Faça login para excluir o projeto.");
      const project = typeof input === "string" ? null : input;
      const projectId = typeof input === "string" ? input : input.id;
      const publishedSiteId = project?.published_site_id || null;

      if (isPersistedProjectId(projectId)) {
        await deleteFabricaProject({
          projectId,
          userId: user.id,
          legacySlugs: publishedSiteId ? [publishedSiteId] : [],
        });
        return { projectId };
      }

      if (!publishedSiteId) {
        throw new Error("Este projeto antigo precisa ser aberto na Fábrica antes de ser excluído.");
      }

      const { data: deletedSite, error } = await supabase
        .from("public_sites")
        .delete()
        .eq("id", publishedSiteId)
        .eq("owner_id", user.id)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!deletedSite) throw new Error("O site recuperado não foi encontrado ou não pôde ser excluído.");
      return { projectId };
    },
    onSuccess: ({ projectId }) => {
      if (user?.id) purgeFabricaProjectLocalCache(user.id, [projectId]);
      void Promise.all([
        qc.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] }),
        qc.invalidateQueries({ queryKey: ["public-sites"] }),
      ]);
      toast.success("Projeto removido");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Não foi possível excluir o projeto.");
    },
  });
};
