"use client";

import { useMusicStore } from "@/lib/store";
import { Play, Pause, ChevronDown, SkipForward, SkipBack, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { playTrackDirectly, resumeTrackDirectly, pauseTrackDirectly } from "./HiddenPlayer";

export function ExpandableBanner() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    isExpanded, 
    setIsExpanded,
    progress,
    duration,
    playNextTrack,
    playPreviousTrack
  } = useMusicStore();

  const [hasWindow, setHasWindow] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const handlePlayNext = () => {
    if (isCooldown) return;
    setIsCooldown(true);
    
    // Find next track to play it directly for iOS
    const { queue } = useMusicStore.getState();
    if (currentTrack && queue.length > 0) {
      const index = queue.findIndex(t => t.id === currentTrack.id);
      if (index !== -1 && index < queue.length - 1) {
        playTrackDirectly(queue[index + 1].id);
      }
    }

    playNextTrack();
    setTimeout(() => setIsCooldown(false), 3000);
  };

  const handlePlayPrevious = () => {
    if (isCooldown) return;
    setIsCooldown(true);

    // Find previous track for iOS direct play
    const { queue } = useMusicStore.getState();
    if (currentTrack && queue.length > 0) {
      const index = queue.findIndex(t => t.id === currentTrack.id);
      if (index > 0) {
        playTrackDirectly(queue[index - 1].id);
      }
    }

    playPreviousTrack();
    setTimeout(() => setIsCooldown(false), 3000);
  };

  useEffect(() => {
    setHasWindow(true);
  }, []);

  if (!hasWindow || !currentTrack) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-16 md:bottom-6 left-2 right-2 md:left-72 md:right-8 z-40"
          >
            <div 
              onClick={() => setIsExpanded(true)}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-2 flex items-center gap-3 cursor-pointer group hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover scale-135"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {currentTrack.author}
                </p>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isPlaying) pauseTrackDirectly();
                    else resumeTrackDirectly();
                    togglePlayPause(); 
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
                </button>
              </div>

              {/* Mini progress bar at the absolute bottom of the banner */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-hidden flex flex-col"
          >
            {/* Background blur */}
            <div 
              className="absolute inset-0 opacity-20 dark:opacity-40 blur-3xl scale-135 pointer-events-none"
              style={{ backgroundImage: `url(${currentTrack.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            <div className="relative z-10 flex-1 flex flex-col h-full max-w-md mx-auto w-full px-6 py-8 md:py-12">
              <header className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <ChevronDown className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
                </button>
                <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                  Lecture en cours
                </span>
                <div className="w-12" /> {/* Spacer */}
              </header>

              <div className="flex-1 flex flex-col justify-center gap-14 md:gap-4">
                {/* 1:1 Cover Art */}
                <div className="flex flex-col items-center">
                <motion.div 
                  className="w-[75%] aspect-square rounded-3xl shadow-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                  layoutId="cover-art"
                >
                  <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover scale-135"
                  />
                </motion.div>
                </div>

                {/* Track Info */}
                <div className="max-w-full overflow-hidden">
                  <div className="marquee-container text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-2">
                    <div className="animate-marquee-slow flex w-max">
                      <span className="pr-8">{currentTrack.title} &nbsp; • &nbsp; </span>
                      <span className="pr-8">{currentTrack.title} &nbsp; • &nbsp; </span>
                    </div>
                  </div>
                  <p className="text-lg text-zinc-500 dark:text-zinc-400 truncate">
                    {currentTrack.author}
                  </p>
                </div>

                {/* Scrubber */}
                <div className="space-y-3">
                  <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
                     <div 
                        className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 md:gap-12">
                  <button 
                    disabled={isCooldown}
                    className={cn(
                      "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all",
                      isCooldown && "opacity-50 cursor-wait"
                    )}
                    onClick={handlePlayPrevious}
                  >
                    <SkipBack className="w-8 h-8" fill="currentColor" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (isPlaying) pauseTrackDirectly();
                      else resumeTrackDirectly();
                      togglePlayPause();
                    }}
                    className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-10 h-10" fill="currentColor" /> : <Play className="w-10 h-10 ml-2" fill="currentColor" />}
                  </button>

                  <button 
                    disabled={isCooldown}
                    className={cn(
                      "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all",
                      isCooldown && "opacity-50 cursor-wait"
                    )}
                    onClick={handlePlayNext}
                  >
                    <SkipForward className="w-8 h-8" fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
