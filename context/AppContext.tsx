
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Meeting, Song, PrayerRequest, DailyLiturgy, MediaItem, Feedback } from '../types';
import * as FirestoreService from '../services/firestoreService';

interface AppContextType {
  members: Member[];
  meetings: Meeting[];
  songs: Song[];
  prayers: PrayerRequest[];
  liturgy: DailyLiturgy;
  media: MediaItem[];
  feedbacks: Feedback[];
  
  // Actions
  addPrayer: (prayer: PrayerRequest) => void;
  likePrayer: (id: string) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meeting: Meeting) => void;
  addMember: (member: Member) => void;
  addSong: (song: Song) => void;
  addFeedback: (feedback: Feedback) => void;
  addMedia: (media: MediaItem) => void;
  updateLiturgy: (liturgy: DailyLiturgy) => void;
  
  // Helpers
  getMeetingById: (id: string) => Meeting | undefined;
  getMemberById: (id: string) => Member | undefined;
  getSongById: (id: string) => Song | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [liturgy, setLiturgy] = useState<DailyLiturgy>({
      liturgy_id: 'loading',
      date: new Date().toISOString(),
      gospel: '',
      reading1: '',
      reading2: '',
      psalm: '',
      reflection: 'Carregando liturgia...',
      video_url: ''
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedMembers,
          fetchedMeetings,
          fetchedSongs,
          fetchedPrayers,
          fetchedLiturgy,
          fetchedMedia
        ] = await Promise.all([
          FirestoreService.getMembers(),
          FirestoreService.getMeetings(),
          FirestoreService.getSongs(),
          FirestoreService.getPrayers(),
          FirestoreService.getLiturgy(),
          FirestoreService.getMedia()
        ]);

        setMembers(fetchedMembers);
        setMeetings(fetchedMeetings);
        setSongs(fetchedSongs);
        setPrayers(fetchedPrayers);
        if (fetchedLiturgy) setLiturgy(fetchedLiturgy);
        setMedia(fetchedMedia);
      } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const addPrayer = (prayer: PrayerRequest) => {
    setPrayers([prayer, ...prayers]);
  };

  const likePrayer = async (id: string) => {
    const prayer = prayers.find(p => p.prayer_id === id);
    if (!prayer) return;
    
    const newLikes = prayer.likes + 1;
    setPrayers(prev => prev.map(p => p.prayer_id === id ? { ...p, likes: newLikes } : p));
    
    try {
      await FirestoreService.updatePrayerLikes(id, newLikes);
    } catch (e) {
      console.error("Erro ao curtir oração", e);
    }
  };

  const addMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
  };

  const updateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.meeting_id === updatedMeeting.meeting_id ? updatedMeeting : m));
  };

  const addMember = (member: Member) => {
    setMembers([...members, member]);
  };

  const addSong = (song: Song) => {
    setSongs([...songs, song]);
  };

  const addFeedback = (feedback: Feedback) => {
    setFeedbacks([...feedbacks, feedback]);
  };

  const addMedia = (item: MediaItem) => {
    setMedia([item, ...media]);
  }

  const updateLiturgy = (newLiturgy: DailyLiturgy) => {
    setLiturgy(newLiturgy);
  }

  const getMeetingById = (id: string) => meetings.find(m => m.meeting_id === id);
  const getMemberById = (id: string) => members.find(m => m.member_id === id);
  const getSongById = (id: string) => songs.find(s => s.song_id === id);

  return (
    <AppContext.Provider value={{
      members, meetings, songs, prayers, liturgy, media, feedbacks,
      addPrayer, likePrayer, addMeeting, updateMeeting, addMember, addSong, addFeedback, addMedia, updateLiturgy,
      getMeetingById, getMemberById, getSongById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helper for normalized search
export const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};
