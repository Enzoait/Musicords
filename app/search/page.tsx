"use client";

import { useState } from "react";
import { Search as SearchIcon, Loader2, Play, ListPlus } from "lucide-react";
import { fetchYoutubeMetadata } from "@/app/actions";
import { useMusicStore, Track } from "@/lib/store";
import { AddToPlaylistDialog } from "@/components/ui/AddToPlaylistDialog";

export default function SearchPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Track | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { setCurrentTrack } = useMusicStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetchYoutubeMetadata(url);
    if (res?.error) {
      setError(res.error);
    } else if (res?.track) {
      setResult(res.track);
    }
    setLoading(false);
  };

  const handlePlay = () => {
    if (result) {
      setCurrentTrack(result);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Recherche
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Entrez l'URL d'une vidéo YouTube pour écouter son audio.
        </p>
      </header>

      <form onSubmit={handleSearch} className="relative flex items-center mb-10">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className="w-full h-14 pl-12 pr-32 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
        />
        <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400" />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="absolute right-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chercher"}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 relative">
              <img 
                src={result.thumbnail} 
                alt={result.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
              {result.title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              {result.author}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button 
                onClick={handlePlay}
                className="w-full flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Lire l'audio
              </button>
              
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium transition-colors"
              >
                <ListPlus className="w-5 h-5" />
                Ajouter à une playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {result && isDialogOpen && (
        <AddToPlaylistDialog 
          track={result} 
          onClose={() => setIsDialogOpen(false)} 
        />
      )}
    </div>
  );
}
