"use client";

import { useMusicStore } from "@/lib/store";
import { TrackItem } from "@/components/ui/TrackItem";
import { useEffect, useState } from "react";

export default function Home() {
  const { recentlyPlayed, setCurrentTrack } = useMusicStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Bonjour
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Voici ce que vous avez écouté récemment.
        </p>
      </header>

      {recentlyPlayed.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400">
            Aucun historique d'écoute. <br/> Allez dans l'onglet Recherche pour trouver de la musique.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentlyPlayed.map((track) => (
            <TrackItem 
              key={`${track.id}-${Math.random()}`} // handling potential duplicates safely in key, though store filters them
              track={track} 
              onClick={() => setCurrentTrack(track)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
