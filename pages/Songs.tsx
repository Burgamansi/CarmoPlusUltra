
import React, { useState } from 'react';
import { Search, Youtube, Music, X, Plus, Save } from 'lucide-react';
import { useApp, normalizeText } from '../context/AppContext';
import { Card, SectionTitle, Input, Badge, ButtonSecondary, ButtonPrimary } from '../components/UI';
import { salvarDados } from '../services/firestoreService';

export const Songs = () => {
  const { songs, addSong } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Song State
  const [newSong, setNewSong] = useState({
      title: '',
      category: 'Geral',
      tone: '',
      lyrics: '',
      chords: '',
      youtube_url: ''
  });

  const categories = ['Todas', ...Array.from(new Set(songs.map(s => s.category)))];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = normalizeText(song.title).includes(normalizeText(searchTerm)) || 
                          normalizeText(song.lyrics).includes(normalizeText(searchTerm));
    const matchesCategory = selectedCategory === 'Todas' || song.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
      if(!newSong.title || !newSong.lyrics) {
          alert("Título e Letra são obrigatórios.");
          return;
      }

      const songData = {
          ...newSong,
          song_id: Date.now().toString() // Optimistic
      };

      try {
          const docRef = await salvarDados('songs', newSong);
          addSong({ ...newSong, song_id: docRef.id });
          alert("Dados salvos com sucesso!");
          setIsModalOpen(false);
          setNewSong({
              title: '',
              category: 'Geral',
              tone: '',
              lyrics: '',
              chords: '',
              youtube_url: ''
          });
      } catch (e) {
          console.error("Erro ao salvar música", e);
          alert("Erro ao salvar dados.");
      }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
         <SectionTitle>Música & Cifras</SectionTitle>
         <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-carmel-brown text-white p-2 rounded-full shadow-md active:scale-95 transition-transform"
          title="Adicionar Música"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="sticky top-16 bg-carmel-beige z-20 pb-4">
        <h3 className="font-serif font-bold text-lg text-carmel-brown mb-2">Lista de Músicas</h3>
        <div className="relative mb-4">
          <Input 
            placeholder="Buscar música ou trecho..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 text-carmel-brown/40" size={20} />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-carmel-brown text-white' 
                  : 'bg-white text-carmel-brown border border-carmel-brown/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredSongs.map(song => (
          <Card key={song.song_id} onClick={() => setSelectedSong(song)}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-carmel-brown">{song.title}</h3>
                <span className="text-xs text-carmel-brown/60">{song.category} • Tom: {song.tone}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-carmel-beige flex items-center justify-center text-carmel-brown">
                <Music size={16} />
              </div>
            </div>
          </Card>
        ))}
        {filteredSongs.length === 0 && (
          <p className="text-center text-carmel-brown/50 mt-8">Nenhuma música encontrada.</p>
        )}
      </div>

      {/* Song Detail Modal */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6" onClick={() => setSelectedSong(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-carmel-beige">
              <div>
                <h3 className="font-serif font-bold text-xl text-carmel-brown">{selectedSong.title}</h3>
                <Badge>{selectedSong.tone}</Badge>
              </div>
              <button onClick={() => setSelectedSong(null)} className="p-2 bg-white rounded-full text-carmel-brown">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-carmel-brown/90 bg-gray-50">
               {/* Simple formatting for chords vs lyrics could go here, for now just displaying raw text */}
               <div className="font-bold text-carmel-gold mb-4 text-xs uppercase tracking-widest">Cifras</div>
               {selectedSong.chords}
               
               <div className="h-6"></div>
               <div className="font-bold text-carmel-gold mb-4 text-xs uppercase tracking-widest">Letra</div>
               <div className="font-sans">{selectedSong.lyrics}</div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
               {selectedSong.youtube_url && (
                 <ButtonSecondary className="w-full" onClick={() => window.open(selectedSong.youtube_url, '_blank')}>
                   <Youtube size={18} /> Ver no YouTube
                 </ButtonSecondary>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">Adicionar Música</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Título *</label>
                <Input 
                  value={newSong.title}
                  onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-carmel-brown mb-1">Categoria</label>
                    <select 
                       className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown focus:outline-none focus:ring-2 focus:ring-carmel-gold"
                       value={newSong.category}
                       onChange={(e) => setNewSong({...newSong, category: e.target.value})}
                    >
                       <option value="Geral">Geral</option>
                       <option value="Entrada">Entrada</option>
                       <option value="Aclamação">Aclamação</option>
                       <option value="Ofertas">Ofertas</option>
                       <option value="Comunhão">Comunhão</option>
                       <option value="Final">Final</option>
                       <option value="Maria">Maria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-carmel-brown mb-1">Tom</label>
                    <Input 
                      placeholder="Ex: G, Cm"
                      value={newSong.tone}
                      onChange={(e) => setNewSong({...newSong, tone: e.target.value})}
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Link YouTube</label>
                <Input 
                  value={newSong.youtube_url}
                  onChange={(e) => setNewSong({...newSong, youtube_url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Cifras</label>
                <textarea 
                  className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown placeholder-carmel-brown/50 focus:outline-none focus:ring-2 focus:ring-carmel-gold h-32 font-mono text-sm resize-none"
                  placeholder="Cole a cifra aqui..."
                  value={newSong.chords}
                  onChange={(e) => setNewSong({...newSong, chords: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-carmel-brown mb-1">Letra *</label>
                <textarea 
                  className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown placeholder-carmel-brown/50 focus:outline-none focus:ring-2 focus:ring-carmel-gold h-32 resize-none"
                  placeholder="Cole a letra aqui..."
                  value={newSong.lyrics}
                  onChange={(e) => setNewSong({...newSong, lyrics: e.target.value})}
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
