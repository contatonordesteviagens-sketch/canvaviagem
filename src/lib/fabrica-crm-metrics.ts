import { supabase } from "@/integrations/supabase/client";
import { resolveFabricaProjectId } from "@/lib/fabrica-project-persistence";
import {
  executeIdempotentWriteWithFreshSupabaseSession,
  executeReadWithFreshSupabaseSession,
} from "@/lib/supabase-session";

export type FabricaCrmLead = {
  id: string;
  nome_completo: string;
  whatsapp: string;
  email: string;
  destino_interesse: string;
  data_ida: string | null;
  data_volta: string | null;
  numero_viajantes: number;
  observacoes: string;
  created_at: string;
  status: string;
  legacy_unverified?: boolean;
  legacy_unassigned?: boolean;
  storage_source: "crm" | "analytics";
  raw_payload?: Record<string, unknown>;
};

export type FabricaMetricSummary = {
  visits: number;
  clicks: number;
  leads: number;
  avgTime: number;
};

export type FabricaCrmMetrics = {
  project: FabricaMetricSummary;
  accountHistory: FabricaMetricSummary;
  projectLeads: FabricaCrmLead[];
  accountHistoryLeads: FabricaCrmLead[];
  metricsFailed: boolean;
};

type Attribution = "project" | "other" | "unassigned";

type LoadFabricaCrmMetricsParams = {
  ownerId: string;
  projectId?: string | null;
  crmFormId?: string | null;
  siteSlug?: string | null;
  locale?: "pt" | "es";
};

const EMPTY_SUMMARY: FabricaMetricSummary = {
  visits: 0,
  clicks: 0,
  leads: 0,
  avgTime: 0,
};

const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase();

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, any>
    : {};

const normalizeSourceHost = (value: unknown) => {
  const raw = normalized(value);
  if (!raw) return "";
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase();
  } catch {
    return raw.split("/")[0].split(":")[0];
  }
};

const createAttributionResolver = ({
  ownerId,
  projectId,
  crmFormId,
  siteSlug,
  knownCurrentAliases = [],
  knownOtherAliases = [],
}: Pick<LoadFabricaCrmMetricsParams, "ownerId" | "projectId" | "crmFormId" | "siteSlug"> & {
  knownCurrentAliases?: Iterable<string>;
  knownOtherAliases?: Iterable<string>;
}) => {
  const accountLegacyFormId = `legacy-${normalized(ownerId)}`;
  const cleanProjectId = normalized(projectId);
  const canonicalProjectId = projectId ? normalized(resolveFabricaProjectId(projectId)) : "";
  const currentAliases = new Set(Array.from(knownCurrentAliases).map(normalized).filter(Boolean));
  const cleanCrmFormId = normalized(crmFormId);
  const trustedCrmFormId = cleanCrmFormId
    && (
      cleanCrmFormId === cleanProjectId
      || cleanCrmFormId === canonicalProjectId
      || currentAliases.has(cleanCrmFormId)
    )
    ? cleanCrmFormId
    : "";
  const requestedSiteSlug = normalized(siteSlug);
  const trustedSiteSlug = requestedSiteSlug && currentAliases.has(requestedSiteSlug)
    ? requestedSiteSlug
    : "";
  const projectAliases = new Set(
    [
      cleanProjectId,
      canonicalProjectId,
      trustedCrmFormId,
      trustedSiteSlug,
      trustedSiteSlug ? `proj_legacy_${trustedSiteSlug}` : "",
      ...currentAliases,
    ]
      .map(normalized)
      .filter((identifier) => Boolean(identifier) && identifier !== accountLegacyFormId),
  );
  const otherAliases = new Set(
    Array.from(knownOtherAliases)
      .map(normalized)
      .filter((identifier) => Boolean(identifier) && !projectAliases.has(identifier)),
  );

  return (input: Record<string, any>): Attribution => {
    const payload = asRecord(input.payload);
    const identifiers = [
      input.form_id,
      input.project_id,
      input.site_id,
      input.site_slug,
      input.embed_key,
      payload.form_id,
      payload.project_id,
      payload.site_id,
      payload.site_slug,
      payload.embed_key,
    ]
      .map(normalized)
      .filter(Boolean);

    if (identifiers.some((identifier) => projectAliases.has(identifier))) {
      return "project";
    }

    const meaningfulIdentifiers = identifiers.filter(
      (identifier) => identifier !== accountLegacyFormId,
    );
    if (meaningfulIdentifiers.some((identifier) => otherAliases.has(identifier))) {
      return "other";
    }

    const sourceHost = normalizeSourceHost(
      input.source_domain
      || input.source_url
      || payload.source_domain
      || payload.source_url
      || payload.domain,
    );
    if (sourceHost) {
      if (
        trustedSiteSlug
        && (
          sourceHost === `${trustedSiteSlug}.canvaviagem.com`
          || sourceHost.startsWith(`${trustedSiteSlug}.`)
        )
      ) {
        return "project";
      }
      const sourceSlug = sourceHost.split(".")[0] || "";
      if (otherAliases.has(sourceHost) || otherAliases.has(sourceSlug)) return "other";
    }

    return "unassigned";
  };
};

