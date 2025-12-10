
import React, { useState } from 'react';
import { Heart, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { salvarDados } from '../services/firestoreService';
import { Card, SectionTitle, Input, ButtonPrimary, Badge } from '../components/UI';

export const Prayers = () => {
  const { prayers, addPrayer, likePrayer } = useApp();
  const [newRequest, setNewRequest] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Saúde');

  const handleSave = async () => {
    if (!newRequest.trim() || !name.trim()) return;
    
    const prayerData = {
      name,
      request_text: newRequest,
      category: category as any,
      date: new Date().toISOString(),
      likes: 0
    };

    try {
      const docRef = await salvarDados('prayers', prayerData);
      
      // Update local state with the new ID from Firestore
      addPrayer({
        ...prayerData,
        prayer_id: docRef.id
      });
      
      alert("Dados salvos com sucesso!");
      setNewRequest('');
      setName('');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados.");
    }
  };

  return (
    <div>
      <SectionTitle>Mural de Oração</SectionTitle>

      <Card className="mb-8 bg-carmel-brown/5 border-dashed border-2 border-carmel-brown/20">
        <h3 className="font-serif font-bold text-carmel-brown mb-2 text-center">Deixe seu pedido</h3>
        <div className="space-y-3">
          <Input 
            placeholder="Seu nome" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown focus:outline-none focus:ring-2 focus:ring-carmel-gold"
          >
            <option value="Saúde">Saúde</option>
            <option value="Família">Família</option>
            <option value="Jovens">Jovens</option>
            <option value="Gratidão">Gratidão</option>
            <option value="Libertação">Libertação</option>
          </select>
          <textarea 
            placeholder="Descreva seu pedido de oração..."
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown placeholder-carmel-brown/50 focus:outline-none focus:ring-2 focus:ring-carmel-gold h-24 resize-none"
          />
          <ButtonPrimary onClick={handleSave} className="w-full" disabled={!name || !newRequest}>
            <Save size={18} /> Salvar
          </ButtonPrimary>
        </div>
      </Card>

      <div className="space-y-4">
        {prayers.map(prayer => (
          <Card key={prayer.prayer_id} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Heart size={100} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-carmel-brown">{prayer.name}</span>
                  <span className="text-xs text-carmel-brown/50">{new Date(prayer.date).toLocaleDateString()}</span>
                </div>
                <Badge>{prayer.category}</Badge>
              </div>
              
              <p className="text-carmel-brown mb-4 italic font-serif">
                "{prayer.request_text}"
              </p>
              
              <button 
                onClick={() => likePrayer(prayer.prayer_id)}
                className="flex items-center gap-2 text-sm text-carmel-gold font-bold hover:text-carmel-brown transition-colors"
              >
                <Heart size={16} fill={prayer.likes > 0 ? "currentColor" : "none"} />
                {prayer.likes} {prayer.likes === 1 ? 'pessoa rezando' : 'pessoas rezando'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
