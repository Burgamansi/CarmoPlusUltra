
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  ListMusic,
  Edit,
  X,
  Save,
  PlaySquare,
  Info as InfoIcon
} from 'lucide-react';
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
  onView?: (meeting: Meeting) => void;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting, isPast, getMemberById, navigate, onEdit, onView }) => {
  const host = getMemberById(meeting.host_couple_id);
  const hostName = host ? `${host.husband_name} e ${host.wife_name}` : 'Anfitrião Desconhecido';
  const theme = meeting.theme || '';
  const status = meeting.status || '';
  const songsCount = meeting.music_list ? meeting.music_list.length : 0;

  return (
    <Card className={`mb-4 relative ${isPast ? 'opacity-80 grayscale-[0.3]' : ''}`}>
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onView && onView(meeting); }}
          className="p-2 text-carmel-brown/50 hover:text-carmel-brown bg-white/50 rounded-full"
          title="Ver"
        >
          <InfoIcon size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(meeting); }}
          className="p-2 text-carmel-brown/50 hover:text-carmel-brown bg-white/50 rounded-full"
          title="Editar"
        >
          <Edit size={16} />
        </button>
      </div>

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

      <div className="mb-2">
        <h3 className="font-bold text-lg text-carmel-brown mb-1 flex items-center gap-2">
          {hostName}
          {status && <Badge color="bg-carmel-gold" className="text-xs">{status}</Badge>}
        </h3>
        <p className="text-sm text-carmel-brown/70 flex items-start gap-1">
          <MapPin size={14} className="mt-1 shrink-0" />
          {meeting.address}
        </p>
      </div>

      {theme && <p className="text-sm italic text-carmel-brown mb-1">Tema: {theme}</p>}
      {meeting.notes && <p className="text-xs text-carmel-brown/60 mb-2">{meeting.notes}</p>}

      <div className="flex flex-wrap gap-2 items-center">
        {songsCount > 0 && (
          <Badge color="bg-carmel-gold" className="text-xs">{songsCount} músicas</Badge>
        )}
        {!isPast && (
          <ButtonSecondary onClick={() => navigate(`/playlist/${meeting.meeting_id}`)} className="text-xs py-1 border-carmel-gold text-carmel-brown">
            <ListMusic size={12} /> Playlist
          </ButtonSecondary>
        )}
        {onView && (
          <ButtonSecondary onClick={() => onView(meeting)} className="text-xs py-1">
            Ver detalhes
          </ButtonSecondary>
        )}
      </div>
    </Card>
  );
};

