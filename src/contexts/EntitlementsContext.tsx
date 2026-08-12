import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hasEliteAccess, hasStartAccess } from "@/lib/planAccess";
import {
  ensureFreshSupabaseSession,
} from "@/lib/supabase-session";
import fpPromise from "@fingerprintjs/fingerprintjs";

let visitorIdPromise: Promise<string | null> | null = null;
const getVisitorId = async () => {
  if (typeof window === "undefined") return null;
  if (!visitorIdPromise) {
    visitorIdPromise = fpPromise
      .load()
      .then((fp) => fp.get())
      .then((result) => result.visitorId)
      .catch(() => null);
  }
  return await visitorIdPromise;
};

export type AccountTier =
  | "guest"
  | "free"
  | "start_legacy"
  | "unknown_paid"
  | "elite_trial"
  | "elite"
  | "admin";

export type EntitlementCapability =
  | "fabrica.open"
  | "fabrica.configure"
  | "fabrica.save"
  | "photos.search"
  | "ad.preview"
  | "carousel.preview"
  | "site.preview"
  | "ad.export"
  | "carousel.export"
  | "site.publish"
  | "crm.real_data"
  | "voice.use"
  | "vendedor.use"
  | "library.premium.open"
  | "tools.basic.use"
  | "tools.elite.use"
  | "premium_content.open";

export type MeteredCapability = "ad_export" | "carousel_export";

type UsageCounts = {
  ad_export: number;
  carousel_export: number;
};

type EntitlementsSnapshot = {
  tier: AccountTier;
  capabilities: Record<string, boolean>;
  limits: (UsageCounts & { projects: number }) | null;
  used: UsageCounts;
  remaining: UsageCounts | null;
  needsReview: boolean;
};

type ReservationResult = {
  allowed: boolean;
  unlimited?: boolean;
  duplicate?: boolean;
  reservationId?: string | null;
  remaining?: number | null;
  error?: string;
};

type EntitlementsContextValue = EntitlementsSnapshot & {
  loading: boolean;
  can: (capability: EntitlementCapability) => boolean;
  refresh: () => Promise<void>;
  reserve: (
    capability: MeteredCapability,
    idempotencyKey: string,
    options?: { projectId?: string | null; metadata?: Record<string, unknown> },
  ) => Promise<ReservationResult>;
  commit: (reservationId?: string | null) => Promise<void>;
  release: (reservationId?: string | null) => Promise<void>;
  track: (eventType: string, eventData?: Record<string, unknown>) => void;
};

const EMPTY_USAGE: UsageCounts = { ad_export: 0, carousel_export: 0 };
const FREE_LIMITS = { ad_export: 3, carousel_export: 1, projects: 1 };

const buildGuestSnapshot = (): EntitlementsSnapshot => ({
  tier: "guest",
  capabilities: {
    "fabrica.open": true,
    "fabrica.configure": true,
    "fabrica.save": false,
    "photos.search": true,
    "ad.preview": true,
    "carousel.preview": true,
    "site.preview": true,
    "ad.export": false,
    "carousel.export": false,
    "site.publish": false,
    "crm.real_data": false,
    "voice.use": false,
    "vendedor.use": false,
    "library.premium.open": false,
    "tools.basic.use": false,
    "tools.elite.use": false,
    "premium_content.open": false,
    unlimited: false,
  },
  limits: FREE_LIMITS,
  used: EMPTY_USAGE,
  remaining: { ad_export: 3, carousel_export: 1 },
  needsReview: false,
});

