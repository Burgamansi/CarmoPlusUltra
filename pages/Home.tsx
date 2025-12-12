
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, Heart, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, ButtonPrimary } from '../components/UI';
import SaveButton from '../components/SaveButton';
import { loadJSON, saveJSON } from '../services/storage';

const STORAGE_KEY = "carmo_membro";

type HomeState = {
  notes: string;
};

export const Home = () => {
  const navigate = useNavigate();
  const { meetings } = useApp();
  const [membro, setMembro] = useState<HomeState>({ notes: "" });

  useEffect(() => {
    const saved = loadJSON<HomeState>(STORAGE_KEY, { notes: "" });
    setMembro(saved);
  }, []);

  const handleSave = async () => {
    alert("ENTROU NO SAVE");
    console.log("SALVAR CLICADO", membro); // debug

    saveJSON("carmo_membro", membro);
  };

  // Find next meeting (closest future date)
  const nextMeeting = meetings
    .filter(m => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Devotional Banner */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl h-48 bg-carmel-brown flex items-center justify-center text-center"
        style={{
          backgroundImage: "url('/assets/download.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "40px 0",
          filter: "brightness(0.8)"
        }}
      >
        <div className="relative z-10 px-4 text-center leading-snug break-words w-full">
          <h2 className="text-2xl font-serif font-bold text-carmel-beige mb-2">Nossa Senhora do Carmo, rogai por nós.</h2>
          <p className="text-carmel-gold italic text-sm">"No meio das vicissitudes, olhai para a Estrela, invocai Maria."</p>
        </div>
      </div>

      {/* Next Meeting */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-serif font-bold text-carmel-brown">Próxima Reunião</h3>
          <button onClick={() => navigate('/meetings')} className="text-xs font-bold text-carmel-brown/70 flex items-center">
            VER TODAS <ArrowRight size={12} className="ml-1" />
          </button>
        </div>

        {nextMeeting ? (
          <Card className="bg-gradient-to-br from-white to-carmel-beige border-l-4 border-l-carmel-brown" onClick={() => navigate(`/meetings`)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-carmel-gold uppercase mb-1">
                  {new Date(nextMeeting.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h4 className="font-serif font-bold text-lg text-carmel-brown mb-1">
                  Casa de {meetings.find(m => m.meeting_id === nextMeeting.meeting_id)?.host_couple_id || 'Anfitrião'}
                </h4>
                <p className="text-sm text-carmel-brown/80 flex items-center gap-1">
                  <Calendar size={14} /> {nextMeeting.time}
                </p>
              </div>
              <div className="bg-carmel-blue text-carmel-brown font-bold text-xs px-2 py-1 rounded">
                EM BREVE
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-6">
            <p className="text-carmel-brown/60">Nenhuma reunião agendada.</p>
          </Card>
        )}
      </section>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/songs')} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 border border-transparent hover:border-carmel-gold transition-colors">
          <div className="w-10 h-10 rounded-full bg-carmel-blue flex items-center justify-center text-carmel-brown">
            <Music size={20} />
          </div>
          <span className="font-bold text-sm text-carmel-brown">Músicas</span>
        </button>

        <button onClick={() => navigate('/prayers')} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 border border-transparent hover:border-carmel-gold transition-colors">
          <div className="w-10 h-10 rounded-full bg-carmel-blue flex items-center justify-center text-carmel-brown">
            <Heart size={20} />
          </div>
          <span className="font-bold text-sm text-carmel-brown">Orações</span>
        </button>

        <button onClick={() => navigate('/liturgy')} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 border border-transparent hover:border-carmel-gold transition-colors">
          <div className="w-10 h-10 rounded-full bg-carmel-blue flex items-center justify-center text-carmel-brown">
            <Calendar size={20} />
          </div>
          <span className="font-bold text-sm text-carmel-brown">Liturgia</span>
        </button>

        <button onClick={() => navigate('/devotional')} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 border border-transparent hover:border-carmel-gold transition-colors">
          <div className="w-10 h-10 rounded-full bg-carmel-blue flex items-center justify-center text-carmel-brown">
            <div className="font-serif font-bold text-lg">M</div>
          </div>
          <span className="font-bold text-sm text-carmel-brown">Devocional</span>
        </button>
      </div>

      <div className="pt-4">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 className="font-serif font-bold text-lg text-carmel-brown">Minhas Anotações</h2>
          <SaveButton
            label="Salvar Membro"
            onSave={handleSave}
            confirmText="Deseja salvar este cadastro?"
            successText="Cadastro salvo com sucesso ✅"
          />
        </div>

        <textarea
          value={membro.notes}
          onChange={(e) => setMembro({ ...membro, notes: e.target.value })}
          placeholder="Digite aqui suas anotações pessoais..."
          className="w-full p-4 rounded-xl border border-carmel-brown/20 focus:border-carmel-gold focus:ring-1 focus:ring-carmel-gold outline-none bg-white text-carmel-brown min-h-[120px]"
        />
      </div>

      <div className="pt-4">
        <ButtonPrimary className="w-full" onClick={() => navigate('/feedback')}>
          Enviar Feedback do Encontro
        </ButtonPrimary>
      </div>
    </div>
  );
};
