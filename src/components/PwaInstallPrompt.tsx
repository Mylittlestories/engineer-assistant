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
    <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-sm z-[80] pointer-events-none">
      <div className="pointer-events-auto rounded-xl border border-[#cca45c]/40 bg-[#071524]/95 shadow-2xl backdrop-blur p-3 text-slate-100 flex gap-3 items-start">
        <div className={`mt-0.5 rounded-lg p-2 ${isOnline ? "bg-emerald-950/60 text-emerald-300" : "bg-red-950/70 text-red-300"}`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#dfb15b]">
            <Smartphone className="w-3.5 h-3.5" />
            Shipboard Offline Ready
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
            {isOnline
              ? "Install this app on Android/desktop as a PWA. Core database, lessons, and adaptive memory remain available offline."
              : "Offline mode active. The app will use local records and learned lessons until internet returns."}
          </p>
          {installPrompt && isOnline && (
            <button
              onClick={handleInstall}
              className="mt-2 inline-flex items-center gap-1.5 rounded bg-[#cca45c] px-3 py-1.5 text-[10px] font-bold uppercase text-slate-950 hover:bg-[#dfb15b]"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
        </div>
        <button onClick={dismiss} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
