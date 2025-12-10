
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Member, Meeting, Song, PrayerRequest, DailyLiturgy, MediaItem, Feedback } from '../types';

// Generic Save Function
export const salvarDados = async (collectionName: string, data: any) => {
  return await addDoc(collection(db, collectionName), data);
};

// Generic Update Function
export const atualizarDados = async (collectionName: string, docId: string, data: any) => {
  const ref = doc(db, collectionName, docId);
  return await updateDoc(ref, data);
};

// Members
export const getMembers = async (): Promise<Member[]> => {
  const snapshot = await getDocs(collection(db, 'members'));
  return snapshot.docs.map(doc => ({ ...doc.data(), member_id: doc.id } as Member));
};

export const addMember = async (member: Omit<Member, 'member_id'>) => {
  return await addDoc(collection(db, 'members'), member);
};

// Meetings
export const getMeetings = async (): Promise<Meeting[]> => {
  const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), meeting_id: doc.id } as Meeting));
};

export const addMeeting = async (meeting: Omit<Meeting, 'meeting_id'>) => {
  return await addDoc(collection(db, 'meetings'), meeting);
};

// Songs
export const getSongs = async (): Promise<Song[]> => {
  const q = query(collection(db, 'songs'), orderBy('title', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), song_id: doc.id } as Song));
};

export const addSong = async (song: Omit<Song, 'song_id'>) => {
  return await addDoc(collection(db, 'songs'), song);
};

// Prayers
export const getPrayers = async (): Promise<PrayerRequest[]> => {
  const q = query(collection(db, 'prayers'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), prayer_id: doc.id } as PrayerRequest));
};

export const addPrayer = async (prayer: Omit<PrayerRequest, 'prayer_id'>) => {
  return await addDoc(collection(db, 'prayers'), prayer);
};

export const updatePrayerLikes = async (id: string, likes: number) => {
  const ref = doc(db, 'prayers', id);
  await updateDoc(ref, { likes });
};

// Liturgy
export const getLiturgy = async (): Promise<DailyLiturgy | null> => {
  const q = query(collection(db, 'liturgy'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0].data();
  return { ...d, liturgy_id: snapshot.docs[0].id } as DailyLiturgy;
};

// Media
export const getMedia = async (): Promise<MediaItem[]> => {
  const q = query(collection(db, 'media'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), media_id: doc.id } as MediaItem));
};

export const addMedia = async (media: Omit<MediaItem, 'media_id'>) => {
  return await addDoc(collection(db, 'media'), media);
};

// Feedback
export const addFeedback = async (feedback: Omit<Feedback, 'id'>) => {
  return await addDoc(collection(db, 'feedbacks'), feedback);
};
