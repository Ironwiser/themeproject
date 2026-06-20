import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { getCharacterDisplayName, type CharacterTheme } from "../data/characters";
import { useIsMobile } from "../hooks/useIsMobile";
import { LandingEmberTabLabel } from "./LandingEmberTabLabel";
import { LandingEmberTabLabelGlow } from "./LandingEmberTabLabelGlow";
import { LandingImperiusTabEffect } from "./LandingImperiusTabEffect";
import { LandingImperiusTabElectricBorder } from "./LandingImperiusTabElectricBorder";
import {
  LandingPreviewEmberStack,
  LandingTabEmberStack,
  type TabEmberBoostPhase,
} from "./LandingTabEmberStack";
import { LandingQuickshoverTabLabelGlow } from "./LandingQuickshoverTabLabelGlow";
import { LandingVideoLabel } from "./LandingVideoLabel";
import { ThemeImageFrame } from "./ThemeImageFrame";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "../lib/utils";

type ThemeLandingProps = {
  characters: CharacterTheme[];
  onSelect: (characterId: string) => void;
};

type LandingSlotPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type LandingSlot = {
  position: LandingSlotPosition;
  character?: CharacterTheme;
};

const LANDING_SLOTS: LandingSlotPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const IMPERIUS_ELECTRIC_BLUE = {
  primary: "#52b8f0",
  glow: "#7dd4ff",
  accent: "#1e5088",
} as const;

const SLOT_CHARACTER_IDS: Partial<Record<LandingSlotPosition, string>> = {
  "top-left": "imperius",
  "top-right": "candyandblood",
  "bottom-left": "quickshover",
};

function getSlotTabLabel(slot: LandingSlot): string {
  if (slot.character?.id === "candyandblood") return "Candy & Blood";
  if (slot.character?.id === "imperius") return slot.character.name;
  if (slot.character?.id === "quickshover") return slot.character.name;
  if (slot.character) return getCharacterDisplayName(slot.character);
  const labels: Record<LandingSlotPosition, string> = {
    "top-left": "I",
    "top-right": "II",
    "bottom-left": "III",
    "bottom-right": "IV",
  };
  return labels[slot.position];
}

function hasLandingVideoLabel(characterId: string) {
  return characterId === "imperius" || characterId === "quickshover";
}

function getLandingVideoLabel(character: CharacterTheme) {
  if (character.id === "quickshover" || character.id === "imperius") return character.name;
  return getCharacterDisplayName(character);
}

const CNB_BOOST_FADE_MS = 2000;

type LandingPreviewCellProps = {
  character: CharacterTheme;
  onSelect: (characterId: string) => void;
};

