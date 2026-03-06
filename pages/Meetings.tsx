
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ListMusic,
  PlaySquare,
  Info as InfoIcon,
  Edit
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, SectionTitle, ButtonSecondary, ButtonPrimary, Badge } from '../components/UI';
import { Meeting } from '../types';


interface MeetingItemProps {
  meeting: Meeting;
  isPast: boolean;
  getMemberById: (id: string) => any;
  navigate: (path: string) => void;
  onEdit?: (meeting: Meeting) => void;
  onView?: (meeting: Meeting) => void;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting, isPast, getMemberById, navigate, onEdit, onView }) => {
  const theme = meeting.theme || '';
  const status = meeting.status || '';
  const songsCount = meeting.music_list ? meeting.music_list.length : 0;
  const meetingSongsCount = meeting.meeting_songs ? meeting.meeting_songs.length : 0;

  const host = getMemberById(meeting.host_couple_id);
  const hostName = host ? `${host.husband_name} e ${host.wife_name}` : 'Anfitrião Desconhecido';

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
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(meeting); }}
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
        {meetingSongsCount > 0 && (
          <Badge color="bg-carmel-blue" className="text-xs">{meetingSongsCount} músicas do encontro</Badge>
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
  const { meetings = [], members = [], getMemberById } = useApp();
  const navigate = useNavigate();

  const safeMeetings = Array.isArray(meetings) ? meetings : [];
  const now = new Date();
  const future = safeMeetings.filter(m => new Date(m.date).getTime() >= now.getTime());
  const past = safeMeetings.filter(m => new Date(m.date).getTime() < now.getTime());
  const nextMeeting = future[0] || null;
  const upcoming = future.slice(1);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>Reuniões</SectionTitle>
        <ButtonPrimary onClick={() => navigate('/admin')} className="flex items-center gap-2">
          <PlaySquare size={16} /> Nova Reunião
        </ButtonPrimary>
      </div>

      {nextMeeting && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-carmel-brown mb-2">Próxima Reunião</h4>
          <MeetingItem
            key={nextMeeting.meeting_id}
            meeting={nextMeeting}
            isPast={false}
            getMemberById={getMemberById}
            navigate={navigate}
          />
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionTitle>Outras Futuras</SectionTitle>
          {upcoming.map(m => (
            <MeetingItem
              key={m.meeting_id}
              meeting={m}
              isPast={false}
              getMemberById={getMemberById}
              navigate={navigate}
            />
          ))}
        </>
      )}

      <div className="my-8 border-t border-carmel-brown/10"></div>

      <SectionTitle>Reuniões Anteriores</SectionTitle>
      {past.length > 0 ? (
        past.map(m => (
          <MeetingItem
            key={m.meeting_id}
            meeting={m}
            isPast={true}
            getMemberById={getMemberById}
            navigate={navigate}
          />
        ))
      ) : (
        <p className="text-carmel-brown/60 italic">Nenhum histórico disponível.</p>
      )}
    </div>
  );
};

