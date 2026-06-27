export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const swUrl = new URL("sw.js", window.location.href);
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.info("Engineer Assistant offline service worker registered", registration.scope);
      })
      .catch((error) => {
        console.warn("Engineer Assistant service worker registration failed", error);
      });
  });
}
