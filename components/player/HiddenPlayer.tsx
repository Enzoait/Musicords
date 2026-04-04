"use client";

import { useEffect, useRef } from "react";
import YouTube, { type YouTubeProps } from "react-youtube";
import { useMusicStore } from "@/lib/store";

let globalPlayer: any = null;
let globalSilentAudio: HTMLAudioElement | null = null;
let lastTrackId: string | null = null;

export const playTrackDirectly = async (id: string) => {
  lastTrackId = id;

  if (globalSilentAudio) {
    try {
      globalSilentAudio.volume = 0.001;
      await globalSilentAudio.play();
    } catch {}
  }

  if (globalPlayer && typeof globalPlayer.loadVideoById === "function") {
    globalPlayer.loadVideoById(id);
  }
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
};

export const pauseTrackDirectly = () => {
  if (globalPlayer?.pauseVideo) globalPlayer.pauseVideo();
  if (globalSilentAudio) globalSilentAudio.pause();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "paused";
  }
};

export const resumeTrackDirectly = async () => {
  if (globalSilentAudio) {
    try {
      await globalSilentAudio.play();
    } catch {}
  }

  setTimeout(() => {
    globalPlayer?.playVideo?.();
  }, 300);

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
};

export function HiddenPlayer() {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const setProgress = useMusicStore((s) => s.setProgress);
  const setDuration = useMusicStore((s) => s.setDuration);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const volume = useMusicStore((s) => s.volume);
  const queue = useMusicStore((s) => s.queue);

  const playerRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<any>(null);
  const keepAliveRef = useRef<any>(null);

  const startProgressInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        if (!playerRef.current) return;

        const time = await playerRef.current.getCurrentTime();
        const dur = await playerRef.current.getDuration();

        setProgress(time);
        if (dur > 0) setDuration(dur);

        if ("mediaSession" in navigator && dur > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: dur,
              playbackRate: 1,
              position: time,
            });
          } catch {}
        }
      } catch {}
    }, 1000);
  };

  const stopProgressInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startKeepAlive = () => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);

    keepAliveRef.current = setInterval(() => {
      if (silentAudioRef.current && !silentAudioRef.current.paused) {
        silentAudioRef.current.currentTime += 0.001;
      }
    }, 20000);
  };

  const registerMediaHandlers = () => {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        resumeTrackDirectly();
        setIsPlaying(true);
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        pauseTrackDirectly();
        setIsPlaying(false);
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        const { currentTrack, queue, playNextTrack } =
          useMusicStore.getState();

        const i = queue.findIndex((t) => t.id === currentTrack?.id);
        if (i < queue.length - 1) {
          playTrackDirectly(queue[i + 1].id);
          playNextTrack();
        }
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        const { currentTrack, queue, playPreviousTrack } =
          useMusicStore.getState();

        const i = queue.findIndex((t) => t.id === currentTrack?.id);
        if (i > 0) {
          playTrackDirectly(queue[i - 1].id);
          playPreviousTrack();
        }
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          globalPlayer?.seekTo(details.seekTime);
          setProgress(details.seekTime);
        }
      });
    } catch {}
  };

  useEffect(() => {
    globalSilentAudio = silentAudioRef.current;

    if (silentAudioRef.current) {
      silentAudioRef.current.volume = 0.001;
    }

    registerMediaHandlers();
    startKeepAlive();

    return () => {
      globalSilentAudio = null;
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.author,
      artwork: [{ src: currentTrack.thumbnail, sizes: "512x512" }],
    });

    registerMediaHandlers();
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    if (silentAudioRef.current) {
      if (isPlaying) silentAudioRef.current.play().catch(() => {});
      else silentAudioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentTrack) return;

    const isNew = lastTrackId !== currentTrack.id;

    if (isNew) {
      playTrackDirectly(currentTrack.id);
      setDuration(0);
      setProgress(0);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        player.playVideo();
        startProgressInterval();
      } else {
        player.pauseVideo();
        stopProgressInterval();
      }
    }

    return stopProgressInterval;
  }, [isPlaying, currentTrack?.id]);

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  const onReady: YouTubeProps["onReady"] = (e) => {
    playerRef.current = e.target;
    globalPlayer = e.target;

    e.target.setVolume(volume);

    if (isPlaying) {
      e.target.playVideo();
      startProgressInterval();
    }
  };

  const onStateChange: YouTubeProps["onStateChange"] = (e) => {
    const s = e.data;

    if (s === 1) {
      setIsPlaying(true);
      startProgressInterval();
    } else if (s === 2) {
      setIsPlaying(false);
      stopProgressInterval();
    } else if (s === 0) {
      setIsPlaying(false);
      stopProgressInterval();
      useMusicStore.getState().playNextTrack();
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="hidden">
      <audio
        ref={silentAudioRef}
        src="/silent.mp3" // 🔥 IMPORTANT → vrai fichier audio
        loop
        playsInline
        preload="auto"
        {...({ disableRemotePlayback: true } as any)}
      />

      <YouTube
        videoId={currentTrack.id}
        opts={{
          width: "1",
          height: "1",
          playerVars: {
            autoplay: 1,
            controls: 0,
            playsinline: 1,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}