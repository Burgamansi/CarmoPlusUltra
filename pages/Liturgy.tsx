import React from 'react';
import { BookOpen, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, SectionTitle, ButtonSecondary } from '../components/UI';

export const Liturgy = () => {
  const { liturgy } = useApp();

  return (
    <div className="space-y-6">
      <SectionTitle>Liturgia Diária</SectionTitle>
      
      <div className="text-center mb-6">
        <p className="text-carmel-gold font-bold uppercase tracking-widest text-xs">Hoje</p>
        <h2 className="text-2xl font-serif font-bold text-carmel-brown">
          {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
      </div>

      <Card className="bg-white border-none shadow-xl">
        <div className="space-y-6">
          {/* Gospel */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-carmel-gold" size={20} />
              <h3 className="font-serif font-bold text-lg text-carmel-brown">Evangelho</h3>
            </div>
            <p className="text-sm font-bold text-carmel-brown/60 mb-2">{liturgy.gospel}</p>
            <div className="p-4 bg-carmel-beige/30 rounded-lg italic text-carmel-brown/80 border-l-2 border-carmel-gold">
               (Texto do Evangelho carregado dinamicamente ou inserido pelo admin...)
            </div>
          </div>

          {/* Readings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <h4 className="font-bold text-carmel-brown text-sm mb-1">1ª Leitura</h4>
                <p className="text-carmel-brown/70 text-sm">{liturgy.reading1}</p>
             </div>
             <div>
                <h4 className="font-bold text-carmel-brown text-sm mb-1">Salmo</h4>
                <p className="text-carmel-brown/70 text-sm">{liturgy.psalm}</p>
             </div>
          </div>

          {/* Reflection */}
          <div className="pt-4 border-t border-gray-100">
             <h3 className="font-serif font-bold text-lg text-carmel-brown mb-2">Reflexão</h3>
             <p className="text-carmel-brown/90 leading-relaxed text-sm text-justify">
               {liturgy.reflection}
             </p>
          </div>
          
          {/* Video */}
          {liturgy.video_url && (
            <div className="pt-2">
               <ButtonSecondary className="w-full" onClick={() => window.open(liturgy.video_url, '_blank')}>
                 <Youtube size={18} /> Assistir Homilia
               </ButtonSecondary>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};