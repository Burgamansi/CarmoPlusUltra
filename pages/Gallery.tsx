
import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus, Camera, Video, Calendar, MapPin, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionTitle, Input, ButtonPrimary, ButtonSecondary } from '../components/UI';
import { salvarDados } from '../services/firestoreService';

export const Gallery = () => {
  const { media, meetings, addMedia, getMeetingById } = useApp();
  const [selectedMeetingFilter, setSelectedMeetingFilter] = useState<string | null>(null);
  const [viewingMedia, setViewingMedia] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload State
  const [newItem, setNewItem] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    caption: '',
    meeting_id: '',
    date: new Date().toISOString().split('T')[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Media
  const filteredMedia = selectedMeetingFilter
    ? media.filter(m => m.meeting_id === selectedMeetingFilter)
    : media;

  // Handle File Upload (Convert to Base64 for Firestore storage without Bucket)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!newItem.url) {
        alert("Adicione uma imagem ou URL de vídeo.");
        return;
    }

    const mediaData = {
        ...newItem,
        date: new Date().toISOString(),
        media_id: Date.now().toString()
    };

    try {
        const docRef = await salvarDados('media', mediaData);
        addMedia({ ...mediaData, media_id: docRef.id });
        setIsUploadOpen(false);
        setNewItem({
            type: 'image',
            url: '',
            caption: '',
            meeting_id: '',
            date: new Date().toISOString().split('T')[0]
        });
        alert("Publicação adicionada com sucesso!");
    } catch (e) {
        console.error(e);
        alert("Erro ao publicar.");
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <div className="pb-20">
      {/* Header Style "Instagram Profile" */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div>
           <h2 className="font-serif font-bold text-xl text-carmel-brown">Galeria do Carmo</h2>
           <p className="text-xs text-carmel-brown/60">{media.length} publicações • {meetings.length} encontros</p>
        </div>
        <button 
           onClick={() => setIsUploadOpen(true)}
           className="bg-carmel-brown text-white p-2 rounded-lg shadow-md active:scale-95 transition-transform flex items-center gap-2"
        >
           <Plus size={18} /> <span className="text-xs font-bold">Publicar</span>
        </button>
      </div>

      {/* Stories / Filters (Horizontal Scroll) */}
      <div className="mb-6 overflow-x-auto hide-scrollbar pb-2">
         <div className="flex gap-4 px-2">
            {/* "All" Filter */}
            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setSelectedMeetingFilter(null)}>
               <div className={`w-16 h-16 rounded-full p-[2px] ${selectedMeetingFilter === null ? 'bg-gradient-to-tr from-carmel-gold to-carmel-brown' : 'bg-gray-200'}`}>
                  <div className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                     <ImageIcon size={24} className="text-carmel-brown" />
                  </div>
               </div>
               <span className={`text-[10px] font-bold truncate max-w-[70px] ${selectedMeetingFilter === null ? 'text-carmel-brown' : 'text-gray-400'}`}>
                  Todas
               </span>
            </div>

            {/* Meetings Filters */}
            {meetings.map(meeting => (
               <div key={meeting.meeting_id} className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setSelectedMeetingFilter(meeting.meeting_id)}>
                  <div className={`w-16 h-16 rounded-full p-[2px] ${selectedMeetingFilter === meeting.meeting_id ? 'bg-gradient-to-tr from-carmel-gold to-carmel-brown' : 'bg-carmel-brown/20'}`}>
                     <div className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden bg-carmel-beige">
                        <span className="text-xs font-serif font-bold text-carmel-brown">
                            {new Date(meeting.date).getDate()}/{new Date(meeting.date).getMonth() + 1}
                        </span>
                     </div>
                  </div>
                  <span className={`text-[10px] truncate max-w-[70px] ${selectedMeetingFilter === meeting.meeting_id ? 'font-bold text-carmel-brown' : 'text-gray-400'}`}>
                     {meeting.host_couple_id ? `Casa de ${meetings.find(m => m.meeting_id === meeting.meeting_id)?.host_couple_id?.split(' ')[0]}` : 'Encontro'}
                  </span>
               </div>
            ))}
         </div>
      </div>

      {/* Instagram Grid */}
      <div className="grid grid-cols-3 gap-0.5 md:gap-4 md:grid-cols-4">
        {filteredMedia.map((item) => (
          <div 
            key={item.media_id} 
            className="aspect-square relative group cursor-pointer bg-gray-100 overflow-hidden"
            onClick={() => setViewingMedia(item)}
          >
            {item.type === 'video' ? (
                <div className="w-full h-full relative">
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                        <Play size={24} className="text-white fill-white" />
                    </div>
                    {/* Thumbnail placeholder for video since we might only have URL */}
                    <div className="w-full h-full bg-carmel-brown flex items-center justify-center">
                        <Video className="text-carmel-beige opacity-50" />
                    </div>
                </div>
            ) : (
                <img 
                  src={item.url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            )}
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-carmel-brown/40">
            <Camera size={48} className="mb-2 stroke-1" />
            <p className="font-serif">Ainda não há fotos.</p>
         </div>
      )}

      {/* Lightbox / View Modal */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
           {/* Close Button */}
           <button 
             onClick={() => setViewingMedia(null)}
             className="absolute top-4 right-4 text-white p-2 z-50 bg-black/20 rounded-full"
           >
             <X size={24} />
           </button>

           {/* Media Content */}
           <div className="w-full max-w-lg bg-black flex items-center justify-center flex-1 relative">
              {viewingMedia.type === 'video' ? (
                  <iframe 
                    src={getEmbedUrl(viewingMedia.url) || viewingMedia.url} 
                    className="w-full aspect-video"
                    allowFullScreen
                    title={viewingMedia.caption}
                  />
              ) : (
                  <img 
                    src={viewingMedia.url} 
                    alt={viewingMedia.caption} 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
              )}
           </div>

           {/* Details Footer */}
           <div className="w-full max-w-lg bg-white p-4 rounded-t-2xl bottom-0 absolute">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-carmel-brown">{viewingMedia.caption || 'Sem legenda'}</h3>
                 <span className="text-xs text-carmel-brown/50">{new Date(viewingMedia.date).toLocaleDateString()}</span>
              </div>
              
              {viewingMedia.meeting_id && (
                  <div className="flex items-center gap-2 text-xs text-carmel-gold font-bold mb-2">
                     <MapPin size={12} />
                     Encontro: {new Date(meetings.find(m => m.meeting_id === viewingMedia.meeting_id)?.date || '').toLocaleDateString()}
                  </div>
              )}
              
              <p className="text-sm text-carmel-brown/80">{viewingMedia.description}</p>
           </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setIsUploadOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">Nova Publicação</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
               {/* Type Selection */}
               <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'image'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${newItem.type === 'image' ? 'bg-carmel-brown text-white' : 'bg-gray-100 text-carmel-brown'}`}
                  >
                     <ImageIcon size={16} /> Foto
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'video'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${newItem.type === 'video' ? 'bg-carmel-brown text-white' : 'bg-gray-100 text-carmel-brown'}`}
                  >
                     <Video size={16} /> Vídeo
                  </button>
               </div>

               {/* Image Input */}
               {newItem.type === 'image' && (
                  <div className="border-2 border-dashed border-carmel-gold/50 rounded-lg p-6 text-center bg-carmel-beige/20">
                     {newItem.url ? (
                        <div className="relative">
                           <img src={newItem.url} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                           <button 
                             onClick={() => setNewItem({...newItem, url: ''})}
                             className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                           <Camera size={32} className="mx-auto text-carmel-brown/50 mb-2" />
                           <p className="text-xs font-bold text-carmel-brown">Toque para selecionar foto</p>
                           <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                           />
                        </div>
                     )}
                  </div>
               )}

               {/* Video Input */}
               {newItem.type === 'video' && (
                  <div>
                     <label className="block text-xs font-bold text-carmel-brown mb-1">Link do YouTube / Vídeo</label>
                     <Input 
                        placeholder="https://..."
                        value={newItem.url}
                        onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                     />
                  </div>
               )}

               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Legenda</label>
                  <Input 
                     value={newItem.caption}
                     onChange={(e) => setNewItem({...newItem, caption: e.target.value})}
                     placeholder="Escreva algo sobre este momento..."
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Vincular a Encontro (Opcional)</label>
                  <select 
                     className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown focus:outline-none focus:ring-2 focus:ring-carmel-gold text-sm"
                     value={newItem.meeting_id}
                     onChange={(e) => setNewItem({...newItem, meeting_id: e.target.value})}
                  >
                     <option value="">Sem vínculo</option>
                     {meetings.map(m => (
                        <option key={m.meeting_id} value={m.meeting_id}>
                           {new Date(m.date).toLocaleDateString()} - Casa de {m.host_couple_id?.split(' ')[0]}
                        </option>
                     ))}
                  </select>
               </div>

               <ButtonPrimary onClick={handleSave} className="w-full mt-4">
                  Publicar
               </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
