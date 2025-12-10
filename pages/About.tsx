import React from 'react';
import { SectionTitle, Card, ButtonSecondary } from '../components/UI';

export const About = () => {
  return (
    <div className="space-y-6">
      <SectionTitle>Sobre o Grupo</SectionTitle>

      <Card className="bg-carmel-brown text-carmel-beige text-center py-8">
        <h2 className="text-2xl font-serif font-bold mb-2">Carmo+ Ultra</h2>
        <p className="text-sm opacity-80 mb-6">Grupo Nossa Senhora do Carmo</p>
        <p className="italic text-carmel-gold">"O zelo por tua casa me consome."</p>
      </Card>

      <div className="prose prose-sm text-carmel-brown">
         <h3 className="font-serif font-bold text-lg mb-2">Nossa Missão</h3>
         <p className="mb-4">
            Reunir casais e famílias sob a proteção da Virgem do Carmo, buscando a santificação através da oração, da partilha e da vivência comunitária.
         </p>

         <h3 className="font-serif font-bold text-lg mb-2">Coordenação Atual</h3>
         <p>José e Maria</p>
      </div>

      <ButtonSecondary className="w-full" onClick={() => window.open('https://wa.me/', '_blank')}>
         Fale Conosco (WhatsApp)
      </ButtonSecondary>
    </div>
  );
};