const buildFallbackSnapshot = (
  isAdmin: boolean,
  subscribed: boolean,
  productId: string | null,
): EntitlementsSnapshot => {
  const subscription = { subscribed, productId };
  const elite = isAdmin || hasEliteAccess(subscription);
  const start = hasStartAccess(subscription);
  const unknownPaid = subscribed && !elite && !start;
  const tier: AccountTier = isAdmin
    ? "admin"
    : elite
      ? "elite"
      : start
        ? "start_legacy"
        : unknownPaid
          ? "unknown_paid"
          : "free";

  return {
    tier,
    capabilities: {
      "fabrica.open": true,
      "fabrica.configure": true,
      "fabrica.save": true,
      "photos.search": true,
      "ad.preview": true,
      "carousel.preview": true,
      "site.preview": true,
      "ad.export": elite,
      "carousel.export": elite,
      "site.publish": elite,
      "crm.real_data": elite,
      "voice.use": elite,
      "vendedor.use": elite,
      "library.premium.open": elite || start,
      "tools.basic.use": elite || start,
      "tools.elite.use": elite,
      "premium_content.open": elite || start,
      unlimited: elite,
    },
    limits: elite ? null : FREE_LIMITS,
    used: EMPTY_USAGE,
    remaining: elite ? null : { ad_export: 3, carousel_export: 1 },
    needsReview: unknownPaid,
  };
};

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const { user, session, subscription, isAdmin } = useAuth();
  const fallback = useMemo(
    () => buildFallbackSnapshot(isAdmin, subscription.subscribed, subscription.productId),
    [isAdmin, subscription.productId, subscription.subscribed],
  );
  const [snapshot, setSnapshot] = useState<EntitlementsSnapshot>(
    () => user ? fallback : buildGuestSnapshot(),
  );
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    setSnapshot((current) => {
      if (!user) return buildGuestSnapshot();
      return current.tier === "guest" ? fallback : current;
    });
  }, [fallback, user]);

  const invoke = useCallback(async (body: Record<string, unknown>) => {
    if (!user) throw new Error("Login necessário");

    const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!functionsBaseUrl) throw new Error("Serviço temporariamente indisponível");

    const callWithToken = async (accessToken: string) => {
      const response = await fetch(`${functionsBaseUrl}/functions/v1/fabrica-entitlements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({ error: "Resposta inválida do serviço" }));
      return { data, status: response.status, ok: response.ok };
    };

    const freshSession = await ensureFreshSupabaseSession({ expectedUserId: user.id });
    let result = await callWithToken(freshSession.access_token);

    const unauthorized = result.status === 401
      || result.data?.error === "Sessão inválida"
      || result.data?.error === "Sessao invalida";

    if (unauthorized) {
      const renewedSession = await ensureFreshSupabaseSession({
        expectedUserId: user.id,
        forceRefresh: true,
        staleAccessToken: freshSession.access_token,
      });
      result = await callWithToken(renewedSession.access_token);
    }

    if (!result.ok) {
      const error = new Error(result.data?.error || "Falha ao validar permissões");
      if (result.status === 401) error.name = "FabricaAuthSessionError";
      throw error;
    }
    if (result.data?.error) throw new Error(result.data.error);
    return result.data;
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user || !session?.access_token) {
      setSnapshot(user ? fallback : buildGuestSnapshot());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await invoke({ action: "status" });
      setSnapshot({
        tier: data.tier,
        capabilities: data.capabilities ?? fallback.capabilities,
        limits: data.limits,
        used: data.used ?? EMPTY_USAGE,
        remaining: data.remaining,
        needsReview: Boolean(data.needs_review),
      });
    } catch (error) {
      console.error("[Entitlements] Falha ao carregar permissões:", error);
      setSnapshot(fallback);
    } finally {
      setLoading(false);
    }
  }, [fallback, invoke, session?.access_token, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const can = useCallback(
    (capability: EntitlementCapability) => Boolean(snapshot.capabilities[capability]),
    [snapshot.capabilities],
  );

  const reserve = useCallback<EntitlementsContextValue["reserve"]>(
    async (capability, idempotencyKey, options) => {
      try {
        const fingerprint = await getVisitorId();
        const data = await invoke({
          action: "reserve",
          capability,
          idempotency_key: idempotencyKey,
          project_id: options?.projectId ?? "",
          metadata: options?.metadata ?? {},
          fingerprint,
        });
        return {
          allowed: Boolean(data.allowed),
          unlimited: Boolean(data.unlimited),
          duplicate: Boolean(data.duplicate),
          reservationId: data.reservation_id ?? null,
          remaining: data.remaining ?? 0,
        };
      } catch (error) {
        console.error("[Entitlements] Falha ao reservar crédito:", error);
        return {
          allowed: false,
          error: "Não foi possível validar seu crédito agora. Tente novamente.",
        };
      }
    },
    [invoke],
  );

  const updateReservation = useCallback(async (
    action: "commit" | "release",
    reservationId?: string | null,
  ) => {
    if (!reservationId) return;
    await invoke({ action, reservation_id: reservationId });
    await refresh();
  }, [invoke, refresh]);

  const commit = useCallback(
    (reservationId?: string | null) => updateReservation("commit", reservationId),
    [updateReservation],
  );
  const release = useCallback(
    (reservationId?: string | null) => updateReservation("release", reservationId),
    [updateReservation],
  );

  const track = useCallback((eventType: string, eventData: Record<string, unknown> = {}) => {
    if (!user || !session?.access_token) return;
    void invoke({
      action: "track",
      event_type: eventType,
      event_data: eventData,
      url_path: typeof window === "undefined" ? null : window.location.pathname,
    }).catch(() => undefined);
  }, [invoke, session?.access_token, user]);

  const value = useMemo<EntitlementsContextValue>(() => ({
    ...snapshot,
    loading,
    can,
    refresh,
    reserve,
    commit,
    release,
    track,
  }), [can, commit, loading, refresh, release, reserve, snapshot, track]);

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
}

export function useEntitlements() {
  const context = useContext(EntitlementsContext);
  if (!context) throw new Error("useEntitlements must be used within EntitlementsProvider");
  return context;
}
