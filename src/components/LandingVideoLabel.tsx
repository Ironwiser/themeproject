import { useEffect, type RefObject } from "react";
import type { CharacterTheme } from "../data/characters";
import { ElectricBorder } from "./ElectricBorder";
import { cn } from "../lib/utils";

type LandingVideoLabelProps = {
  character: CharacterTheme;
  label: string;
  labelVideoRef: RefObject<HTMLVideoElement | null>;
  effectsEnabled?: boolean;
};

function getLandingLabelNameClass(characterId: string) {
  if (characterId === "quickshover") return "theme-quickshover-name";
  return "theme-imperius-name";
}

function isPsychedelicLabelBorder(characterId: string) {
  return characterId === "quickshover";
}

function LandingVideoLabelOrnaments({ withElectricFx }: { withElectricFx: boolean }) {
  const corners = ["tl", "tr", "bl", "br"] as const;

  return (
    <span className="theme-landing__label__frame-ornaments" aria-hidden="true">
      {corners.map((corner) => (
        <span
          key={corner}
          className={`theme-landing__label__frame-corner theme-landing__label__frame-corner--${corner}`}
        >
          <span className="theme-landing__label__frame-corner-stroke" />
          {withElectricFx ? (
            <span
              className="theme-landing__label__frame-corner-stroke theme-landing__label__frame-corner-stroke--electric-fx"
              aria-hidden="true"
            />
          ) : null}
        </span>
      ))}
    </span>
  );
}

function LandingVideoLabelPsychedelicBorder() {
  return (
    <span className="theme-landing__label__psychedelic-border" aria-hidden="true">
      <span className="theme-landing__label__psychedelic-border__spin">
        <span className="theme-landing__label__psychedelic-border__gradient" />
      </span>
      <span className="theme-landing__label__psychedelic-border__glow" />
      <span className="theme-landing__label__psychedelic-border__pulse" />
    </span>
  );
}

function LandingVideoLabelTextLayer({
  label,
  labelNameClass,
  psychedelicBorder,
  effectsEnabled,
}: {
  label: string;
  labelNameClass: string;
  psychedelicBorder: boolean;
  effectsEnabled: boolean;
}) {
  const stack = (
    <span className="theme-landing__label__electric-stack">
      <span className="theme-landing__label__text">{label}</span>
      {effectsEnabled && !psychedelicBorder ? (
        <span className="theme-landing__label__text theme-landing__label__text--electric-fx" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {effectsEnabled && psychedelicBorder ? (
        <span className="theme-landing__label__text theme-landing__label__text--psychedelic-fx" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {!psychedelicBorder ? <LandingVideoLabelOrnaments withElectricFx={effectsEnabled} /> : null}
    </span>
  );

  const frameClassName = cn(
    "theme-landing__label__frame theme-landing__label__frame--text-only",
    psychedelicBorder && "theme-landing__label__frame--psychedelic"
  );

  return (
    <div className="theme-landing__label-layer theme-landing__label-layer--text">
      <span
        className={cn(
          "theme-landing__label",
          labelNameClass,
          "theme-landing__label--electric",
          psychedelicBorder && "theme-landing__label--psychedelic"
        )}
      >
        <span className={frameClassName}>
          {psychedelicBorder ? <LandingVideoLabelPsychedelicBorder /> : null}
          <span className="theme-landing__label__text theme-landing__label__text--sizer" aria-hidden="true">
            {label}
          </span>
          {effectsEnabled && !psychedelicBorder ? (
            <ElectricBorder variant="text" className="theme-landing__label__corner-electric">
              {stack}
            </ElectricBorder>
          ) : (
            stack
          )}
        </span>
      </span>
    </div>
  );
}

function LandingVideoLabelBackLayer({
  character,
  label,
  labelNameClass,
  labelVideoRef,
  playVideo,
}: {
  character: CharacterTheme;
  label: string;
  labelNameClass: string;
  labelVideoRef: RefObject<HTMLVideoElement | null>;
  playVideo: boolean;
}) {
  if (!character.media.video) return null;

  const handleVideoLoaded = (video: HTMLVideoElement) => {
    if (playVideo) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div className="theme-landing__label-layer theme-landing__label-layer--back">
      <span className={cn("theme-landing__label", labelNameClass, "theme-landing__label--electric")}>
        <span className="theme-landing__label__frame theme-landing__label__frame--back">
          <span className="theme-landing__label__frame-veil" aria-hidden="true" />
          <video
            ref={labelVideoRef}
            className="theme-landing__label__lightning"
            src={character.media.video}
            muted
            loop={playVideo}
            playsInline
            autoPlay={playVideo}
            preload="auto"
            onLoadedData={(event) => handleVideoLoaded(event.currentTarget)}
            onCanPlay={(event) => handleVideoLoaded(event.currentTarget)}
            aria-hidden
          />
          <span className="theme-landing__label__frame-tint" aria-hidden="true" />
          <span className="theme-landing__label__text theme-landing__label__text--sizer" aria-hidden="true">
            {label}
          </span>
        </span>
      </span>
    </div>
  );
}

export function LandingVideoLabel({
  character,
  label,
  labelVideoRef,
  effectsEnabled = true,
}: LandingVideoLabelProps) {
  useEffect(() => {
    if (!effectsEnabled) {
      const video = labelVideoRef.current;
      if (!video) return;
      video.pause();
      video.currentTime = 0;
      return;
    }
    void labelVideoRef.current?.play().catch(() => {});
  }, [character.media.video, labelVideoRef, effectsEnabled]);

  if (!character.media.video) return null;

  const labelNameClass = getLandingLabelNameClass(character.id);
  const psychedelicBorder = isPsychedelicLabelBorder(character.id);

  return (
    <>
      <LandingVideoLabelBackLayer
        character={character}
        label={label}
        labelNameClass={labelNameClass}
        labelVideoRef={labelVideoRef}
        playVideo={effectsEnabled}
      />
      <LandingVideoLabelTextLayer
        label={label}
        labelNameClass={labelNameClass}
        psychedelicBorder={psychedelicBorder}
        effectsEnabled={effectsEnabled}
      />
    </>
  );
}
