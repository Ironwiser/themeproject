import { cn } from "../lib/utils";

type LandingEmberTabLabelGlowProps = {
  lit: boolean;
};

export function LandingEmberTabLabelGlow({ lit }: LandingEmberTabLabelGlowProps) {
  return (
    <span className={cn("theme-tab-ember-glow", lit && "theme-tab-ember-glow--lit")} aria-hidden>
      <span className="theme-tab-ember-glow__plate" />
    </span>
  );
}
