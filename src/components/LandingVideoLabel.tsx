import { useEffect, useRef, type RefObject } from "react";
import type { CharacterTheme } from "../data/characters";
import { ElectricBorder } from "./ElectricBorder";

type LandingVideoLabelProps = {
  character: CharacterTheme;
  label: string;
  labelVideoRef: RefObject<HTMLVideoElement | null>;
};

export function LandingVideoLabel({ character, label, labelVideoRef }: LandingVideoLabelProps) {
  useEffect(() => {
    void labelVideoRef.current?.play().catch(() => {});
  }, [character.media.video, labelVideoRef]);

  if (!character.media.video) return null;

  return (
    <>
      <div className="theme-landing__label-layer theme-landing__label-layer--back">
        <span className="theme-landing__label theme-imperius-name theme-landing__label--electric">
          <span className="theme-landing__label__frame theme-landing__label__frame--back">
            <span className="theme-landing__label__frame-veil" aria-hidden="true" />
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
            <span className="theme-landing__label__frame-tint" aria-hidden="true" />
            <span className="theme-landing__label__text theme-landing__label__text--sizer" aria-hidden="true">
              {label}
            </span>
          </span>
        </span>
      </div>
      <div className="theme-landing__label-layer theme-landing__label-layer--text">
        <span className="theme-landing__label theme-imperius-name theme-landing__label--electric">
          <span className="theme-landing__label__frame theme-landing__label__frame--text-only">
            <span className="theme-landing__label__text theme-landing__label__text--sizer" aria-hidden="true">
              {label}
            </span>
            <ElectricBorder variant="text" className="theme-landing__label__corner-electric">
              <span className="theme-landing__label__electric-stack">
                <span className="theme-landing__label__text">{label}</span>
                <span className="theme-landing__label__text theme-landing__label__text--electric-fx" aria-hidden="true">
                  {label}
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
  );
}
