import React, { useEffect, useState } from "react";
import { Download, WifiOff, Wifi, X, Smartphone } from "lucide-react";

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("engineer_pwa_prompt_dismissed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("engineer_pwa_prompt_dismissed", "true");
    } catch {
      // ignore
    }
  };

  if (dismissed && isOnline) return null;

  return (
    <div className="ea-pwa-toast" role="status" aria-live="polite">
      <div className="ea-pwa-card">
        <div className={`ea-pwa-icon ${isOnline ? "online" : "offline"}`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </div>
        <div className="ea-pwa-copy">
          <strong><Smartphone className="h-3.5 w-3.5" /> Shipboard offline ready</strong>
          <span>
            {isOnline
              ? "Install as a PWA; core tools stay available offline."
              : "Offline mode active. Local records remain available."}
          </span>
        </div>
        {installPrompt && isOnline && (
          <button onClick={handleInstall} className="ea-pwa-install">
            <Download className="h-3.5 w-3.5" /> Install
          </button>
        )}
        <button onClick={dismiss} className="ea-pwa-close" aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