function LandingPreviewCell({ character, onSelect }: LandingPreviewCellProps) {
  const isMobile = useIsMobile();
  const labelVideoRef = useRef<HTMLVideoElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const isHoveringTileRef = useRef(false);
  const previewBoostFadeTimerRef = useRef<number | undefined>(undefined);
  const [previewBoostPhase, setPreviewBoostPhase] = useState<TabEmberBoostPhase>("off");
  const isCnbPreview = character.id === "candyandblood";
  const isQuickshoverPreview = character.id === "quickshover";
  const landingEffectsEnabled = !isMobile;
  const previewVideosEnabled = landingEffectsEnabled && Boolean(character.media.video);
  const cnbPreviewEffectsEnabled = landingEffectsEnabled && isCnbPreview;
  const imageSrc = character.images?.landing ?? character.images?.portrait;
  const displayName = getCharacterDisplayName(character);
  const videoLabel = getLandingVideoLabel(character);
  const showStyledVideoLabel = hasLandingVideoLabel(character.id);
  const showVideoLabel = showStyledVideoLabel;

  useEffect(() => {
    return () => window.clearTimeout(previewBoostFadeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!landingEffectsEnabled) {
      window.clearTimeout(previewBoostFadeTimerRef.current);
      setPreviewBoostPhase("off");
      isHoveringTileRef.current = false;
    }
  }, [landingEffectsEnabled]);

  const handleTileEnter = () => {
    isHoveringTileRef.current = true;
    if (cnbPreviewEffectsEnabled) {
      window.clearTimeout(previewBoostFadeTimerRef.current);
      setPreviewBoostPhase("on");
    }
    const video = hoverVideoRef.current;
    if (!video) return;
    video.loop = true;
    video.currentTime = 0;
    void video.play().catch(() => {});
  };

  const handleTileLeave = () => {
    isHoveringTileRef.current = false;
    if (cnbPreviewEffectsEnabled) {
      setPreviewBoostPhase("fading");
      previewBoostFadeTimerRef.current = window.setTimeout(
        () => setPreviewBoostPhase("off"),
        CNB_BOOST_FADE_MS
      );
    }
    const video = hoverVideoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const handleHoverVideoEnded = () => {
    if (!isHoveringTileRef.current) return;
    const video = hoverVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  };

  if (!imageSrc) return null;

  return (
    <button
      type="button"
      className={cn(
        "theme-landing__cell theme-landing__cell--active theme-landing__cell--stage",
        character.id === "imperius" && "theme-landing__cell--fit-cover theme-landing__cell--imperius-preview",
        character.id === "candyandblood" && "theme-landing__cell--fit-cover theme-landing__cell--ember",
        cnbPreviewEffectsEnabled && previewBoostPhase === "on" && "theme-landing__cell--ember-lit",
        cnbPreviewEffectsEnabled && previewBoostPhase === "fading" && "theme-landing__cell--ember-fading",
        character.id === "quickshover" && "theme-landing__cell--fit-cover theme-landing__cell--quickshover-preview"
      )}
      onClick={() => onSelect(character.id)}
      onMouseEnter={cnbPreviewEffectsEnabled || previewVideosEnabled ? handleTileEnter : undefined}
      onMouseLeave={cnbPreviewEffectsEnabled || previewVideosEnabled ? handleTileLeave : undefined}
      onFocus={cnbPreviewEffectsEnabled || previewVideosEnabled ? handleTileEnter : undefined}
      onBlur={cnbPreviewEffectsEnabled || previewVideosEnabled ? handleTileLeave : undefined}
      style={
        {
          "--tile-primary": character.colors.primary,
          "--tile-glow": character.colors.glow ?? character.colors.primary,
          "--tile-accent": character.colors.accent,
        } as CSSProperties
      }
    >
      <div className="theme-landing__cell-inner">
        <ThemeImageFrame
          variant="landing"
          src={imageSrc}
          alt={character.name}
          character={character}
          className="theme-landing__frame"
        />

        {cnbPreviewEffectsEnabled && (
          <LandingPreviewEmberStack boostPhase={previewBoostPhase} />
        )}

        {previewVideosEnabled && (
          <video
            ref={hoverVideoRef}
            className="theme-landing__lightning"
            src={character.media.video}
            muted
            loop
            playsInline
            preload="auto"
            onEnded={handleHoverVideoEnded}
            aria-hidden
          />
        )}

        {showVideoLabel ? (
          <LandingVideoLabel
            character={character}
            label={videoLabel}
            labelVideoRef={labelVideoRef}
            effectsEnabled={landingEffectsEnabled}
          />
        ) : character.id === "candyandblood" ? (
          <>
            <div className="theme-landing__label-layer theme-landing__label-layer--text theme-landing__label-layer--candyandblood-title">
              <span className="theme-landing__label theme-candyandblood-name">
                <span className="theme-candyandblood-name__line">Candy</span>
                <span className="theme-candyandblood-name__line">and</span>
                <span className="theme-candyandblood-name__line">Blood</span>
              </span>
            </div>
            <div className="theme-landing__label-layer theme-landing__label-layer--text theme-landing__label-layer--coming-soon">
              <span className="theme-landing__label theme-candyandblood-coming-soon">
                <span className="theme-candyandblood-name__line">Coming</span>
                <span className="theme-candyandblood-name__line">Soon...</span>
              </span>
            </div>
          </>
        ) : (
          <div className="theme-landing__label-layer theme-landing__label-layer--text">
            <span className="theme-landing__label">{displayName}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function ThemeLanding({ characters, onSelect }: ThemeLandingProps) {
  const isMobile = useIsMobile();
  const landingEffectsEnabled = !isMobile;
  const [activeSlot, setActiveSlot] = useState<LandingSlotPosition>("top-left");
  const [cnbBoostPhase, setCnbBoostPhase] = useState<TabEmberBoostPhase>("off");
  const [imperiusTabHover, setImperiusTabHover] = useState(false);
  const cnbBoostFadeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(cnbBoostFadeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!landingEffectsEnabled) {
      window.clearTimeout(cnbBoostFadeTimerRef.current);
      setCnbBoostPhase("off");
      setImperiusTabHover(false);
    }
  }, [landingEffectsEnabled]);

  const handleCnbTabEnter = () => {
    window.clearTimeout(cnbBoostFadeTimerRef.current);
    setCnbBoostPhase("on");
  };

  const handleCnbTabLeave = () => {
    setCnbBoostPhase("fading");
    cnbBoostFadeTimerRef.current = window.setTimeout(() => setCnbBoostPhase("off"), CNB_BOOST_FADE_MS);
  };

  const slots = useMemo<LandingSlot[]>(
    () =>
      LANDING_SLOTS.map((position) => ({
        position,
        character: characters.find((c) => c.id === SLOT_CHARACTER_IDS[position]),
      })),
    [characters]
  );

  const activeTile = slots.find((slot) => slot.position === activeSlot) ?? slots[0];

  const tabsFrameStyle = {
    "--landing-frame-primary":
      activeTile.character?.id === "imperius"
        ? IMPERIUS_ELECTRIC_BLUE.primary
        : activeTile.character?.colors.primary ?? "rgba(255, 255, 255, 0.35)",
    "--landing-frame-accent":
      activeTile.character?.id === "imperius"
        ? IMPERIUS_ELECTRIC_BLUE.accent
        : activeTile.character?.colors.accent ?? "rgba(255, 255, 255, 0.12)",
    "--landing-frame-glow":
      activeTile.character?.id === "imperius"
        ? IMPERIUS_ELECTRIC_BLUE.glow
        : activeTile.character?.colors.glow ?? activeTile.character?.colors.primary ?? "rgba(255, 255, 255, 0.35)",
  } as CSSProperties;

  return (
    <div
      className={cn("theme-landing", isMobile && "theme-landing--mobile")}
      role="dialog"
      aria-label="Karakter seçimi"
    >
      <div className="theme-landing__stage">
        {activeTile.character ? (
          <LandingPreviewCell character={activeTile.character} onSelect={onSelect} />
        ) : (
          <div className="theme-landing__cell theme-landing__cell--empty theme-landing__cell--stage" aria-hidden />
        )}
      </div>

      <nav className="theme-landing__tabs" aria-label="Karakter sekmeleri">
        <Tabs
          className="theme-landing__tabs-root"
          value={activeSlot}
          onValueChange={(value) => setActiveSlot(value as LandingSlotPosition)}
        >
          <TabsList className="theme-landing__tabs-list" style={tabsFrameStyle}>
            {slots.map((slot) => (
              <TabsTrigger
                key={slot.position}
                value={slot.position}
                onMouseEnter={
                  landingEffectsEnabled && slot.character?.id === "candyandblood"
                    ? () => handleCnbTabEnter()
                    : landingEffectsEnabled && slot.character?.id === "imperius"
                      ? () => setImperiusTabHover(true)
                      : undefined
                }
                onMouseLeave={
                  landingEffectsEnabled && slot.character?.id === "candyandblood"
                    ? () => handleCnbTabLeave()
                    : landingEffectsEnabled && slot.character?.id === "imperius"
                      ? () => setImperiusTabHover(false)
                      : undefined
                }
                onFocus={
                  landingEffectsEnabled && slot.character?.id === "candyandblood"
                    ? () => handleCnbTabEnter()
                    : landingEffectsEnabled && slot.character?.id === "imperius"
                      ? () => setImperiusTabHover(true)
                      : undefined
                }
                onBlur={
                  landingEffectsEnabled && slot.character?.id === "candyandblood"
                    ? () => handleCnbTabLeave()
                    : landingEffectsEnabled && slot.character?.id === "imperius"
                      ? () => setImperiusTabHover(false)
                      : undefined
                }
                className={cn(
                  "theme-landing__tab",
                  slot.character && "theme-landing__tab--ready",
                  slot.character?.id === "imperius" && "theme-landing__tab--lightning theme-landing__tab--imperius",
                  slot.character?.id === "quickshover" && "theme-landing__tab--lightning theme-landing__tab--quickshover",
                  slot.character?.id === "candyandblood" && "theme-landing__tab--ember",
                  !slot.character && "theme-landing__tab--empty"
                )}
                overlay={
                  landingEffectsEnabled && slot.character?.id === "candyandblood" ? (
                    <LandingTabEmberStack boostPhase={cnbBoostPhase} />
                  ) : landingEffectsEnabled && slot.character?.id === "imperius" ? (
                    <>
                      {slot.character.media.video ? (
                        <LandingImperiusTabEffect videoSrc={slot.character.media.video} />
                      ) : null}
                      <LandingImperiusTabElectricBorder triple={imperiusTabHover} />
                    </>
                  ) : landingEffectsEnabled &&
                    slot.character?.id === "quickshover" &&
                    slot.character.media.video ? (
                    <LandingImperiusTabEffect videoSrc={slot.character.media.video} />
                  ) : undefined
                }
                labelGlow={
                  landingEffectsEnabled && slot.character?.id === "candyandblood" ? (
                    <LandingEmberTabLabelGlow lit={cnbBoostPhase === "on"} />
                  ) : slot.character?.id === "quickshover" ? (
                    <LandingQuickshoverTabLabelGlow />
                  ) : undefined
                }
                style={
                  slot.character
                    ? ({
                        "--tab-primary":
                          slot.character.id === "imperius"
                            ? IMPERIUS_ELECTRIC_BLUE.primary
                            : slot.character.colors.primary,
                        "--tab-glow":
                          slot.character.id === "imperius"
                            ? IMPERIUS_ELECTRIC_BLUE.glow
                            : slot.character.colors.glow ?? slot.character.colors.primary,
                        "--tab-accent":
                          slot.character.id === "imperius"
                            ? IMPERIUS_ELECTRIC_BLUE.accent
                            : slot.character.colors.accent,
                        "--tab-active-color":
                          slot.character.id === "imperius"
                            ? IMPERIUS_ELECTRIC_BLUE.primary
                            : slot.character.colors.primary,
                        "--tab-active-glow":
                          slot.character.id === "imperius"
                            ? IMPERIUS_ELECTRIC_BLUE.glow
                            : slot.character.colors.glow ?? slot.character.colors.primary,
                        "--ember-flame-hot": slot.character.colors.glow ?? slot.character.colors.primary,
                        "--ember-flame-mid": slot.character.colors.primary,
                      } as CSSProperties)
                    : undefined
                }
              >
                {slot.character?.id === "candyandblood" ? (
                  <LandingEmberTabLabel label={getSlotTabLabel(slot)} />
                ) : slot.character?.id === "quickshover" ? (
                  <span className="theme-tab-quickshover-label__text">{getSlotTabLabel(slot)}</span>
                ) : (
                  getSlotTabLabel(slot)
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </nav>
    </div>
  );
}
