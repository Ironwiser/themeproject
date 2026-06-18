import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

type LandingImperiusTabEffectProps = {
  videoSrc: string;
  className?: string;
};

export function LandingImperiusTabEffect({ videoSrc, className }: LandingImperiusTabEffectProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void videoRef.current?.play().catch(() => {});
  }, [videoSrc]);

  return (
    <div className={cn("theme-landing-imperius-tab", className)} aria-hidden="true">
      <span className="theme-landing-imperius-tab__veil" />
      <video
        ref={videoRef}
        className="theme-landing-imperius-tab__lightning"
        src={videoSrc}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      />
      <span className="theme-landing-imperius-tab__tint" />
    </div>
  );
}
