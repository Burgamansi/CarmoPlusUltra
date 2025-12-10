
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Music, Calendar, MapPin, Heart, BookOpen, Image, Info, Settings, MessageCircle, Youtube } from 'lucide-react';
import { InstallPWA } from './InstallPWA';

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/meetings', label: 'Reuniões', icon: Calendar },
  { path: '/songs', label: 'Músicas', icon: Music },
  { path: '/playlist', label: 'Playlist', icon: Music }, // Added purely for consistency if needed, though usually accessed via Meetings
  { path: '/media', label: 'Mídia', icon: Youtube },
  { path: '/members', label: 'Membros', icon: Users },
  { path: '/gallery', label: 'Galeria', icon: Image },
  { path: '/map', label: 'Mapa', icon: MapPin },
  { path: '/prayers', label: 'Oração', icon: Heart },
  { path: '/liturgy', label: 'Liturgia', icon: BookOpen },
  { path: '/feedback', label: 'Feedback', icon: MessageCircle },
  { path: '/about', label: 'Sobre', icon: Info },
  { path: '/admin', label: 'Admin', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Filter out playlist from main menu if it's meant to be hidden or context-dependent, 
  // but keeping it here for menu completeness based on request implicitly. 
  // Removing '/playlist' from main nav visualization to keep it cleaner if it wasn't requested explicitly in menu list, 
  // but User said "Add this new page to the menu...".
  // The original NAV_ITEMS in file content didn't have Playlist, so I'll stick to adding Media.
  
  const DISPLAY_NAV_ITEMS = NAV_ITEMS.filter(item => item.path !== '/playlist');

  return (
    <div className="min-h-screen flex flex-col bg-carmel-beige text-carmel-brown relative">
      {/* Devotional Background Image */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/nossa_senhora_carmo.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          mixBlendMode: 'multiply'
        }}
      />

      {/* Header */}
      <header className="bg-carmel-brown text-carmel-beige sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-8 h-8 bg-carmel-gold rounded-full flex items-center justify-center text-carmel-brown font-bold font-serif">C</div>
            <h1 className="font-serif font-bold text-lg">Carmo+ Ultra</h1>
          </div>
          <div className="flex items-center gap-3">
            <InstallPWA />
            <button onClick={() => setIsMenuOpen(true)} className="p-2">
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-carmel-beige shadow-2xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif font-bold text-xl text-carmel-brown">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-carmel-brown">
                <X />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
              {DISPLAY_NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-sans font-bold transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-carmel-brown text-carmel-beige' 
                      : 'text-carmel-brown hover:bg-carmel-brown/10'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-20 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-carmel-brown/5 text-center py-4 mt-auto relative z-10">
        <p className="text-[10px] uppercase tracking-widest opacity-60 font-sans">
          Developed by Rogério Marcos
        </p>
      </footer>
    </div>
  );
};
