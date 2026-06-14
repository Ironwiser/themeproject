import { useEffect, useRef, type CSSProperties } from "react";
import { getCharacterDisplayName, type CharacterTheme } from "../data/characters";
import { ElectricBorder } from "./ElectricBorder";
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

  const tiles = QUADRANTS.map((q) =>
    q.position === "top-left" ? { ...q, character: imperius } : q
  );

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
                `theme-landing__cell--${position}`
              )}
              onClick={() => onSelect(character.id)}
              onMouseEnter={handleTileEnter}
              onMouseLeave={handleTileLeave}
              onFocus={handleTileEnter}
              onBlur={handleTileLeave}
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
