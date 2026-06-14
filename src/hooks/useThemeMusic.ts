import { useCallback, useEffect, useRef } from "react";

type UseThemeMusicOptions = {
  src?: string;
  shouldPlay: boolean;
  volume?: number;
};

function isPlayable(audio: HTMLAudioElement) {
  return audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

export function useThemeMusic({
  src,
  shouldPlay,
  volume = 0.45,
}: UseThemeMusicOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldPlayRef = useRef(shouldPlay);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src || !shouldPlayRef.current) return false;

    audio.muted = false;
    audio.volume = volume;

    if (!isPlayable(audio)) return false;

    try {
      await audio.play();
      return !audio.paused;
    } catch {
      audio.muted = true;
      try {
        await audio.play();
        audio.muted = false;
        audio.volume = volume;
        return !audio.paused;
      } catch {
        return false;
      }
    }
  }, [src, volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    shouldPlayRef.current = shouldPlay;
  }, [shouldPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    let cancelled = false;

    const onReady = () => {
      if (cancelled || !shouldPlayRef.current) return;
      void tryPlay();
    };

    audio.addEventListener("canplaythrough", onReady);
    audio.addEventListener("canplay", onReady);

    if (isPlayable(audio)) onReady();
    else audio.load();

    return () => {
      cancelled = true;
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("canplay", onReady);
    };
  }, [src, tryPlay]);

  useEffect(() => {
    if (!shouldPlay) {
      pause();
      return;
    }
    void tryPlay();
  }, [shouldPlay, tryPlay, pause]);

  const playFromGesture = useCallback(
    (mayPlay?: boolean) => {
      const audio = audioRef.current;
      const allowed = mayPlay ?? shouldPlayRef.current;
      if (!audio || !src || !allowed) return;

      audio.muted = false;
      audio.volume = volume;
      if (isPlayable(audio)) void audio.play().catch(() => {});
      else {
        const onReady = () => {
          audio.removeEventListener("canplay", onReady);
          if (!shouldPlayRef.current && mayPlay !== true) return;
          void audio.play().catch(() => {});
        };
        audio.addEventListener("canplay", onReady);
        if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) audio.load();
      }
    },
    [src, volume]
  );

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  return { audioRef, playFromGesture };
}
