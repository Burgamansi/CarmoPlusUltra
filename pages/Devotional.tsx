import React from 'react';
import { SectionTitle, Card } from '../components/UI';

export const Devotional = () => {
  return (
    <div className="space-y-6">
      <SectionTitle>Devocional</SectionTitle>

      <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg relative mb-4">
         <img src="https://picsum.photos/800/400?grayscale" alt="Nossa Senhora" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-carmel-brown/40 flex items-center justify-center">
            <h2 className="text-3xl font-serif font-bold text-carmel-beige text-center px-4">Flor do Carmelo</h2>
         </div>
      </div>

      <Card>
         <h3 className="font-serif font-bold text-xl text-carmel-brown mb-2">Oração do Escapulário</h3>
         <p className="italic text-carmel-brown/80 leading-relaxed text-justify">
            Santíssima Virgem do Carmo, revestido de vosso Escapulário, peço-vos que ele seja para mim sinal de vossa maternal proteção, em todas as necessidades, nos perigos e nas aflições da vida. Acompanhai-me com vossa intercessão, para que eu possa crescer na fé, na esperança e na caridade, seguindo a Jesus e praticando a Sua Palavra. Amém.
         </p>
      </Card>

      <Card>
         <h3 className="font-serif font-bold text-xl text-carmel-brown mb-2">Consagração</h3>
         <p className="italic text-carmel-brown/80 leading-relaxed text-justify">
            Ó Senhora minha, ó minha Mãe! Eu me ofereço todo a vós, e em prova da minha devoção para convosco, vos consagro neste dia os meus olhos, os meus ouvidos, a minha boca, o meu coração e inteiramente todo o meu ser. E porque assim sou vosso, ó incomparável Mãe, guardai-me e defendei-me como coisa e propriedade vossa. Amém.
         </p>
      </Card>
    </div>
  );
};