export const Meetings = () => {
  const { meetings, members, songs, getMemberById, updateMeeting, addMeeting } = useApp();
  const navigate = useNavigate();
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewOnly, setViewOnly] = useState(false);

  // Compute lists
  const now = new Date();
  const sortedFuture = meetings
    .filter(m => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextMeeting = sortedFuture[0] || null;
  const upcomingMeetings = sortedFuture.slice(1);

  const pastMeetings = meetings
    .filter(m => new Date(m.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const emptyMeeting: Meeting = {
    meeting_id: '',
    date: new Date().toISOString(),
    time: '',
    host_couple_id: '',
    address: '',
    notes: '',
    theme: '',
    content: '',
    status: '',
    music_list: []
  };

  const openNewModal = () => {
    setEditingMeeting({ ...emptyMeeting });
    setViewOnly(false);
    setIsEditModalOpen(true);
  };

  const normalize = (m: Meeting) => ({
    ...m,
    music_list: m.music_list || [],
  });

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(normalize(meeting));
    setViewOnly(false);
    setIsEditModalOpen(true);
  };

  const openViewModal = (meeting: Meeting) => {
    setEditingMeeting(normalize(meeting));
    setViewOnly(true);
    setIsEditModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingMeeting) return;
    if (!editingMeeting.date || !editingMeeting.host_couple_id) {
      alert('Data e Anfitrião são obrigatórios.');
      return;
    }

    try {
      if (editingMeeting.meeting_id) {
        // existing
        await atualizarDados('meetings', editingMeeting.meeting_id, {
          date: editingMeeting.date,
          time: editingMeeting.time,
          host_couple_id: editingMeeting.host_couple_id,
          address: editingMeeting.address,
          notes: editingMeeting.notes,
          theme: editingMeeting.theme,
          content: editingMeeting.content,
          status: editingMeeting.status,
          music_list: editingMeeting.music_list || []
        });
        updateMeeting(editingMeeting);
        alert('Reunião atualizada com sucesso!');
      } else {
        // new
        const newId = Date.now().toString();
        const toSave = { ...editingMeeting, meeting_id: newId };
        addMeeting(toSave);
        // optionally send to server later
        alert('Nova reunião criada!');
      }
      setIsEditModalOpen(false);
      setEditingMeeting(null);
      setViewOnly(false);
    } catch (e) {
      console.error('Erro ao salvar reunião', e);
      alert('Erro ao salvar reunião.');
    }
  };

  const handleHostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     if(!editingMeeting) return;
     const newHostId = e.target.value;
     const newHost = members.find(m => m.member_id === newHostId);
     setEditingMeeting({
        ...editingMeeting, 
        host_couple_id: newHostId,
        address: newHost ? `${newHost.address}, ${newHost.neighborhood}` : editingMeeting.address
     });
  };

  const handleSongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editingMeeting) return;
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setEditingMeeting({ ...editingMeeting, music_list: selected });
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <SectionTitle>Reuniões</SectionTitle>
          <p className="text-sm text-carmel-brown/60">Gerencie encontros futuros, revise os passados e planeje com antecedência.</p>
        </div>
        <ButtonPrimary onClick={openNewModal} className="flex items-center gap-2">
          <PlaySquare size={16} /> Nova Reunião
        </ButtonPrimary>
      </div>

      {nextMeeting && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-carmel-brown mb-2">Próxima Reunião</h4>
          <div className="border-2 border-carmel-blue rounded-lg p-1">
            <MeetingItem
              key={nextMeeting.meeting_id}
              meeting={nextMeeting}
              isPast={false}
              getMemberById={getMemberById}
              navigate={navigate}
              onEdit={openEditModal}
              onView={openViewModal}
            />
          </div>
        </div>
      )}

      {upcomingMeetings.length > 0 && (
        <>
          <SectionTitle>Outras Futuras</SectionTitle>
          {upcomingMeetings.map(m => (
            <MeetingItem
              key={m.meeting_id}
              meeting={m}
              isPast={false}
              getMemberById={getMemberById}
              navigate={navigate}
              onEdit={openEditModal}
              onView={openViewModal}
            />
          ))}
        </>
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
            onEdit={openEditModal}
            onView={openViewModal}
          />
        ))
      ) : (
        <p className="text-carmel-brown/60 italic">Nenhum histórico disponível.</p>
      )}

      {/* Modal */}
      {isEditModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => { setIsEditModalOpen(false); setViewOnly(false); }}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">
                {viewOnly ? 'Detalhes da Reunião' : editingMeeting.meeting_id ? 'Editar Reunião' : 'Nova Reunião'}
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setViewOnly(false); }} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
               {/* date/time */}
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Data</label>
                  <Input 
                    type="date"
                    disabled={viewOnly}
                    value={editingMeeting.date.split('T')[0]}
                    onChange={(e) => setEditingMeeting({...editingMeeting, date: new Date(e.target.value).toISOString()})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Horário</label>
                  <Input 
                    type="time"
                    disabled={viewOnly}
                    value={editingMeeting.time}
                    onChange={(e) => setEditingMeeting({...editingMeeting, time: e.target.value})}
                  />
               </div>

               {/* host */}
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Anfitrião</label>
                  <select 
                     disabled={viewOnly}
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
                    disabled={viewOnly}
                    value={editingMeeting.address}
                    onChange={(e) => setEditingMeeting({...editingMeeting, address: e.target.value})}
                  />
               </div>

               {/* additional fields */}
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Tema</label>
                  <Input
                    disabled={viewOnly}
                    value={editingMeeting.theme || ''}
                    onChange={(e) => setEditingMeeting({...editingMeeting, theme: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Conteúdo</label>
                  <Input
                    disabled={viewOnly}
                    value={editingMeeting.content || ''}
                    onChange={(e) => setEditingMeeting({...editingMeeting, content: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Status</label>
                  <select
                     disabled={viewOnly}
                     className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown focus:outline-none focus:ring-2 focus:ring-carmel-gold"
                     value={editingMeeting.status || ''}
                     onChange={(e) => setEditingMeeting({...editingMeeting, status: e.target.value})}
                  >
                     <option value="">--</option>
                     <option value="Confirmado">Confirmado</option>
                     <option value="Cancelado">Cancelado</option>
                     <option value="Em espera">Em espera</option>
                     <option value="Realizado">Realizado</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Músicas</label>
                  <select
                     disabled={viewOnly}
                     multiple
                     className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown h-32 focus:outline-none focus:ring-2 focus:ring-carmel-gold"
                     value={editingMeeting.music_list || []}
                     onChange={handleSongChange}
                  >
                     {songs.length > 0 ? (
                        songs.map(s => (
                          <option key={s.song_id} value={s.song_id}>{s.title}</option>
                        ))
                    ) : (
                        <option disabled>nenhuma música cadastrada</option>
                    )}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Observações</label>
                  <Input 
                    disabled={viewOnly}
                    value={editingMeeting.notes}
                    onChange={(e) => setEditingMeeting({...editingMeeting, notes: e.target.value})}
                  />
               </div>

               {!viewOnly && (
                 <ButtonPrimary onClick={handleSubmit} className="w-full mt-4">
                   <Save size={18} /> {editingMeeting.meeting_id ? 'Salvar Alterações' : 'Criar Reunião'}
                 </ButtonPrimary>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
