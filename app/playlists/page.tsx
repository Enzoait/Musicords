"use client";

import { useMusicStore, Playlist, Track } from "@/lib/store";
import { Plus, MoreVertical, Play, Trash2, Camera, X, ChevronLeft, ListMusic, Shuffle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TrackItem } from "@/components/ui/TrackItem";
import { cn } from "@/lib/utils";

export default function PlaylistsPage() {
  const { playlists, addPlaylist, removePlaylist, removeTrackFromPlaylist, setCurrentTrack, setQueue, updatePlaylistCover } = useMusicStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId);

  const startPlaylist = (tracks: Track[], random: boolean = false) => {
    if (random) {
      tracks.sort(() => Math.random() - 0.5);
    }
    setQueue(tracks);
    setCurrentTrack(tracks[0]);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full flex flex-col">
      {!selectedPlaylistId ? (
        <>
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                Bibliothèque
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Gérez vos playlists et vos coups de cœur.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
          </header>

          {playlists.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <ListMusic className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                Aucune playlist créée. <br /> Commencez par en créer une nouvelle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setSelectedPlaylistId(playlist.id)}
                  className="group cursor-pointer space-y-3"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md transition-transform group-hover:scale-[1.02]">
                    {playlist.cover ? (
                      <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                        <ListMusic className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Play className="w-6 h-6 fill-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {playlist.tracks.length} titres
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
          <button 
            onClick={() => setSelectedPlaylistId(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 mb-8 transition-colors p-2 -ml-2 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>

          {activePlaylist && (
            <div className="space-y-10">
              <header className="flex flex-col md:flex-row items-end gap-6">
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl shrink-0 group">
                  {activePlaylist.cover ? (
                    <img src={activePlaylist.cover} alt={activePlaylist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                      <ListMusic className="w-20 h-20 text-white/50" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-sm font-medium">
                    <Camera className="w-8 h-8 mb-2" />
                    Changer l'image
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updatePlaylistCover(activePlaylist.id, reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Playlist
                  </span>
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {activePlaylist.name}
                    </h2>
                    <button 
                      onClick={() => {
                        if (confirm("Supprimer cette playlist ?")) {
                          removePlaylist(activePlaylist.id);
                          setSelectedPlaylistId(null);
                        }
                      }}
                      className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    {activePlaylist.tracks.length} titres • Musicords
                  </p>
                  
                  {activePlaylist.tracks.length > 0 && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => startPlaylist(activePlaylist.tracks, false)}
                        className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                        <Play className="w-6 h-6 fill-white" />
                        Tout lire
                      </button>
                      <button
                        onClick={() => startPlaylist(activePlaylist.tracks, true)}
                        className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                        <Shuffle className="w-6 h-6 fill-white" />
                        Lecture aléatoire
                      </button>
                      </div>
                      
                  )}
                </div>
              </header>

              <div className="space-y-1">
                {activePlaylist.tracks.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Playlist vide. Allez dans Recherche pour ajouter des morceaux.
                    </p>
                  </div>
                ) : (
                  activePlaylist.tracks.map((track) => (
                    <TrackItem 
                      key={track.id} 
                      track={track} 
                      onClick={() => setCurrentTrack(track)}
                      onRemove={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <CreatePlaylistModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreated={(id) => {
            setIsCreateModalOpen(false);
            setSelectedPlaylistId(id);
          }}
        />
      )}
    </div>
  );
}

function CreatePlaylistModal({ onClose, onCreated }: { onClose: () => void, onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const { addPlaylist } = useMusicStore();
  
  const handleCreate = () => {
    if (!name.trim()) return;
    const id = Date.now().toString();
    addPlaylist({
      id,
      name,
      cover: cover || "",
      tracks: []
    });
    onCreated(id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nouvelle Playlist</h2>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <label 
                className="relative w-40 h-40 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors group"
                style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderStyle: 'solid' } : {}}
              >
                {!cover && (
                  <>
                    <Camera className="w-10 h-10 text-zinc-400 group-hover:text-blue-500 mb-2" />
                    <span className="text-xs font-medium text-zinc-500">Choisir une image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-500 px-1">Nom de la playlist</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ma superbe playlist"
                className="w-full h-14 px-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50 font-medium"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full h-14 rounded-22xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              style={{ borderRadius: '1.25rem' }}
            >
              Créer la playlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
