import { useEffect, useCallback } from "react";

const CHECK_INTERVAL = 60 * 1000; // check every 60 seconds

export function useAutoUpdate() {
  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(window.location.origin + "/index.html", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const html = await res.text();
      // Extract script src hashes — if they changed, a new version is deployed
      const scriptMatches = html.match(/src="\/assets\/[^"]+"/g);
      const currentScripts = document.querySelectorAll('script[src^="/assets/"]');
      const currentSrcs = Array.from(currentScripts).map(s => `src="${s.getAttribute("src")}"`);

      if (scriptMatches && currentSrcs.length > 0) {
        const hasNewVersion = scriptMatches.some(s => !currentSrcs.includes(s));
        if (hasNewVersion) {
          console.log("[AutoUpdate] New version detected, reloading...");
          window.location.reload();
        }
      }
    } catch {
      // silently ignore fetch errors
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkForUpdate]);
}