const safeInteger = (value: unknown, fallback = 1) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const leadIdentity = (lead: FabricaCrmLead) => [
  lead.email,
  String(lead.whatsapp || "").replace(/\D/g, ""),
  lead.nome_completo,
  lead.destino_interesse,
  lead.created_at ? new Date(lead.created_at).toISOString().slice(0, 16) : "",
].map(normalized).join("|");

const dedupeLeads = (
  canonical: FabricaCrmLead[],
  fallback: FabricaCrmLead[],
) => {
  const canonicalIds = new Set(canonical.map((lead) => lead.id));
  const identities = new Set(canonical.map(leadIdentity));
  return [
    ...canonical,
    ...fallback.filter(
      (lead) => !canonicalIds.has(lead.id) && !identities.has(leadIdentity(lead)),
    ),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const mapSubmission = (
  lead: Record<string, any>,
  unassigned: boolean,
  locale: "pt" | "es",
): FabricaCrmLead => {
  const payload = asRecord(lead.payload);
  return {
    id: String(lead.id),
    nome_completo: lead.normalized_name || payload.nome || payload.name || (locale === "es" ? "Sin nombre" : "Sem nome"),
    whatsapp: lead.normalized_phone || payload.wpp || payload.whatsapp || payload.phone || "",
    email: lead.normalized_email || payload.email || "",
    destino_interesse: lead.normalized_interest || payload.destino || payload.interest || (locale === "es" ? "Navegación general" : "Navegação geral"),
    data_ida: payload.ida || payload.data_ida || null,
    data_volta: payload.volta || payload.data_volta || null,
    numero_viajantes: safeInteger(payload.viaj || payload.viajantes),
    observacoes: payload.obs || payload.observacoes || "",
    created_at: lead.created_at,
    status: lead.status || "novo",
    legacy_unassigned: unassigned,
    storage_source: "crm",
    raw_payload: payload,
  };
};

const mapFallbackLead = (
  event: Record<string, any>,
  unassigned: boolean,
  locale: "pt" | "es",
): FabricaCrmLead => {
  const payload = asRecord(event.event_data);
  return {
    id: String(event.id),
    nome_completo: payload.name || payload.nome || (locale === "es" ? "Sin nombre" : "Sem nome"),
    whatsapp: payload.phone || payload.wpp || payload.whatsapp || "",
    email: payload.email || "",
    destino_interesse: payload.interest || payload.destino || (locale === "es" ? "Navegación general" : "Navegação geral"),
    data_ida: payload.ida || payload.data_ida || null,
    data_volta: payload.volta || payload.data_volta || null,
    numero_viajantes: safeInteger(payload.viajantes || payload.viaj),
    observacoes: payload.obs || payload.observacoes || "",
    created_at: event.created_at,
    status: payload.status || "novo",
    legacy_unverified: true,
    legacy_unassigned: unassigned,
    storage_source: "analytics",
    raw_payload: payload,
  };
};

const summarizeEvents = (
  events: Record<string, any>[],
  leads: number,
): FabricaMetricSummary => {
  const visits = new Set(
    events
      .filter((event) => event.event_type === "page_view")
      .map((event) => normalized(event.session_id) || `event:${event.id}`),
  ).size;
  const clicks = events.filter((event) => event.event_type === "click_whatsapp").length;
  const durations = events
    .filter((event) => event.event_type === "time_on_site")
    .map((event) => Number(asRecord(event.event_data).duration) || 0)
    .filter((duration) => duration > 0 && duration < 3600);
  return {
    visits,
    clicks,
    leads,
    avgTime: durations.length
      ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length)
      : 0,
  };
};

export const getFabricaConversionRate = (summary: FabricaMetricSummary) => {
  if (summary.visits === 0) return summary.leads === 0 ? 0 : null;
  if (summary.leads > summary.visits) return null;
  return Math.round((summary.leads / summary.visits) * 100);
};

export const persistFabricaLeadStatus = async ({
  lead,
  ownerId,
  status,
}: {
  lead: FabricaCrmLead;
  ownerId: string;
  status: string;
}) => {
  const result = await executeIdempotentWriteWithFreshSupabaseSession(
    () => lead.storage_source === "analytics"
      ? (supabase as any).rpc("promote_fabrica_legacy_lead", {
          p_event_id: lead.id,
          p_status: status,
        })
      : (supabase as any)
          .from("crm_form_submissions")
          .update({ status })
          .eq("id", lead.id)
          .eq("owner_id", ownerId)
          .select("id")
          .maybeSingle(),
    ownerId,
  );

  if (result.error) throw result.error;
  if (!result.data) throw new Error("lead_status_not_persisted");
};

const loadAllPages = async (
  buildQuery: () => any,
  expectedUserId: string,
  pageSize = 1000,
) => {
  const data: Record<string, any>[] = [];
  for (let from = 0; ; from += pageSize) {
    const result = await executeReadWithFreshSupabaseSession(
      () => buildQuery().range(from, from + pageSize - 1),
      expectedUserId,
    );
    if (result.error) return { data, error: result.error };

    const page = (result.data || []) as Record<string, any>[];
    data.push(...page);
    if (page.length < pageSize) return { data, error: null };
  }
};

const projectKey = (value: unknown) => {
  const raw = String(value || "").trim();
  return raw ? normalized(resolveFabricaProjectId(raw)) : "";
};

const buildProjectAliasInventory = ({
  projectId,
  projects,
  forms,
  sites,
}: {
  projectId?: string | null;
  projects: Record<string, any>[];
  forms: Record<string, any>[];
  sites: Record<string, any>[];
}) => {
  const currentProjectKey = projectKey(projectId);
  const currentAliases = new Set<string>();
  const otherAliases = new Set<string>();
  const addSiteAliases = (target: Set<string>, siteId: unknown) => {
    const siteSlug = normalized(siteId);
    if (!siteSlug) return;
    target.add(siteSlug);
    target.add(`${siteSlug}.canvaviagem.com`);
  };

  projects.forEach((project) => {
    const rowProjectKey = projectKey(project.id);
    if (!rowProjectKey) return;
    const target = rowProjectKey === currentProjectKey ? currentAliases : otherAliases;
    target.add(normalized(project.id));
    target.add(rowProjectKey);
  });

  forms.forEach((form) => {
    const rowProjectKey = projectKey(form.project_id);
    if (!rowProjectKey) return;
    const target = rowProjectKey === currentProjectKey ? currentAliases : otherAliases;
    target.add(normalized(form.id));
    target.add(rowProjectKey);
  });

  sites.forEach((site) => {
    const rowProjectKey = projectKey(site.project_id);
    if (!rowProjectKey) return;
    const target = rowProjectKey === currentProjectKey ? currentAliases : otherAliases;
    target.add(rowProjectKey);
    addSiteAliases(target, site.id);
  });

  return { currentAliases, otherAliases };
};

export const loadFabricaCrmMetrics = async ({
  ownerId,
  projectId,
  crmFormId,
  siteSlug,
  locale = "pt",
}: LoadFabricaCrmMetricsParams): Promise<FabricaCrmMetrics> => {
  const [submissionsResult, eventsResult, projectsResult, formsResult, sitesResult] = await Promise.all([
    loadAllPages(
      () => (supabase as any)
        .from("crm_form_submissions")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false }),
      ownerId,
    ),
    loadAllPages(
      () => (supabase as any)
        .from("analytics_events")
        .select("id, event_type, event_data, created_at, session_id, url_path")
        .eq("user_id", ownerId)
        .contains("event_data", { agency_id: ownerId })
        .in("event_data->>ingestion", ["validated_v1", "legacy_recovered_v1"])
        .in("event_type", ["page_view", "click_whatsapp", "time_on_site", "lead_captured"])
        .order("created_at", { ascending: false }),
      ownerId,
    ),
    loadAllPages(
      () => (supabase as any)
        .from("fabrica_diagnosticos")
        .select("id")
        .eq("user_id", ownerId)
        .order("updated_at", { ascending: false }),
      ownerId,
    ),
    loadAllPages(
      () => (supabase as any)
        .from("crm_forms")
        .select("id, project_id")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false }),
      ownerId,
    ),
    loadAllPages(
      () => (supabase as any)
        .from("public_sites")
        .select("id, project_id")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false }),
      ownerId,
    ),
  ]);

  if (submissionsResult.error) throw submissionsResult.error;
  if (projectsResult.error) throw projectsResult.error;
  if (formsResult.error) throw formsResult.error;
  if (sitesResult.error) throw sitesResult.error;

  const { currentAliases, otherAliases } = buildProjectAliasInventory({
    projectId,
    projects: projectsResult.data,
    forms: formsResult.data,
    sites: sitesResult.data,
  });
  const resolveAttribution = createAttributionResolver({
    ownerId,
    projectId,
    crmFormId,
    siteSlug,
    knownCurrentAliases: currentAliases,
    knownOtherAliases: otherAliases,
  });

  const projectCanonical: FabricaCrmLead[] = [];
  const accountCanonical: FabricaCrmLead[] = [];
  (submissionsResult.data || []).forEach((row: Record<string, any>) => {
    const attribution = resolveAttribution({
      ...row,
      payload: asRecord(row.payload),
    });
    if (attribution === "project") {
      projectCanonical.push(mapSubmission(row, false, locale));
    } else if (attribution === "unassigned") {
      accountCanonical.push(mapSubmission(row, true, locale));
    }
  });

  const allEvents = eventsResult.error
    ? []
    : ((eventsResult.data || []) as Record<string, any>[]).filter((event) => {
        const ingestion = normalized(asRecord(event.event_data).ingestion);
        return ingestion === "validated_v1" || ingestion === "legacy_recovered_v1";
      });
  const projectEvents: Record<string, any>[] = [];
  const accountEvents: Record<string, any>[] = [];
  allEvents.forEach((event) => {
    const payload = asRecord(event.event_data);
    const attribution = resolveAttribution({ ...payload, payload });
    if (attribution === "project") projectEvents.push(event);
    else if (attribution === "unassigned") accountEvents.push(event);
  });

  const projectFallback = projectEvents
    .filter((event) => event.event_type === "lead_captured" && !asRecord(event.event_data).submission_id)
    .map((event) => mapFallbackLead(event, false, locale));
  const accountFallback = accountEvents
    .filter((event) => event.event_type === "lead_captured" && !asRecord(event.event_data).submission_id)
    .map((event) => mapFallbackLead(event, true, locale));

  const allProjectLeads = dedupeLeads(projectCanonical, projectFallback);
  const allAccountHistoryLeads = dedupeLeads(accountCanonical, accountFallback);

  return {
    project: eventsResult.error
      ? { ...EMPTY_SUMMARY, leads: allProjectLeads.length }
      : summarizeEvents(projectEvents, allProjectLeads.length),
    accountHistory: eventsResult.error
      ? { ...EMPTY_SUMMARY, leads: allAccountHistoryLeads.length }
      : summarizeEvents(accountEvents, allAccountHistoryLeads.length),
    projectLeads: allProjectLeads,
    accountHistoryLeads: allAccountHistoryLeads,
    metricsFailed: Boolean(eventsResult.error),
  };
};
