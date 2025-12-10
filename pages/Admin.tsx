
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { salvarDados } from '../services/firestoreService';
import { Card, SectionTitle, ButtonPrimary, Input } from '../components/UI';

export const Admin = () => {
  const { members, meetings, addMeeting } = useApp();
  const [activeTab, setActiveTab] = useState<'meetings' | 'members'>('meetings');
  
  // Simple form state for new meeting
  const [newMeeting, setNewMeeting] = useState({
     date: '',
     time: '',
     hostId: members[0]?.member_id || '',
     address: ''
  });

  const handleSave = async () => {
    if (!newMeeting.date || !newMeeting.hostId) return;

    const meetingData = {
       date: new Date(newMeeting.date).toISOString(),
       time: newMeeting.time,
       host_couple_id: newMeeting.hostId,
       address: newMeeting.address,
       music_list: [],
       notes: ''
    };

    try {
        const docRef = await salvarDados('meetings', meetingData);
        
        addMeeting({
           ...meetingData,
           meeting_id: docRef.id
        });
        
        alert('Dados salvos com sucesso!');
        setNewMeeting({ date: '', time: '', hostId: members[0]?.member_id || '', address: '' });
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar dados.");
    }
  };

  return (
    <div>
      <SectionTitle>Administração</SectionTitle>
      
      <div className="flex gap-2 mb-6 border-b border-carmel-brown/20 pb-2">
        <button 
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 font-bold text-sm rounded-lg ${activeTab === 'meetings' ? 'bg-carmel-brown text-white' : 'text-carmel-brown'}`}
        >
          Reuniões
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 font-bold text-sm rounded-lg ${activeTab === 'members' ? 'bg-carmel-brown text-white' : 'text-carmel-brown'}`}
        >
          Membros
        </button>
      </div>

      {activeTab === 'meetings' && (
        <div className="space-y-6">
           <Card>
              <h3 className="font-bold text-carmel-brown mb-4">Nova Reunião</h3>
              <div className="space-y-3">
                 <Input 
                   type="date" 
                   value={newMeeting.date} 
                   onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} 
                 />
                 <Input 
                   type="time" 
                   value={newMeeting.time} 
                   onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} 
                 />
                 <select 
                   className="w-full border border-carmel-gold/50 rounded-lg px-4 py-2"
                   value={newMeeting.hostId}
                   onChange={e => setNewMeeting({...newMeeting, hostId: e.target.value})}
                 >
                    {members.map(m => (
                       <option key={m.member_id} value={m.member_id}>{m.husband_name} e {m.wife_name}</option>
                    ))}
                 </select>
                 <Input 
                   placeholder="Endereço" 
                   value={newMeeting.address} 
                   onChange={e => setNewMeeting({...newMeeting, address: e.target.value})} 
                 />
                 <ButtonPrimary onClick={handleSave}>
                    <Save size={18} /> Salvar
                 </ButtonPrimary>
              </div>
           </Card>

           <div className="space-y-2">
              <h4 className="font-bold text-sm text-carmel-brown/60 uppercase">Agendadas</h4>
              {meetings.map(m => (
                 <div key={m.meeting_id} className="bg-white p-3 rounded border border-gray-200 flex justify-between">
                    <span>{new Date(m.date).toLocaleDateString()}</span>
                    <span className="font-bold">{m.time}</span>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'members' && (
         <div className="text-center py-8 text-carmel-brown/60">
            Funcionalidade de gestão de membros (CRUD) seria implementada aqui.
         </div>
      )}
    </div>
  );
};
