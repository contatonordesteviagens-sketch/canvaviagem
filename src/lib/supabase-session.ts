import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type SupabaseResult = {
  error?: unknown;
};

let refreshInFlight: Promise<Session> | null = null;

const decodeJwtExpiration = (token?: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      atob(normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=")),
    );
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const sessionError = () => {
  const error = new Error("Sua sessao expirou. Entre novamente para carregar os dados da Fabrica.");
  error.name = "FabricaAuthSessionError";
  return error;
};

export const isSupabaseAuthError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const value = error as {
    code?: unknown;
    status?: unknown;
    name?: unknown;
    message?: unknown;
    details?: unknown;
  };
  const code = String(value.code || "").toUpperCase();
  const status = Number(value.status || 0);
  const text = [value.name, value.message, value.details]
    .map((part) => String(part || "").toLowerCase())
    .join(" ");

  return status === 401
    || code === "PGRST301"
    || code === "PGRST303"
    || text.includes("jwt expired")
    || text.includes("invalid jwt")
    || text.includes("auth session missing");
};

export const ensureFreshSupabaseSession = async ({
  expectedUserId,
  forceRefresh = false,
  staleAccessToken,
}: {
  expectedUserId?: string;
  forceRefresh?: boolean;
  staleAccessToken?: string;
} = {}): Promise<Session> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const current = data.session;
  if (!current?.access_token) throw sessionError();
  if (expectedUserId && current.user.id !== expectedUserId) throw sessionError();
  if (forceRefresh && staleAccessToken && current.access_token !== staleAccessToken) {
    return current;
  }

  const expiresAt = decodeJwtExpiration(current.access_token)
    ?? (current.expires_at ? current.expires_at * 1000 : 0);
  if (!forceRefresh && expiresAt > Date.now() + 120_000) return current;

  if (!refreshInFlight) {
    const pendingRefresh = (async () => {
      const refreshed = await supabase.auth.refreshSession(
        current.refresh_token ? { refresh_token: current.refresh_token } : undefined,
      );
      if (refreshed.error || !refreshed.data.session?.access_token) {
        throw sessionError();
      }
      return refreshed.data.session;
    })();
    refreshInFlight = pendingRefresh;
    pendingRefresh.then(
      () => {
        if (refreshInFlight === pendingRefresh) refreshInFlight = null;
      },
      () => {
        if (refreshInFlight === pendingRefresh) refreshInFlight = null;
      },
    );
  }

  const refreshed = await refreshInFlight;
  if (expectedUserId && refreshed.user.id !== expectedUserId) throw sessionError();
  return refreshed;
};

const executeRetryableWithFreshSupabaseSession = async <T extends SupabaseResult>(
  request: () => PromiseLike<T>,
  expectedUserId?: string,
): Promise<T> => {
  const initialSession = await ensureFreshSupabaseSession({ expectedUserId });

  try {
    let result = await request();
    if (!isSupabaseAuthError(result.error)) return result;

    await ensureFreshSupabaseSession({
      expectedUserId,
      forceRefresh: true,
      staleAccessToken: initialSession.access_token,
    });
    result = await request();
    return result;
  } catch (error) {
    if (!isSupabaseAuthError(error)) throw error;
    await ensureFreshSupabaseSession({
      expectedUserId,
      forceRefresh: true,
      staleAccessToken: initialSession.access_token,
    });
    return request();
  }
};

export const executeReadWithFreshSupabaseSession = executeRetryableWithFreshSupabaseSession;

// Use only for writes whose stable key makes repeating the same payload safe.
export const executeIdempotentWriteWithFreshSupabaseSession =
  executeRetryableWithFreshSupabaseSession;
