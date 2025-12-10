
export interface Member {
  member_id: string;
  husband_name: string;
  wife_name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  birthday: string;
  geo_lat: number;
  geo_lng: number;
  notes: string;
}

export interface Meeting {
  meeting_id: string;
  date: string; // ISO string
  time: string;
  host_couple_id: string;
  address: string;
  music_list: string[]; // array of song_ids
  notes: string;
  geo_lat?: number;
  geo_lng?: number;
}

export interface Song {
  song_id: string;
  title: string;
  category: string;
  chords: string;
  youtube_url: string;
  lyrics: string;
  tone: string;
}

export interface PrayerRequest {
  prayer_id: string;
  name: string;
  request_text: string;
  category: 'Saúde' | 'Família' | 'Jovens' | 'Gratidão' | 'Libertação' | 'Outros';
  date: string;
  likes: number;
}

export interface DailyLiturgy {
  liturgy_id: string;
  date: string;
  gospel: string;
  reading1: string;
  reading2: string;
  psalm: string;
  reflection: string;
  video_url: string;
}

export interface MediaItem {
  media_id: string;
  type: 'image' | 'video';
  url: string;
  meeting_id?: string;
  date: string;
  caption?: string; // Optional if using title/description
  title?: string;
  description?: string;
}

export interface Feedback {
  id: string;
  meeting_id: string;
  rating: number;
  positives: string;
  improvements: string;
  suggestions: string;
  date: string;
}
