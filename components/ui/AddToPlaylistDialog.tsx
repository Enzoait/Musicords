"use client";

import { useMusicStore, Track } from "@/lib/store";
import { X, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToPlaylistDialog({ track, onClose }: { track: Track, onClose: () => void }) {
  const { playlists, addTrackToPlaylist } = useMusicStore();
  const [addedTo, setAddedTo] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setAddedTo(playlistId);
    setTimeout(() => setAddedTo(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Ajouter à une playlist
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                Vous n'avez pas encore de playlist.
              </p>
              <button 
                onClick={() => router.push("/playlists")}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Créer une playlist
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(p => {
                const isAdded = addedTo === p.id;
                const alreadyIn = p.tracks.some(t => t.id === track.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => !alreadyIn && handleAdd(p.id)}
                    disabled={alreadyIn}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                        {p.cover ? (
                          <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Plus className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {p.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {p.tracks.length} titre(s)
                        </p>
                      </div>
                    </div>

                    <div className="pr-2">
                      {isAdded || alreadyIn ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Plus className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
