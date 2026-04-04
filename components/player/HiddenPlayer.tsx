"use client";

import { useEffect, useRef } from "react";
import YouTube, { type YouTubeProps } from "react-youtube";
import { useMusicStore, type Track } from "@/lib/store";

let globalPlayer: any = null;
let globalSilentAudio: HTMLAudioElement | null = null;
let lastTrackId: string | null = null;

/**
 * Direct playback commands to bypass iOS Safari autoplay restrictions.
 * These must be called from within a user interaction click handler.
 */
export const playTrackDirectly = (id: string) => {
  if (globalPlayer && typeof globalPlayer.loadVideoById === "function") {
    lastTrackId = id;
    globalPlayer.loadVideoById(id);
  }
  // Synchronously play silent audio to capture Media Session authority on iOS
  if (globalSilentAudio) {
    globalSilentAudio.play().catch(() => {});
  }
};

export const pauseTrackDirectly = () => {
  if (globalPlayer && typeof globalPlayer.pauseVideo === "function") {
    globalPlayer.pauseVideo();
  }
  if (globalSilentAudio) {
    globalSilentAudio.pause();
  }
};

export const resumeTrackDirectly = () => {
  if (globalPlayer && typeof globalPlayer.playVideo === "function") {
    globalPlayer.playVideo();
  }
  // Synchronously play silent audio to capture Media Session authority on iOS
  if (globalSilentAudio) {
    globalSilentAudio.play().catch(() => {});
  }
};

export function HiddenPlayer() {
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const setProgress = useMusicStore((state) => state.setProgress);
  const setDuration = useMusicStore((state) => state.setDuration);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const volume = useMusicStore((state) => state.volume);
  const queue = useMusicStore((state) => state.queue);

  const playerRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (playerRef.current) {
        try {
          const time = await playerRef.current.getCurrentTime();
          const dur = await playerRef.current.getDuration();
          setProgress(time);
          
          if (useMusicStore.getState().duration === 0 && dur > 0) {
            setDuration(dur);
          }

          if ("mediaSession" in navigator && (navigator.mediaSession as any).setPositionState && dur > 0) {
            try {
              (navigator.mediaSession as any).setPositionState({
                duration: dur,
                playbackRate: 1,
                position: time,
              });
            } catch (e) {}
          }
        } catch (e) {}
      }
    }, 1000);
  };

  const stopProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Helper to register handlers (re-used to ensure they stay active)
  const registerMediaHandlers = () => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => {
        resumeTrackDirectly();
        useMusicStore.getState().setIsPlaying(true);
      }],
      ["pause", () => {
        pauseTrackDirectly();
        useMusicStore.getState().setIsPlaying(false);
      }],
      ["previoustrack", () => {
        const { currentTrack, queue, playPreviousTrack } = useMusicStore.getState();
        if (!currentTrack || queue.length === 0) return;
        const index = queue.findIndex(t => t.id === currentTrack.id);
        if (index > 0) {
          const prevTrack = queue[index - 1];
          playTrackDirectly(prevTrack.id);
          playPreviousTrack();
        }
      }],
      ["nexttrack", () => {
        const { currentTrack, queue, playNextTrack } = useMusicStore.getState();
        if (!currentTrack || queue.length === 0) return;
        const index = queue.findIndex(t => t.id === currentTrack.id);
        if (index !== -1 && index < queue.length - 1) {
          const nextTrack = queue[index + 1];
          playTrackDirectly(nextTrack.id);
          playNextTrack();
        }
      }],
      ["seekto", (details) => {
        if (globalPlayer && details.seekTime !== undefined) {
          globalPlayer.seekTo(details.seekTime);
          setProgress(details.seekTime);
        }
      }],
    ];

    for (const [action, handler] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
    }
  };

  // 1. Initial Registration & Silent Audio Setup
  useEffect(() => {
    globalSilentAudio = silentAudioRef.current;
    registerMediaHandlers();
    return () => {
      globalSilentAudio = null;
    };
  }, []);

  // 2. Metadata Synchronization (and handler refresh)
  useEffect(() => {
    if (!currentTrack || typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.author,
      artwork: [
        { src: currentTrack.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "128x128", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "192x192", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "256x256", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    // Refresh handlers whenever metadata changes - helps some Safari versions
    registerMediaHandlers();
  }, [currentTrack?.id, currentTrack?.title]);

  // 3. Playback State Synchronization
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Fallback sync for silent audio if direct calls were missed
    if (silentAudioRef.current) {
      if (isPlaying) silentAudioRef.current.play().catch(() => {});
      else silentAudioRef.current.pause();
    }
  }, [isPlaying]);

  // 4. Main Playback Logic Effect
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentTrack) return;

    try {
      if (typeof player.loadVideoById !== 'function') return;

      const isNewTrack = lastTrackId !== currentTrack.id;
      
      if (isNewTrack) {
        lastTrackId = currentTrack.id;
        player.loadVideoById(currentTrack.id);
        setDuration(0);
        setProgress(0);
        setIsPlaying(true); 
      } else {
        if (isPlaying) {
          player.playVideo();
          startProgressInterval();
        } else {
          if (typeof player.pauseVideo === 'function') {
            player.pauseVideo();
          }
          stopProgressInterval();
        }
      }
    } catch (err) {
      console.error("Player interaction error:", err);
    }
    
    return () => stopProgressInterval();
  }, [isPlaying, currentTrack?.id]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    globalPlayer = event.target;
    playerRef.current.setVolume(volume);
    const dur = event.target.getDuration();
    if (dur > 0) setDuration(dur);
    
    if (isPlaying) {
      event.target.playVideo();
      startProgressInterval();
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = async (event) => {
    const state = event.data;
    if (state === 1) {
      setIsPlaying(true);
      startProgressInterval();
      const dur = event.target.getDuration();
      if (dur > 0) setDuration(dur);
    } else if (state === 2) {
      setIsPlaying(false);
      stopProgressInterval();
    } else if (state === 0) {
      setIsPlaying(false);
      stopProgressInterval();
      setProgress(0);
      useMusicStore.getState().playNextTrack();
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed -left-[9999px] top-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <audio 
        ref={silentAudioRef}
        src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8H" 
        loop
        playsInline
      />
      <YouTube
        videoId={currentTrack.id}
        opts={{
          width: '1',
          height: '1',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            playsinline: 1,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
