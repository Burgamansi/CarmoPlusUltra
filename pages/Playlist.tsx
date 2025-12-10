import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Music, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, SectionTitle, ButtonPrimary, Badge } from '../components/UI';

export const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMeetingById, getSongById } = useApp();
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  const meeting = id ? getMeetingById(id) : null;
  const songs = meeting ? meeting.music_list.map(sId => getSongById(sId)).filter(Boolean) as any[] : [];

  if (!meeting) return <div className="p-4">Reunião não encontrada.</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 text-carmel-brown/60 hover:text-carmel-brown flex items-center gap-1 text-sm font-bold">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mb-6">
        <h2 className="font-serif font-bold text-2xl text-carmel-brown">Playlist do Encontro</h2>
        <p className="text-carmel-gold">{new Date(meeting.date).toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="space-y-4">
        {songs.map((song, index) => (
          <Card key={song.song_id} className={`transition-all ${activeSongId === song.song_id ? 'ring-2 ring-carmel-gold' : ''}`}>
            <div className="flex justify-between items-start mb-3">
               <div>
                  <div className="flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-carmel-brown text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                     </span>
                     <h3 className="font-bold text-carmel-brown">{song.title}</h3>
                  </div>
                  <p className="text-xs text-carmel-brown/60 mt-1 pl-8">{song.category} • Tom: {song.tone}</p>
               </div>
               <button 
                 onClick={() => setActiveSongId(activeSongId === song.song_id ? null : song.song_id)}
                 className="text-carmel-gold hover:text-carmel-brown"
               >
                 {activeSongId === song.song_id ? 'Fechar' : 'Ver Cifra'}
               </button>
            </div>

            {/* In-place lyrics/chords view */}
            {activeSongId === song.song_id && (
              <div className="bg-gray-50 p-4 rounded-lg mt-2 font-mono text-sm whitespace-pre-wrap border border-gray-100">
                <div className="text-xs font-bold text-carmel-gold uppercase mb-2">Cifras</div>
                {song.chords}
                <div className="h-4"></div>
                {song.youtube_url && (
                    <a href={song.youtube_url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs block mt-2">
                        Ouvir no YouTube
                    </a>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {songs.length === 0 && (
         <p className="text-center text-carmel-brown/50 italic mt-8">Nenhuma música selecionada para este encontro.</p>
      )}
    </div>
  );
};