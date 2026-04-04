import { type Track } from "@/lib/store";
import { Play } from "lucide-react";

interface TrackItemProps {
  track: Track;
  onClick: () => void;
  onRemove?: () => void;
}

import { playTrackDirectly } from "../player/HiddenPlayer";

export function TrackItem({ track, onClick, onRemove }: TrackItemProps) {
  const handlePlayClick = () => {
    // Calling this directly in the click handler allows iOS Safari to play the video
    playTrackDirectly(track.id);
    onClick();
  };

  return (
    <div 
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
      onClick={handlePlayClick}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
        <img 
          src={track.thumbnail} 
          alt={track.title}
          className="w-full h-full object-cover scale-135"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-6 h-6 text-white" fill="currentColor" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
          {track.title}
        </h4>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
          {track.author}
        </p>
      </div>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          Retirer
        </button>
      )}
    </div>
  );
}
