import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getCharacterDisplayName, type CharacterTheme } from "../data/characters";
import { THEME_DEBUG_NO_EFFECTS } from "../config/debug";
import { ThemeElectricIconButton } from "./ThemeElectricIconButton";
import { ThemeGalleryModal } from "./ThemeGalleryModal";
import { ThemeImageFrame } from "./ThemeImageFrame";
import { useThemeMedia } from "../hooks/useThemeMedia";
import { cn } from "../lib/utils";

type ThemeViewProps = {
  character: CharacterTheme;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  backgroundActive?: boolean;
  contentVisible?: boolean;
  contentFadeIn?: boolean;
};

export function ThemeView({
  character,
  muted,
  onMutedChange,
  backgroundActive = true,
  contentVisible = true,
  contentFadeIn = false,
}: ThemeViewProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const galleryImages = character.images?.gallery ?? [];
  const featuredLines = character.featuredLines ?? [];
  const isWideHero = character.images?.heroLayout === "wide";
  const heroVideoSrc = character.images?.heroVideo;
  const showBgVideo = Boolean(character.media.video) && !heroVideoSrc;
  const { videoRef, setVideoReady } = useThemeMedia({
    character,
    isActive: backgroundActive && showBgVideo,
  });
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !heroVideoSrc) return;

    if (!backgroundActive) {
      video.pause();
      return;
    }

    const play = () => {
      void video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) play();
    else video.addEventListener("canplay", play, { once: true });

    return () => {
      video.removeEventListener("canplay", play);
      video.pause();
    };
  }, [heroVideoSrc, backgroundActive, character.id]);

  useEffect(() => {
    setLineIndex(0);
    setGalleryIndex(null);
  }, [character.id]);

  useEffect(() => {
    if (featuredLines.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % featuredLines.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [featuredLines.length, character.id]);

  return (
    <div
      className={cn(
        "theme-view absolute inset-0",
        isWideHero && "theme-view--wide",
        character.id === "candyandblood" && "theme-view--candyandblood",
        character.id === "quickshover" && "theme-view--quickshover"
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          !backgroundActive && "invisible pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            background: THEME_DEBUG_NO_EFFECTS ? "#000" : character.colors.gradient,
          }}
        />

        {!THEME_DEBUG_NO_EFFECTS && showBgVideo && (
          <video
            key={character.id}
            ref={videoRef}
            className="theme-view__bg-video absolute inset-0 h-full w-full object-cover"
            src={character.media.video}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
          />
        )}

        {!THEME_DEBUG_NO_EFFECTS && (
          <>
            {!isWideHero && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            )}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(ellipse 55% 45% at 80% 20%, ${character.colors.glow ?? character.colors.primary}18, transparent)`,
              }}
            />
            {!isWideHero && (
              <div
                className="absolute inset-0 opacity-35"
                style={{
                  background: `radial-gradient(ellipse 50% 70% at 0% 100%, ${character.colors.accent}28, transparent)`,
                }}
              />
            )}
          </>
        )}
      </div>

      <div
        className={cn(
          "theme-view__content absolute inset-0",
          isWideHero && "theme-view__content--wide",
          contentFadeIn && "theme-view__content--fade-in",
          !contentVisible && "invisible pointer-events-none opacity-0"
        )}
        style={contentFadeIn ? { animationDuration: "3000ms" } : undefined}
      >
        {(character.images?.hero || heroVideoSrc) && (
          <div
            className={cn(
              "theme-showcase-layer",
              character.images?.heroLayout === "wide" && "theme-showcase-layer--wide",
              heroVideoSrc && "theme-showcase-layer--hero-video"
            )}
          >
            {THEME_DEBUG_NO_EFFECTS ? (
              <img
                src={character.images?.hero}
                alt={character.name}
                className={cn("theme-hero-plain", isWideHero && "theme-hero-plain--wide")}
                decoding="sync"
                draggable={false}
              />
            ) : heroVideoSrc ? (
              <video
                ref={heroVideoRef}
                className="theme-hero-video"
                src={heroVideoSrc}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                aria-label={character.name}
              />
            ) : (
              character.images?.hero && (
                <ThemeImageFrame
                  src={character.images.hero}
                  alt={character.name}
                  character={character}
                  variant={character.images.heroLayout === "wide" ? "showcase-wide" : "showcase"}
                  showcaseFill={character.id === "candyandblood"}
                />
              )
            )}
          </div>
        )}

        <div
          className={cn("theme-view__panel", isWideHero && "theme-view__panel--wide")}
        >
          <div className="theme-view__copy">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="h-px w-12"
                style={{ background: `linear-gradient(90deg, ${character.colors.primary}, transparent)` }}
              />
              <div
                className="h-1.5 w-1.5 rotate-45"
                style={{ backgroundColor: character.colors.primary }}
              />
            </div>

            <p className="mb-4 text-xs font-medium italic tracking-wide text-white/70 md:text-sm">
              {character.tagline}
            </p>

            {character.epithets && character.epithets.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {character.epithets.map((epithet) => (
                  <span
                    key={epithet}
                    className="rounded border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] md:text-xs"
                    style={{
                      borderColor: `${character.colors.primary}55`,
                      color: character.colors.primary,
                      backgroundColor: `${character.colors.accent}22`,
                    }}
                  >
                    {epithet}
                  </span>
                ))}
              </div>
            )}

            <h1
              className={cn(
                "mb-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl",
                character.id === "imperius" &&
                  "theme-imperius-name theme-imperius-name--hero font-normal tracking-normal",
                character.id === "candyandblood" &&
                  "theme-candyandblood-name theme-candyandblood-name--hero font-normal tracking-normal"
              )}
              style={{
                color: character.colors.primary,
                textShadow: THEME_DEBUG_NO_EFFECTS
                  ? "none"
                  : `0 0 100px ${character.colors.glow ?? character.colors.primary}55, 0 2px 20px rgba(0,0,0,0.8)`,
              }}
            >
              {getCharacterDisplayName(character)}
            </h1>

            <p className="mb-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              {character.description}
            </p>

            {featuredLines.length > 0 && (
              <blockquote
                className={cn(
                  "max-w-xl border-l-2 pl-4 text-sm italic leading-relaxed text-white/75 md:text-base",
                  !THEME_DEBUG_NO_EFFECTS && "transition-opacity duration-700"
                )}
                style={{ borderColor: `${character.colors.primary}66` }}
              >
                &ldquo;{featuredLines[lineIndex]}&rdquo;
              </blockquote>
            )}
          </div>

          {!THEME_DEBUG_NO_EFFECTS && galleryImages.length > 0 && (
            <div className="theme-gallery-thumbs mt-6 flex flex-wrap">
              {galleryImages.map((src, imageIndex) => (
                <button
                  key={src}
                  type="button"
                  className="theme-gallery-thumb"
                  onClick={() => setGalleryIndex(imageIndex)}
                  aria-label="Görseli büyüt"
                >
                  <ThemeImageFrame
                    src={src}
                    alt=""
                    character={character}
                    variant="gallery"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {!THEME_DEBUG_NO_EFFECTS && galleryIndex !== null && galleryImages.length > 0 && (
          <ThemeGalleryModal
            images={galleryImages}
            index={galleryIndex}
            onIndexChange={setGalleryIndex}
            character={character}
            onClose={() => setGalleryIndex(null)}
          />
        )}

        {!THEME_DEBUG_NO_EFFECTS && character.media.music && (
          <ThemeElectricIconButton
            onClick={() => onMutedChange(!muted)}
            ariaLabel={muted ? "Sesi aç" : "Sesi kapat"}
            character={character}
            shellClassName={cn(
              "theme-mute-shell",
              isWideHero ? "theme-mute-shell--wide" : "theme-mute-shell--compact"
            )}
          >
            {muted ? (
              <VolumeX size={32} strokeWidth={2.5} aria-hidden />
            ) : (
              <Volume2 size={32} strokeWidth={2.5} aria-hidden />
            )}
          </ThemeElectricIconButton>
        )}
      </div>
    </div>
  );
}
