
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ListMusic, Edit, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, SectionTitle, ButtonSecondary, Badge, Input, ButtonPrimary } from '../components/UI';
import { atualizarDados } from '../services/firestoreService';
import { Meeting } from '../types';

interface MeetingItemProps {
  meeting: Meeting;
  isPast: boolean;
  getMemberById: (id: string) => any;
  navigate: (path: string) => void;
  onEdit: (meeting: Meeting) => void;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting, isPast, getMemberById, navigate, onEdit }) => {
  const host = getMemberById(meeting.host_couple_id);
  const hostName = host ? `${host.husband_name} e ${host.wife_name}` : 'Anfitrião Desconhecido';

  return (
    <Card className={`mb-4 relative ${isPast ? 'opacity-80 grayscale-[0.3]' : ''}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(meeting); }}
        className="absolute top-2 right-2 p-2 text-carmel-brown/50 hover:text-carmel-brown bg-white/50 rounded-full"
      >
        <Edit size={16} />
      </button>

      <div className="flex justify-between items-start mb-2 pr-8">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-carmel-gold uppercase tracking-wider">
            {new Date(meeting.date).toLocaleDateString('pt-BR', { weekday: 'long' })}
          </span>
          <span className="text-xl font-serif font-bold text-carmel-brown">
            {new Date(meeting.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <Badge color={isPast ? 'bg-gray-200' : 'bg-carmel-blue'}>
          {meeting.time}
        </Badge>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-lg text-carmel-brown mb-1">{hostName}</h3>
        <p className="text-sm text-carmel-brown/70 flex items-start gap-1">
          <MapPin size={14} className="mt-1 shrink-0" />
          {meeting.address}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {meeting.geo_lat && meeting.geo_lng && (
          <>
            <ButtonSecondary onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${meeting.geo_lat},${meeting.geo_lng}`, '_blank')} className="text-xs py-1">
               Google Maps
            </ButtonSecondary>
            <ButtonSecondary onClick={() => window.open(`https://waze.com/ul?ll=${meeting.geo_lat},${meeting.geo_lng}&navigate=yes`, '_blank')} className="text-xs py-1">
              <Navigation size={12} /> Waze
            </ButtonSecondary>
          </>
        )}
        
        <ButtonSecondary onClick={() => navigate(`/playlist/${meeting.meeting_id}`)} className="text-xs py-1 border-carmel-gold text-carmel-brown">
          <ListMusic size={12} /> Playlist
        </ButtonSecondary>
      </div>
    </Card>
  );
};

export const Meetings = () => {
  const { meetings, members, getMemberById, updateMeeting } = useApp();
  const navigate = useNavigate();
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Sort: Future first (asc), then Past (desc)
  const now = new Date();
  const futureMeetings = meetings
    .filter(m => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastMeetings = meetings
    .filter(m => new Date(m.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditClick = (meeting: Meeting) => {
    setEditingMeeting({ ...meeting });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingMeeting) return;
    
    if (!editingMeeting.date || !editingMeeting.host_couple_id) {
       alert("Data e Anfitrião são obrigatórios.");
       return;
    }

    // Try to auto-update coords if address/host changed? 
    // For now, keep simple editing. If host changes, user might want to manually update address.
    // If we wanted to be smart, we could lookup host address from members list.
    let updatedData = { ...editingMeeting };
    
    // Auto-fill address from Host if address is empty or if host changed (optional logic, sticking to explicit edit)
    // Here we just save what is in the form.

    try {
       await atualizarDados('meetings', editingMeeting.meeting_id, {
          date: editingMeeting.date,
          time: editingMeeting.time,
          host_couple_id: editingMeeting.host_couple_id,
          address: editingMeeting.address,
          notes: editingMeeting.notes
       });

       updateMeeting(editingMeeting);
       alert("Reunião atualizada com sucesso!");
       setIsEditModalOpen(false);
       setEditingMeeting(null);
    } catch (e) {
       console.error("Erro ao atualizar reunião", e);
       alert("Erro ao salvar alterações.");
    }
  };

  const handleHostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     if(!editingMeeting) return;
     const newHostId = e.target.value;
     const newHost = members.find(m => m.member_id === newHostId);
     
     // Auto-fill address when host changes
     setEditingMeeting({
        ...editingMeeting, 
        host_couple_id: newHostId,
        address: newHost ? `${newHost.address}, ${newHost.neighborhood}` : editingMeeting.address
     });
  };

  return (
    <div className="relative">
      <SectionTitle>Próximas Reuniões</SectionTitle>
      {futureMeetings.length > 0 ? (
        futureMeetings.map(m => (
          <MeetingItem 
            key={m.meeting_id} 
            meeting={m} 
            isPast={false} 
            getMemberById={getMemberById}
            navigate={navigate}
            onEdit={handleEditClick}
          />
        ))
      ) : (
        <p className="text-carmel-brown/60 mb-8 italic">Nenhuma reunião futura agendada.</p>
      )}

      <div className="my-8 border-t border-carmel-brown/10"></div>

      <SectionTitle>Reuniões Anteriores</SectionTitle>
      {pastMeetings.length > 0 ? (
        pastMeetings.map(m => (
          <MeetingItem 
            key={m.meeting_id} 
            meeting={m} 
            isPast={true} 
            getMemberById={getMemberById}
            navigate={navigate}
            onEdit={handleEditClick}
          />
        ))
      ) : (
        <p className="text-carmel-brown/60 italic">Nenhum histórico disponível.</p>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">Editar Reunião</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Data</label>
                  <Input 
                    type="date"
                    value={editingMeeting.date.split('T')[0]}
                    onChange={(e) => setEditingMeeting({...editingMeeting, date: new Date(e.target.value).toISOString()})}
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Horário</label>
                  <Input 
                    type="time"
                    value={editingMeeting.time}
                    onChange={(e) => setEditingMeeting({...editingMeeting, time: e.target.value})}
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Anfitrião</label>
                  <select 
                     className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown focus:outline-none focus:ring-2 focus:ring-carmel-gold"
                     value={editingMeeting.host_couple_id}
                     onChange={handleHostChange}
                  >
                     <option value="">Selecione...</option>
                     {members.map(m => (
                        <option key={m.member_id} value={m.member_id}>{m.husband_name} e {m.wife_name}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Endereço</label>
                  <Input 
                    value={editingMeeting.address}
                    onChange={(e) => setEditingMeeting({...editingMeeting, address: e.target.value})}
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Observações</label>
                  <Input 
                    value={editingMeeting.notes}
                    onChange={(e) => setEditingMeeting({...editingMeeting, notes: e.target.value})}
                  />
               </div>

               <ButtonPrimary onClick={handleUpdate} className="w-full mt-4">
                  <Save size={18} /> Salvar Alterações
               </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
