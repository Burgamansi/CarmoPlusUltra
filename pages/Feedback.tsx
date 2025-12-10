
import React, { useState } from 'react';
import { Star, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { salvarDados } from '../services/firestoreService';
import { Card, SectionTitle, ButtonPrimary, Input } from '../components/UI';

export const FeedbackPage = () => {
  const { meetings, addFeedback } = useApp();
  const [rating, setRating] = useState(0);
  const [meetingId, setMeetingId] = useState(meetings[0]?.meeting_id || '');
  const [comments, setComments] = useState('');

  const handleSave = async () => {
    const feedbackData = {
       meeting_id: meetingId,
       rating,
       positives: comments,
       improvements: '',
       suggestions: '',
       date: new Date().toISOString()
    };

    try {
       const docRef = await salvarDados('feedbacks', feedbackData);
       
       addFeedback({
         ...feedbackData,
         id: docRef.id
       });
       
       alert('Dados salvos com sucesso!');
       setRating(0);
       setComments('');
    } catch (error) {
       console.error("Erro ao salvar:", error);
       alert("Erro ao salvar dados.");
    }
  };

  return (
    <div>
      <SectionTitle>Avaliação do Encontro</SectionTitle>
      
      <Card>
         <div className="mb-4">
            <label className="block text-sm font-bold text-carmel-brown mb-2">Qual reunião?</label>
            <select 
               className="w-full border border-carmel-gold/50 rounded-lg p-2"
               value={meetingId}
               onChange={(e) => setMeetingId(e.target.value)}
            >
               {meetings.map(m => (
                  <option key={m.meeting_id} value={m.meeting_id}>
                     {new Date(m.date).toLocaleDateString()} - Casa de {m.host_couple_id}
                  </option>
               ))}
            </select>
         </div>

         <div className="mb-6 text-center">
            <label className="block text-sm font-bold text-carmel-brown mb-2">Sua nota</label>
            <div className="flex justify-center gap-2">
               {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)}>
                     <Star 
                        size={32} 
                        fill={star <= rating ? '#CDAA7D' : 'none'} 
                        className={star <= rating ? 'text-carmel-gold' : 'text-gray-300'} 
                     />
                  </button>
               ))}
            </div>
         </div>

         <div className="mb-4">
             <label className="block text-sm font-bold text-carmel-brown mb-2">Comentários (Opcional)</label>
             <textarea 
               className="w-full border border-carmel-gold/50 rounded-lg p-2 h-24"
               value={comments}
               onChange={(e) => setComments(e.target.value)}
               placeholder="O que você achou?"
             />
         </div>

         <ButtonPrimary onClick={handleSave} className="w-full" disabled={rating === 0}>
            <Save size={18} /> Salvar
         </ButtonPrimary>
      </Card>
    </div>
  );
};
