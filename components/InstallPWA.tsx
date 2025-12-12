import React, { useEffect, useState } from "react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
    >
      <button
        onClick={installApp}
        style={{
          background: "#5a3e2b",
          color: "#fff",
          border: "none",
          borderRadius: 24,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          cursor: "pointer",
        }}
      >
        📲 Baixar App Carmo+
      </button>
    </div>
  );
}
