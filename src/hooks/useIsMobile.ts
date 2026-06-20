import { useEffect, useState } from "react";

const LANDING_MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile(query = LANDING_MOBILE_QUERY) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return isMobile;
}
