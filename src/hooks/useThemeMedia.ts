import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterTheme } from "../data/characters";

type UseThemeMediaOptions = {
  character: CharacterTheme;
  isActive: boolean;
};

export function useThemeMedia({ character, isActive }: UseThemeMediaOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoReady) return;

    try {
      await video.play();
    } catch {
      // Otomatik oynatma tarayıcıda engellenebilir
    }
  }, [videoReady]);

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  useEffect(() => {
    setVideoReady(false);
  }, [character.id]);

  useEffect(() => {
    if (isActive) {
      void playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive, playVideo, pauseVideo]);

  useEffect(() => {
    return () => pauseVideo();
  }, [pauseVideo]);

  return {
    videoRef,
    videoReady,
    setVideoReady,
    hasVideo: videoReady,
  };
}
