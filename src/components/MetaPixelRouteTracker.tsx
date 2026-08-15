import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPageView } from "@/lib/meta-pixel-sales";

export function MetaPixelRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackMetaPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
