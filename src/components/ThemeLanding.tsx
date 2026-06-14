import { useEffect, useRef, type CSSProperties } from "react";
import { getCharacterDisplayName, type CharacterTheme } from "../data/characters";
import { ElectricBorder } from "./ElectricBorder";
import { LandingEmberEffect } from "./LandingEmberEffect";
import { ThemeImageFrame } from "./ThemeImageFrame";
import { cn } from "../lib/utils";

type ThemeLandingProps = {
  characters: CharacterTheme[];
  onSelect: (characterId: string) => void;
};

type Quadrant = {
  character?: CharacterTheme;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const QUADRANTS: Quadrant[] = [
  { position: "top-left", character: undefined },
  { position: "top-right" },
  { position: "bottom-left" },
  { position: "bottom-right" },
];

export function ThemeLanding({ characters, onSelect }: ThemeLandingProps) {
  const labelVideoRef = useRef<HTMLVideoElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const isHoveringTileRef = useRef(false);

  const imperius = characters.find((c) => c.id === "imperius");
  const candyAndBlood = characters.find((c) => c.id === "candyandblood");

  useEffect(() => {
    void labelVideoRef.current?.play().catch(() => {});
  }, [imperius?.media.video]);

  const handleTileEnter = () => {
    isHoveringTileRef.current = true;
    const video = hoverVideoRef.current;
    if (!video) return;
    video.loop = true;
    video.currentTime = 0;
    void video.play().catch(() => {});
  };

  const handleTileLeave = () => {
    isHoveringTileRef.current = false;
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

  const tiles = QUADRANTS.map((q) => {
    if (q.position === "top-left") return { ...q, character: imperius };
    if (q.position === "top-right") return { ...q, character: candyAndBlood };
    return q;
  });

  return (
    <div className="theme-landing" role="dialog" aria-label="Karakter seçimi">
      {tiles.map(({ position, character }) => {
        const imageSrc = character?.images?.landing ?? character?.images?.portrait;
        const isActive = Boolean(character);

        if (isActive && character && imageSrc) {
          const displayName = getCharacterDisplayName(character);

          return (
            <button
              key={position}
              type="button"
              className={cn(
                "theme-landing__cell theme-landing__cell--active",
                `theme-landing__cell--${position}`,
                character.id === "candyandblood" && "theme-landing__cell--natural-img theme-landing__cell--ember"
              )}
              onClick={() => onSelect(character.id)}
              onMouseEnter={character.media.video ? handleTileEnter : undefined}
              onMouseLeave={character.media.video ? handleTileLeave : undefined}
              onFocus={character.media.video ? handleTileEnter : undefined}
              onBlur={character.media.video ? handleTileLeave : undefined}
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

              {character.id === "candyandblood" && <LandingEmberEffect />}

              {character.media.video && (
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

              {character.id === "imperius" ? (
                <>
                  <div className="theme-landing__label-layer theme-landing__label-layer--back">
                    <span className="theme-landing__label theme-imperius-name theme-landing__label--electric">
                      <span className="theme-landing__label__frame theme-landing__label__frame--back">
                        <span className="theme-landing__label__frame-veil" aria-hidden="true" />
                        {character.media.video && (
                          <video
                            ref={labelVideoRef}
                            className="theme-landing__label__lightning"
                            src={character.media.video}
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="auto"
                            aria-hidden
                          />
                        )}
                        <span className="theme-landing__label__frame-tint" aria-hidden="true" />
                        <span
                          className="theme-landing__label__text theme-landing__label__text--sizer"
                          aria-hidden="true"
                        >
                          {displayName}
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="theme-landing__label-layer theme-landing__label-layer--text">
                    <span className="theme-landing__label theme-imperius-name theme-landing__label--electric">
                      <span className="theme-landing__label__frame theme-landing__label__frame--text-only">
                        <span
                          className="theme-landing__label__text theme-landing__label__text--sizer"
                          aria-hidden="true"
                        >
                          {displayName}
                        </span>
                        <ElectricBorder
                          variant="text"
                          className="theme-landing__label__corner-electric"
                        >
                          <span className="theme-landing__label__electric-stack">
                            <span className="theme-landing__label__text">{displayName}</span>
                            <span
                              className="theme-landing__label__text theme-landing__label__text--electric-fx"
                              aria-hidden="true"
                            >
                              {displayName}
                            </span>
                            <span className="theme-landing__label__frame-ornaments" aria-hidden="true">
                              <span className="theme-landing__label__frame-corner theme-landing__label__frame-corner--tl">
                                <span className="theme-landing__label__frame-corner-stroke" />
                                <span
                                  className="theme-landing__label__frame-corner-stroke theme-landing__label__frame-corner-stroke--electric-fx"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="theme-landing__label__frame-corner theme-landing__label__frame-corner--tr">
                                <span className="theme-landing__label__frame-corner-stroke" />
                                <span
                                  className="theme-landing__label__frame-corner-stroke theme-landing__label__frame-corner-stroke--electric-fx"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="theme-landing__label__frame-corner theme-landing__label__frame-corner--bl">
                                <span className="theme-landing__label__frame-corner-stroke" />
                                <span
                                  className="theme-landing__label__frame-corner-stroke theme-landing__label__frame-corner-stroke--electric-fx"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="theme-landing__label__frame-corner theme-landing__label__frame-corner--br">
                                <span className="theme-landing__label__frame-corner-stroke" />
                                <span
                                  className="theme-landing__label__frame-corner-stroke theme-landing__label__frame-corner-stroke--electric-fx"
                                  aria-hidden="true"
                                />
                              </span>
                            </span>
                          </span>
                        </ElectricBorder>
                      </span>
                    </span>
                  </div>
                </>
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

        return (
          <div
            key={position}
            className={cn("theme-landing__cell theme-landing__cell--empty", `theme-landing__cell--${position}`)}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
