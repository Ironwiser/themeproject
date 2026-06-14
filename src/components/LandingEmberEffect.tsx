import { useMemo, type CSSProperties } from "react";
import { LandingFireCanvas } from "./LandingFireCanvas";
import { cn } from "../lib/utils";
const EMBER_COUNT = 12;

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
};

function createEmber(id: number): EmberParticle {
  return {
    id,
    left: 35 + Math.random() * 30,
    size: 1.5 + Math.random() * 1.5,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 3,
    drift: Math.random() * 2 - 1,
  };
}

export function LandingEmberEffect({ className }: LandingEmberEffectProps) {
  const embers = useMemo(
    () => Array.from({ length: EMBER_COUNT }, (_, index) => createEmber(index)),
    []
  );

  return (
    <div className={cn("theme-landing-ember", className)} aria-hidden="true">
      <LandingFireCanvas />
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
                animationDuration: `${ember.duration}s`,
                animationDelay: `${ember.delay}s`,
                "--ember-drift": String(ember.drift),
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
