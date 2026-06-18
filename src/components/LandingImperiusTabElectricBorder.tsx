import { ElectricBorder } from "./ElectricBorder";
import { cn } from "../lib/utils";

type LandingImperiusTabElectricBorderProps = {
  triple?: boolean;
};

export function LandingImperiusTabElectricBorder({ triple = false }: LandingImperiusTabElectricBorderProps) {
  return (
    <div
      className={cn("theme-landing-imperius-tab__electric", triple && "theme-landing-imperius-tab__electric--triple")}
      aria-hidden="true"
    >
      <div className="theme-landing-imperius-tab__electric-layer">
        <ElectricBorder variant="wide" className="theme-landing-imperius-tab__electric-border">
          <span className="theme-landing-imperius-tab__electric-anchor" aria-hidden />
        </ElectricBorder>
      </div>
      <div className="theme-landing-imperius-tab__electric-layer theme-landing-imperius-tab__electric-layer--extra">
        <ElectricBorder
          variant="wide"
          animationDelay={1}
          seedOffset={2}
          className="theme-landing-imperius-tab__electric-border"
        >
          <span className="theme-landing-imperius-tab__electric-anchor" aria-hidden />
        </ElectricBorder>
      </div>
      <div className="theme-landing-imperius-tab__electric-layer theme-landing-imperius-tab__electric-layer--extra theme-landing-imperius-tab__electric-layer--extra-2">
        <ElectricBorder
          variant="wide"
          animationDelay={2}
          seedOffset={4}
          motion="vertical"
          className="theme-landing-imperius-tab__electric-border"
        >
          <span className="theme-landing-imperius-tab__electric-anchor" aria-hidden />
        </ElectricBorder>
      </div>
    </div>
  );
}
