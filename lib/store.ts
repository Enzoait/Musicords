import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// IndexedDB storage adapter for Zustand
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type Track = {
  id: string; // YouTube video ID
  title: string;
  author: string;
  thumbnail: string;
  url: string;
};

export type Playlist = {
  id: string;
  name: string;
  cover: string; // Base64 image
  tracks: Track[];
};

interface MusicState {
  // Player state
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  progress: number;
  duration: number;
  volume: number;
  
  // History and Playlists
  recentlyPlayed: Track[];
  playlists: Playlist[];

  // Actions
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setIsExpanded: (isExpanded: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;

  // Playlist Actions
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  updatePlaylistCover: (playlistId: string, cover: string) => void;

  // History Actions
  addToRecentlyPlayed: (track: Track) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      isExpanded: false,
      progress: 0,
      duration: 0,
      volume: 100,

      recentlyPlayed: [],
      playlists: [],

      setCurrentTrack: (track) => {
        set({ currentTrack: track, isPlaying: true, progress: 0 });
        get().addToRecentlyPlayed(track);
      },
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setIsExpanded: (isExpanded) => set({ isExpanded }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),

      addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
      removePlaylist: (id) => set((state) => ({ playlists: state.playlists.filter(p => p.id !== id) })),
      addTrackToPlaylist: (playlistId, track) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            // Check if track is already in playlist to avoid duplicates
            if (p.tracks.some(t => t.id === track.id)) return p;
            return { ...p, tracks: [...p.tracks, track] };
          }
          return p;
        })
      })),
      removeTrackFromPlaylist: (playlistId, trackId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
          }
          return p;
        })
      })),
      updatePlaylistCover: (playlistId, cover) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, cover };
          }
          return p;
        })
      })),

      addToRecentlyPlayed: (track) => set((state) => {
        const filtered = state.recentlyPlayed.filter(t => t.id !== track.id);
        const newRecentlyPlayed = [track, ...filtered].slice(0, 50); // Keep last 50
        return { recentlyPlayed: newRecentlyPlayed };
      }),
    }),
    {
      name: 'musicords-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        recentlyPlayed: state.recentlyPlayed, 
        playlists: state.playlists,
        volume: state.volume
      }),
    }
  )
);
