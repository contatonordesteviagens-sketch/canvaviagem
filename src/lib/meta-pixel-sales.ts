export const PRIMARY_META_PIXEL_ID = "2120347238758199";
export const LEGACY_SALES_PIXEL_ID = "916689227676142";
// Conta usada nos anúncios. Mesmo público dos outros produtos dela, por decisão do Lucas.
export const INFOS_ALFA_PIXEL_ID = "4468467283440792";
// Pixel só do Canva Viagem (02/11), para os anúncios da /inicio. Recebe também as etapas do funil.
export const CANVA_INICIO_PIXEL_ID = "1645968187276827";

export const META_PIXEL_IDS = [
  "1599242897762192",
  "1152272353771099",
  "4254631328136179",
  "1560736461820497",
  LEGACY_SALES_PIXEL_ID,
  PRIMARY_META_PIXEL_ID,
  INFOS_ALFA_PIXEL_ID,
  CANVA_INICIO_PIXEL_ID,
] as const;

export const SALES_PIXEL_IDS = [LEGACY_SALES_PIXEL_ID, PRIMARY_META_PIXEL_ID, INFOS_ALFA_PIXEL_ID, CANVA_INICIO_PIXEL_ID] as const;

type MetaEventData = Record<string, string | number | boolean | string[] | undefined>;

const getFbq = () => {
  if (typeof window === "undefined") return null;
  return (window as Window & { fbq?: (...args: unknown[]) => void }).fbq ?? null;
};

export const trackMetaEvent = (
  eventName: string,
  data: MetaEventData = {},
  pixelIds: readonly string[] = SALES_PIXEL_IDS,
  eventId?: string,
) => {
  const fbq = getFbq();
  if (!fbq) return false;

  for (const pixelId of pixelIds) {
    if (eventId) fbq("trackSingle", pixelId, eventName, data, { eventID: eventId });
    else fbq("trackSingle", pixelId, eventName, data);
  }
  return true;
};

export const trackMetaPageView = (path: string) => trackMetaEvent(
  "PageView",
  { page_path: path },
  META_PIXEL_IDS,
);

/** Etapa do funil que só o pixel do Canva Viagem recebe. Evento padrão do Meta ou personalizado. */
export const trackFunnelEvent = (eventName: string, data: MetaEventData = {}, custom = false, eventId?: string) => {
  const fbq = getFbq();
  if (!fbq) return false;
  const method = custom ? "trackSingleCustom" : "trackSingle";
  if (eventId) fbq(method, CANVA_INICIO_PIXEL_ID, eventName, data, { eventID: eventId });
  else fbq(method, CANVA_INICIO_PIXEL_ID, eventName, data);
  return true;
};
