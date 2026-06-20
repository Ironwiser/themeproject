import { useMemo, type CSSProperties } from "react";
import { LandingFireCanvas } from "./LandingFireCanvas";
import { cn } from "../lib/utils";

const EMBER_COUNT = 12;
const TAB_EMBER_COUNT = 6;
const TAB_BOOST_MULTIPLIER = 5;

type EmberParticle = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
};

type LandingEmberEffectProps = {
  className?: string;
  density?: "default" | "compact" | "tab" | "tab-boost" | "preview-boost";
};

function createEmber(id: number, speedMultiplier = 1, spreadWide = false): EmberParticle {
  const baseDuration = 2 + Math.random() * 3;
  return {
    id,
    left: spreadWide ? 6 + Math.random() * 88 : 35 + Math.random() * 30,
    size: 1.5 + Math.random() * 1.5,
    duration: baseDuration / speedMultiplier,
    delay: Math.random() * 3 / speedMultiplier,
    drift: Math.random() * 2 - 1,
  };
}

export function LandingEmberEffect({ className, density = "default" }: LandingEmberEffectProps) {
  const isPreviewBoost = density === "preview-boost";
  const isTabBoost = density === "tab-boost";
  const isBoost = isTabBoost || isPreviewBoost;
  const emberCount =
    density === "default"
      ? EMBER_COUNT
      : isBoost
        ? TAB_EMBER_COUNT * TAB_BOOST_MULTIPLIER
        : TAB_EMBER_COUNT;
  const fireDensity =
    isPreviewBoost ? "default" : density === "tab" || isTabBoost ? "subtle" : density === "compact" ? "compact" : "default";
  const speedMultiplier = isBoost ? TAB_BOOST_MULTIPLIER : 1;
  const countMultiplier = isBoost ? TAB_BOOST_MULTIPLIER : 1;
  const embers = useMemo(
    () => Array.from({ length: emberCount }, (_, index) => createEmber(index, speedMultiplier, isBoost)),
    [emberCount, isBoost, speedMultiplier]
  );

  return (
    <div
      className={cn("theme-landing-ember", density !== "default" && "theme-landing-ember--compact", className)}
      aria-hidden="true"
    >
      <LandingFireCanvas
        density={fireDensity}
        speedMultiplier={speedMultiplier}
        countMultiplier={countMultiplier}
        fullSpread={isBoost}
      />
      <div className="theme-landing-ember__glow" />
      <div className="theme-landing-ember__embers">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="theme-landing-ember__ember"
            style={
              {
                left: `${ember.left}%`,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                animationDelay: `${ember.delay}s`,
                animationDuration: `${ember.duration}s`,
                "--ember-drift": String(ember.drift),
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
