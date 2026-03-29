"use client";

import { useEffect, useRef } from "react";
import YouTube, { type YouTubeProps } from "react-youtube";
import { useMusicStore } from "@/lib/store";

export function HiddenPlayer() {
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const setProgress = useMusicStore((state) => state.setProgress);
  const setDuration = useMusicStore((state) => state.setDuration);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const volume = useMusicStore((state) => state.volume);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (playerRef.current) {
        try {
          const time = await playerRef.current.getCurrentTime();
          setProgress(time);
        } catch (e) {
          // ignore
        }
      }
    }, 1000);
  };

  const stopProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (playerRef.current && currentTrack) {
      if (isPlaying) {
        playerRef.current.playVideo();
        startProgressInterval();
      } else {
        playerRef.current.pauseVideo();
        stopProgressInterval();
      }
    }
    
    return () => stopProgressInterval();
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (isPlaying) {
      playerRef.current.playVideo();
      startProgressInterval();
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = async (event) => {
    // 1: PLAYING, 2: PAUSED, 0: ENDED
    if (event.data === 1) {
      setIsPlaying(true);
      startProgressInterval();
      const dur = await event.target.getDuration();
      setDuration(dur);
    } else if (event.data === 2) {
      setIsPlaying(false);
      stopProgressInterval();
    } else if (event.data === 0) {
      setIsPlaying(false);
      stopProgressInterval();
      setProgress(0);
      // Optional: Logic to play next track
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="opacity-0 pointer-events-none absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      <YouTube
        videoId={currentTrack.id}
        opts={{
          width: '10',
          height: '10',
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
