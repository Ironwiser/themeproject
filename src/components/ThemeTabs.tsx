import { useCallback, useEffect, useRef, useState, type AnimationEventHandler } from "react";
import { ArrowLeft } from "lucide-react";
import { characters } from "../data/characters";
import { THEME_DEBUG_NO_EFFECTS } from "../config/debug";
import { useThemeMusic } from "../hooks/useThemeMusic";
import { ImperiusIntro } from "./ImperiusIntro";
import { ThemeElectricIconButton } from "./ThemeElectricIconButton";
import { ThemeLanding } from "./ThemeLanding";
import { ThemeView } from "./ThemeView";
import { cn } from "../lib/utils";

export function ThemeTabs() {
  const [showLanding, setShowLanding] = useState(!THEME_DEBUG_NO_EFFECTS);
  const [activeId, setActiveId] = useState(characters[0].id);
  const [muted, setMuted] = useState(false);
  const [imperiusIntroDone, setImperiusIntroDone] = useState(THEME_DEBUG_NO_EFFECTS);
  const [imperiusBgVisible, setImperiusBgVisible] = useState(THEME_DEBUG_NO_EFFECTS);
  const [imperiusContentVisible, setImperiusContentVisible] = useState(THEME_DEBUG_NO_EFFECTS);
  const [imperiusContentFadingIn, setImperiusContentFadingIn] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const [skipFadingOut, setSkipFadingOut] = useState(false);
  const activeCharacter = characters.find((c) => c.id === activeId) ?? characters[0];
  const imperiusCharacter = characters.find((c) => c.id === "imperius") ?? characters[0];
  const showImperiusIntro = activeId === "imperius" && !imperiusIntroDone;
  const isImperius = activeId === "imperius";
  const contentFadeTimeoutRef = useRef<number | null>(null);
  const skipFadeTimeoutRef = useRef<number | null>(null);
  const backgroundActive = !isImperius || imperiusBgVisible;
  const contentVisible = !isImperius || imperiusContentVisible;
  const CONTENT_FADE_IN_MS = 3000;
  const SKIP_FADE_OUT_MS = 500;
  const inTab = !showLanding;
  const shouldPlayMusic = Boolean(activeCharacter.media.music) && !muted && inTab;

  const { audioRef, playFromGesture } = useThemeMusic({
    src: activeCharacter.media.music,
    shouldPlay: shouldPlayMusic,
    volume: 0.45,
  });

  const handleMutedChange = useCallback(
    (nextMuted: boolean) => {
      setMuted(nextMuted);
      if (!nextMuted) playFromGesture(true);
    },
    [playFromGesture]
  );

  const handleLandingSelect = useCallback(
    (characterId: string) => {
      const character = characters.find((c) => c.id === characterId);
      const willPlay = Boolean(character?.media.music) && !muted;

      setShowLanding(false);
      setActiveId(characterId);
      if (characterId === "imperius") {
        setImperiusIntroDone(false);
        setImperiusBgVisible(false);
        setImperiusContentVisible(false);
        setImperiusContentFadingIn(false);
      } else {
        setImperiusIntroDone(true);
        setImperiusBgVisible(true);
        setImperiusContentVisible(true);
        setImperiusContentFadingIn(false);
      }

      if (willPlay) playFromGesture(true);
    },
    [playFromGesture, muted]
  );

  const handleBackToLanding = useCallback(() => {
    setShowLanding(true);
  }, []);

  const handleSkipIntro = useCallback(() => {
    if (contentFadeTimeoutRef.current !== null) {
      window.clearTimeout(contentFadeTimeoutRef.current);
      contentFadeTimeoutRef.current = null;
    }
    setImperiusIntroDone(true);
    setImperiusBgVisible(true);
    setImperiusContentVisible(true);
    setImperiusContentFadingIn(false);
  }, []);

  useEffect(() => {
    if (showLanding || !isImperius) {
      setSkipVisible(false);
      setSkipFadingOut(false);
      return;
    }

    if (imperiusIntroDone || imperiusContentFadingIn) {
      return;
    }

    setSkipVisible(true);
    setSkipFadingOut(false);
  }, [showLanding, isImperius, imperiusIntroDone, imperiusContentFadingIn]);

  useEffect(() => {
    if (THEME_DEBUG_NO_EFFECTS) return;
    if (!skipVisible || skipFadingOut) return;
    if (!imperiusIntroDone && !imperiusContentFadingIn) return;

    const frameId = requestAnimationFrame(() => {
      setSkipFadingOut(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [skipVisible, skipFadingOut, imperiusIntroDone, imperiusContentFadingIn]);

  const finishSkipFade = useCallback(() => {
    if (skipFadeTimeoutRef.current !== null) {
      window.clearTimeout(skipFadeTimeoutRef.current);
      skipFadeTimeoutRef.current = null;
    }
    setSkipVisible(false);
    setSkipFadingOut(false);
  }, []);

  useEffect(() => {
    if (!skipFadingOut) return;

    skipFadeTimeoutRef.current = window.setTimeout(finishSkipFade, SKIP_FADE_OUT_MS + 50);

    return () => {
      if (skipFadeTimeoutRef.current !== null) {
        window.clearTimeout(skipFadeTimeoutRef.current);
        skipFadeTimeoutRef.current = null;
      }
    };
  }, [skipFadingOut, finishSkipFade]);

  const handleSkipFadeOutEnd = useCallback<AnimationEventHandler<HTMLDivElement>>(
    (event) => {
      if (!event.animationName.includes("theme-skip-fade-out") || !skipFadingOut) return;
      finishSkipFade();
    },
    [skipFadingOut, finishSkipFade]
  );

  return (
    <div
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        THEME_DEBUG_NO_EFFECTS && "theme-debug"
      )}
    >
      {!THEME_DEBUG_NO_EFFECTS && activeCharacter.media.music && (
        <audio ref={audioRef} src={activeCharacter.media.music} loop preload="auto" />
      )}

      {showLanding && (
        <ThemeLanding characters={characters} onSelect={handleLandingSelect} />
      )}

      {!showLanding && (
        <ThemeView
          key={activeId}
          character={activeCharacter}
          muted={muted}
          onMutedChange={handleMutedChange}
          backgroundActive={backgroundActive}
          contentVisible={contentVisible}
          contentFadeIn={imperiusContentFadingIn}
        />
      )}

      {skipVisible && (
        <ThemeElectricIconButton
          onClick={handleSkipIntro}
          ariaLabel="Intro ve animasyonları atla"
          character={activeCharacter}
          shellClassName={cn("theme-skip-shell", skipFadingOut && "theme-skip-shell--fade-out")}
          onShellAnimationEnd={handleSkipFadeOutEnd}
          className="theme-modal-icon-btn--text theme-modal-icon-btn--text-lg"
        >
          <span className="theme-modal-icon-btn__label">Atla</span>
        </ThemeElectricIconButton>
      )}

      {!THEME_DEBUG_NO_EFFECTS && showImperiusIntro && !showLanding && (
        <ImperiusIntro
          character={imperiusCharacter}
          onOutroStart={() => setImperiusBgVisible(true)}
          onOutroComplete={() => {
            setImperiusIntroDone(true);
            setImperiusContentVisible(true);
            setImperiusContentFadingIn(true);
            if (contentFadeTimeoutRef.current !== null) {
              window.clearTimeout(contentFadeTimeoutRef.current);
            }
            contentFadeTimeoutRef.current = window.setTimeout(() => {
              setImperiusContentFadingIn(false);
              contentFadeTimeoutRef.current = null;
            }, CONTENT_FADE_IN_MS);
          }}
        />
      )}

      {!showLanding && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-30 flex h-[var(--theme-nav-height)] items-center justify-center px-6",
            !THEME_DEBUG_NO_EFFECTS &&
              (isImperius && !imperiusContentVisible
                ? "opacity-0 pointer-events-none"
                : imperiusContentFadingIn
                  ? "theme-nav--fade-in"
                  : "opacity-100")
          )}
          style={
            imperiusContentFadingIn
              ? { animationDuration: `${CONTENT_FADE_IN_MS}ms` }
              : undefined
          }
        >
          <ThemeElectricIconButton
            onClick={handleBackToLanding}
            ariaLabel="Ana sayfaya dön"
            character={activeCharacter}
            shellClassName="theme-modal-icon-shell--lg"
          >
            <ArrowLeft size={40} strokeWidth={2.5} aria-hidden />
          </ThemeElectricIconButton>
        </div>
      )}
    </div>
  );
}
