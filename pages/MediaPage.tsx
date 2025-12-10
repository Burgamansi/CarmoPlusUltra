
import React, { useState } from 'react';
import { Youtube, Plus, X, Save } from 'lucide-react';
import { Card, SectionTitle, ButtonSecondary, ButtonPrimary, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { salvarDados } from '../services/firestoreService';

export const MediaPage = () => {
  const { media, addMedia } = useApp();
  
  // Filter only videos from the global media state
  const videos = media.filter(item => item.type === 'video');

  // State for Modal and Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', description: '' });

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleSave = async () => {
    if (!newVideo.title || !newVideo.url) {
      alert("Por favor, preencha o título e a URL do vídeo.");
      return;
    }

    const videoData = {
        type: 'video',
        title: newVideo.title,
        url: newVideo.url,
        description: newVideo.description,
        date: new Date().toISOString(),
        caption: newVideo.title // Fallback for gallery compatibility
    };

    try {
        const docRef = await salvarDados('media', videoData);

        addMedia({
            ...videoData,
            media_id: docRef.id,
            type: 'video' // Ensure strict typing match
        });

        alert("Dados salvos com sucesso!");
        setNewVideo({ title: '', url: '', description: '' });
        setIsModalOpen(false);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar dados.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <SectionTitle>Vídeos e Conteúdos</SectionTitle>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-carmel-brown text-white p-2 rounded-full shadow-md active:scale-95 transition-transform"
          title="Adicionar Vídeo"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="space-y-6">
        {videos.map((video) => {
           const embedSrc = getEmbedUrl(video.url);
           return (
              <Card key={video.media_id} className="overflow-hidden">
                 <h3 className="font-serif font-bold text-lg text-carmel-brown mb-2">{video.title || video.caption}</h3>
                 
                 {embedSrc ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-black shadow-inner">
                       <iframe 
                         width="100%" 
                         height="100%" 
                         src={embedSrc} 
                         title={video.title || video.caption}
                         frameBorder="0"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                         className="w-full h-full"
                       />
                    </div>
                 ) : (
                    <div className="aspect-video w-full bg-carmel-brown/10 flex items-center justify-center rounded-lg mb-3">
                       <p className="text-sm text-carmel-brown/60">Vídeo indisponível</p>
                    </div>
                 )}

                 <p className="text-carmel-brown/80 text-sm mb-4 leading-relaxed">
                    {video.description}
                 </p>

                 <ButtonSecondary onClick={() => window.open(video.url, '_blank')} className="w-full">
                    <Youtube size={18} /> Abrir no YouTube
                 </ButtonSecondary>
              </Card>
           );
        })}
      </div>
      
      {videos.length === 0 && (
         <div className="text-center py-10 text-carmel-brown/50 italic">
            Nenhum conteúdo disponível no momento.
         </div>
      )}

      {/* Add Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">Adicionar Novo Vídeo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Título</label>
                <Input 
                  placeholder="Ex: Homilia de Domingo"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Link do YouTube</label>
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Descrição</label>
                <textarea 
                  className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown placeholder-carmel-brown/50 focus:outline-none focus:ring-2 focus:ring-carmel-gold h-24 resize-none"
                  placeholder="Breve descrição do conteúdo..."
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                />
              </div>

              <ButtonPrimary onClick={handleSave} className="w-full mt-2">
                <Save size={18} /> Salvar
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
