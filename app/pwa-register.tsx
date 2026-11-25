
"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export default function PWARegister() {
  const [installEvent, setInstallEvent] =
    useState<InstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error("Sofia service worker registration failed:", error);
        });
    }

    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installSofia() {
    if (!installEvent) {
      alert(
        "If installation is supported, use your browser's Add to Home Screen option."
      );
      return;
    }

    await installEvent.prompt();

    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      setInstalled(true);
    }

    setInstallEvent(null);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 18,
        left: 18,
        zIndex: 40
      }}
    >
      {!installed && (
        <button
          className="btn btn-primary"
          onClick={installSofia}
          style={{ boxShadow: "0 5px 25px #7868ff55" }}
        >
          ↓ Install Sofia
        </button>
      )}

      {installed && (
        <span
          className="badge badge-success"
          style={{ padding: 10 }}
        >
          ✓ Sofia installed
        </span>
      )}
    </div>
  );
}
