import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterTheme } from "../data/characters";
import { cn } from "../lib/utils";

const START_FRAME_MS = 10500;
const LIGHTNING_PEEK_MS = 6000;
const LIGHTNING_AFTER_INTRO_MS = 3000;
const PRE_LIGHTNING_OPACITY = 0.5;
export const OUTRO_FADE_MS = 4000;

type IntroPhase = "startFrame" | "video" | "outro";

type ImperiusIntroProps = {
  character: CharacterTheme;
  onOutroStart: () => void;
  onOutroComplete: () => void;
};

export function ImperiusIntro({ character, onOutroStart, onOutroComplete }: ImperiusIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("startFrame");
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [showLightningPeek, setShowLightningPeek] = useState(false);
  const [outroActive, setOutroActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lightningRef = useRef<HTMLVideoElement>(null);
  const introSrc = character.media.intro ?? character.media.video;
  const lightningSrc = character.media.video;

  const startOutro = useCallback(() => {
    setPhase((current) => (current === "video" ? "outro" : current));
  }, []);

  const startIntroVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setPhase("video");
    void video.play().catch(() => {});
  }, []);

  const endLightningPeek = useCallback(() => {
    setShowLightningPeek(false);
    lightningRef.current?.pause();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setFirstFrameReady(false);

    const showFirstFrame = () => {
      video.currentTime = 0;
      video.pause();
      setFirstFrameReady(true);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      showFirstFrame();
    } else {
      video.addEventListener("loadeddata", showFirstFrame, { once: true });
    }

    return () => {
      video.removeEventListener("loadeddata", showFirstFrame);
    };
  }, [introSrc]);

  useEffect(() => {
    if (phase !== "startFrame" || !firstFrameReady) return;

    const lightningId = window.setTimeout(() => {
      setShowLightningPeek(true);
      const lightning = lightningRef.current;
      if (!lightning) return;
      lightning.currentTime = 0;
      void lightning.play().catch(() => {});
    }, LIGHTNING_PEEK_MS);

    const introId = window.setTimeout(startIntroVideo, START_FRAME_MS);
    const lightningEndId = window.setTimeout(
      endLightningPeek,
      START_FRAME_MS + LIGHTNING_AFTER_INTRO_MS
    );

    return () => {
      window.clearTimeout(lightningId);
      window.clearTimeout(introId);
      window.clearTimeout(lightningEndId);
    };
  }, [phase, firstFrameReady, startIntroVideo, endLightningPeek]);

  useEffect(() => {
    if (phase !== "outro") return;

    onOutroStart();
    const rafId = window.requestAnimationFrame(() => setOutroActive(true));
    const completeId = window.setTimeout(onOutroComplete, OUTRO_FADE_MS);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(completeId);
    };
  }, [phase, onOutroStart, onOutroComplete]);

  return (
    <div className="imperius-intro" aria-hidden>
      <div
        className={cn(
          "imperius-intro__fadeable",
          phase === "outro" && "imperius-intro__fadeable--outro",
          phase === "outro" && outroActive && "imperius-intro__fadeable--outro-active"
        )}
      >
        <video
          ref={videoRef}
          className={cn(
            "imperius-intro__video",
            phase === "startFrame" && "imperius-intro__video--prefade",
            phase === "startFrame" && firstFrameReady && "imperius-intro__video--fade-in"
          )}
          style={
            phase === "startFrame" && firstFrameReady
              ? {
                  animationDuration: `${START_FRAME_MS}ms`,
                  ["--intro-pre-lightning-opacity" as string]: String(PRE_LIGHTNING_OPACITY),
                }
              : undefined
          }
          src={introSrc}
          muted
          playsInline
          preload="auto"
          onEnded={startOutro}
        />
      </div>

      <video
        ref={lightningRef}
        className={cn(
          "imperius-intro__lightning",
          showLightningPeek && "imperius-intro__lightning--visible"
        )}
        src={lightningSrc}
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}
