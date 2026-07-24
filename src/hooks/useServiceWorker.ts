import { useEffect } from "react";

export function useServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (import.meta.env.DEV) return; // não registrar em dev
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // silencioso: app funciona sem SW
    });
  }, []);
}
