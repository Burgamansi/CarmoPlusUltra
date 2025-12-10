
import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="bg-carmel-gold text-carmel-brown hover:bg-white transition-colors font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 animate-fade-in"
      aria-label="Instalar App"
    >
      <Download size={14} strokeWidth={2.5} />
      <span>Instalar App</span>
    </button>
  );
};
