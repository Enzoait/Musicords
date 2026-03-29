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
          
          // Also try to get duration if it's still 0
          if (useMusicStore.getState().duration === 0) {
            const dur = await playerRef.current.getDuration();
            if (dur > 0) setDuration(dur);
          }
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

  const lastVideoId = useRef<string | null>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentTrack) return;

    try {
      const isNewTrack = lastVideoId.current !== currentTrack.id;
      
      if (isNewTrack) {
        lastVideoId.current = currentTrack.id;
        player.loadVideoById(currentTrack.id);
        setDuration(0);
        setProgress(0);
        // loadVideoById plays automatically, so we sync our store state
        setIsPlaying(true); 
      } else {
        // Same track, just handle play/pause toggle
        if (isPlaying) {
          player.playVideo();
          startProgressInterval();
        } else {
          player.pauseVideo();
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
    // 1: PLAYING, 2: PAUSED, 0: ENDED
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
    <div className="opacity-0 pointer-events-none absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      <YouTube
        videoId={currentTrack.id}
        opts={{
          width: '10',
          height: '10',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
