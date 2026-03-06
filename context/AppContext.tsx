
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Meeting, Song, PrayerRequest, DailyLiturgy, MediaItem, Feedback } from '../types';
import * as FirestoreService from '../services/firestoreService';
import { getMembersLS } from '../services/storage';

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
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
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
  console.log("[AppProvider] Initializing");
  
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



  // ...

  useEffect(() => {
    const fetchData = async () => {
      console.log("[AppContext] Starting data fetch");
      
      // Early load from LocalStorage for Member persistence check
      const localMembers = getMembersLS();
      if (localMembers && localMembers.length > 0) {
        console.log("[AppContext] loaded members from LS:", localMembers.length);
        setMembers(localMembers);
      }

      try {
        const results = await Promise.allSettled([
          FirestoreService.getMembers(),
          FirestoreService.getMeetings(),
          FirestoreService.getSongs(),
          FirestoreService.getPrayers(),
          FirestoreService.getLiturgy(),
          FirestoreService.getMedia()
        ]);

        console.log("[AppContext] Data fetch results:", results.map(r => r.status));

        const fetchedMembers = results[0].status === 'fulfilled' ? results[0].value : [];
        const fetchedMeetings = results[1].status === 'fulfilled' ? results[1].value : [];
        const fetchedSongs = results[2].status === 'fulfilled' ? results[2].value : [];
        const fetchedPrayers = results[3].status === 'fulfilled' ? results[3].value : [];
        const fetchedLiturgy = results[4].status === 'fulfilled' ? results[4].value : null;
        const fetchedMedia = results[5].status === 'fulfilled' ? results[5].value : [];

        setMembers(fetchedMembers);
        setMeetings(fetchedMeetings);
        setSongs(fetchedSongs);
        setPrayers(fetchedPrayers);
        if (fetchedLiturgy) setLiturgy(fetchedLiturgy);
        setMedia(fetchedMedia);

        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            console.warn("[AppContext] Failed to fetch data source", idx, result.reason);
          }
        });
      } catch (error) {
        console.error("[AppContext] Unexpected error during data fetch:", error);
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

  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.member_id === updatedMember.member_id ? updatedMember : m));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.member_id !== id));
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
      addPrayer, likePrayer, addMeeting, updateMeeting, addMember, updateMember, deleteMember, addSong, addFeedback, addMedia, updateLiturgy,
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
