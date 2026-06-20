import { LandingEmberEffect } from "./LandingEmberEffect";
import { cn } from "../lib/utils";

export type TabEmberBoostPhase = "off" | "on" | "fading";

type LandingEmberStackProps = {
  boostPhase: TabEmberBoostPhase;
};

export function LandingTabEmberStack({ boostPhase }: LandingEmberStackProps) {
  return (
    <div className="theme-landing-tab-ember-stack" aria-hidden="true">
      <LandingEmberEffect density="tab" className="theme-landing-ember--tab" />
      {boostPhase !== "off" && (
        <LandingEmberEffect
          density="tab-boost"
          className={cn(
            "theme-landing-ember--tab-boost",
            boostPhase === "fading" && "theme-landing-ember--tab-boost--fade-out"
          )}
        />
      )}
    </div>
  );
}

export function LandingPreviewEmberStack({ boostPhase }: LandingEmberStackProps) {
  return (
    <div className="theme-landing-preview-ember-stack" aria-hidden="true">
      <LandingEmberEffect />
      {boostPhase !== "off" && (
        <LandingEmberEffect
          density="preview-boost"
          className={cn(
            "theme-landing-ember--preview-boost",
            boostPhase === "fading" && "theme-landing-ember--preview-boost--fade-out"
          )}
        />
      )}
    </div>
  );
}
