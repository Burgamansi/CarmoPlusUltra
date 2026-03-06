
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  Music,
  CalendarDays,
  MapPin,
  HeartHandshake,
  BookOpen,
  PlaySquare,
  Image as ImageIcon,
  Info,
  Settings,
  MessageCircle,
  Youtube,
  LogOut
} from 'lucide-react';
import InstallAppGuide from './InstallAppGuide';

console.log("[Layout] Module loading");

// reorganized into semantic sections
const MENU_SECTIONS = [
  {
    title: 'Comunidade',
    items: [
      { path: '/', label: 'Início', icon: Home },
      { path: '/meetings', label: 'Reuniões', icon: CalendarDays },
      { path: '/members', label: 'Membros', icon: Users }
    ]
  },
  {
    title: 'Espiritual',
    items: [
      { path: '/prayers', label: 'Orações', icon: HeartHandshake },
      { path: '/liturgy', label: 'Liturgia', icon: BookOpen },
      { path: '/devotional', label: 'Devocional', icon: PlaySquare }
    ]
  },
  {
    title: 'Conteúdo',
    items: [
      { path: '/songs', label: 'Músicas', icon: Music },
      { path: '/media', label: 'Mídia', icon: PlaySquare },
      { path: '/gallery', label: 'Galeria', icon: ImageIcon }
    ]
  },
  {
    title: 'Localização',
    items: [
      { path: '/map', label: 'Mapa', icon: MapPin }
    ]
  }
];

// footer actions (no real routes provided)
const FOOTER_ITEMS = [
  { label: 'Perfil', icon: Users, action: () => console.log('perfil') },
  { label: 'Configurações', icon: Settings, action: () => console.log('config') },
  { label: 'Sair', icon: LogOut, action: () => console.log('sair') }
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("[Layout] Component rendering");
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // now using sections; no filtering required
  // DISPLAY_NAV_ITEMS not used anymore

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
            <nav className="flex-1 flex flex-col overflow-y-auto space-y-2 hide-scrollbar">
              {MENU_SECTIONS.map(section => (
                <div key={section.title} className="mb-4">
                  <div className="px-4 text-xs font-bold text-carmel-brown/70 uppercase mb-1">
                    {section.title}
                  </div>
                  {section.items.map(item => (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-sans font-bold transition-colors ${location.pathname === item.path
                        ? 'bg-carmel-brown text-carmel-beige'
                        : 'text-carmel-brown hover:bg-carmel-brown/10'
                        }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}

              {/* footer items inside drawer */}
              <div className="mt-auto pt-4 border-t border-carmel-brown/20">
                {FOOTER_ITEMS.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => { f.action(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-sans font-bold text-carmel-brown hover:bg-carmel-brown/10 transition-colors"
                  >
                    <f.icon size={20} />
                    {f.label}
                  </button>
                ))}
              </div>
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
      <InstallAppGuide />
    </div >
  );
};
