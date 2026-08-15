export const PRIMARY_META_PIXEL_ID = "2120347238758199";
export const LEGACY_SALES_PIXEL_ID = "916689227676142";

export const META_PIXEL_IDS = [
  "1599242897762192",
  "1152272353771099",
  "4254631328136179",
  "1560736461820497",
  LEGACY_SALES_PIXEL_ID,
  PRIMARY_META_PIXEL_ID,
] as const;

export const SALES_PIXEL_IDS = [LEGACY_SALES_PIXEL_ID, PRIMARY_META_PIXEL_ID] as const;

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
