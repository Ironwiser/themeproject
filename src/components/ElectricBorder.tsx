import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type ElectricBorderVariant =
  | "default"
  | "wide"
  | "landing"
  | "gallery"
  | "showcase"
  | "circle"
  | "text";

/** Orijinal demo: 350×500 dikey kart */
const REF_WIDTH = 350;
const REF_HEIGHT = 500;
const REF_DX = 490;
const REF_DY = 700;
const REF_DISPLACE = 30;
const REF_FREQ = 0.02;

type FilterMetrics = {
  dx: number;
  dy: number;
  displace: number;
  freq: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function metricsFromSize(width: number, height: number, variant: ElectricBorderVariant): FilterMetrics {
  if (width < 4 || height < 4) {
    return { dx: REF_DX, dy: REF_DY, displace: REF_DISPLACE, freq: REF_FREQ };
  }

  const minDim = Math.min(width, height);
  const scaleByMin = minDim / REF_WIDTH;
  const isWide = variant === "wide";
  const isCircle = variant === "circle";
  const isText = variant === "text";

  if (isText) {
    const travelX = Math.max(28, Math.round(width * 0.12));
    const travelY = Math.max(12, Math.round(height * 0.18));
    return {
      dx: travelX,
      dy: travelY,
      displace: Math.round(clamp(REF_DISPLACE * scaleByMin * 0.42, 5, 12)),
      freq: Number(clamp(REF_FREQ * (REF_WIDTH / minDim) * 1.25, 0.014, 0.048).toFixed(4)),
    };
  }

  if (isCircle) {
    const travel = Math.max(24, Math.round(minDim * 0.85));
    return {
      dx: travel,
      dy: travel,
      displace: Math.round(clamp(REF_DISPLACE * scaleByMin * 0.35, 4, 10)),
      freq: Number(clamp(REF_FREQ * (REF_WIDTH / minDim) * 1.35, 0.012, 0.055).toFixed(4)),
    };
  }

  let dx = Math.max(40, Math.round((width / REF_WIDTH) * REF_DX));
  let dy = Math.max(40, Math.round((height / REF_HEIGHT) * REF_DY));

  if (isWide) {
    const travel = Math.round((height / REF_HEIGHT) * REF_DY);
    dx = Math.min(dx, Math.round(travel * 1.1));
    dy = Math.min(dy, travel);
  }

  const displaceCap = isWide ? 24 : variant === "gallery" ? 18 : 44;

  return {
    dx,
    dy,
    displace: Math.round(clamp(REF_DISPLACE * scaleByMin, 8, displaceCap)),
    freq: Number(
      clamp(REF_FREQ * (REF_WIDTH / minDim) * (isWide ? 1.15 : 1), 0.006, 0.04).toFixed(4)
    ),
  };
}

function metricsChanged(a: FilterMetrics, b: FilterMetrics) {
  const threshold = 0.1;
  return (
    Math.abs(a.dx - b.dx) / a.dx > threshold ||
    Math.abs(a.dy - b.dy) / a.dy > threshold ||
    Math.abs(a.displace - b.displace) / a.displace > threshold
  );
}

export type ElectricBorderMotion = "default" | "vertical";

type ElectricBorderProps = {
  children: ReactNode;
  className?: string;
  variant?: ElectricBorderVariant;
  /** SVG animasyon başlangıç gecikmesi (saniye) */
  animationDelay?: number;
  /** Gürültü seed kaydırması — üst üste katmanlarda desen çakışmasın */
  seedOffset?: number;
  /** vertical: gürültü daha çok yukarı-aşağı akar */
  motion?: ElectricBorderMotion;
};

export function ElectricBorder({
  children,
  className,
  variant = "default",
  animationDelay = 0,
  seedOffset = 0,
  motion = "default",
}: ElectricBorderProps) {
  const filterId = `electric-displace-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<FilterMetrics>(() =>
    metricsFromSize(REF_WIDTH, REF_HEIGHT, variant)
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let timeoutId = 0;

    const apply = () => {
      const next = metricsFromSize(node.clientWidth, node.clientHeight, variant);
      setMetrics((prev) => (metricsChanged(prev, next) ? next : prev));
    };

    const observer = new ResizeObserver(() => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(apply, 150);
    });

    observer.observe(node);
    apply();

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [variant]);

  const { dx, dy, displace, freq } = metrics;
  const filterPad =
    variant === "wide"
      ? 0.75
      : variant === "landing"
        ? 0.5
        : variant === "circle"
          ? 1.35
          : variant === "text"
            ? 1.2
            : 0.2;
  const animateBegin = animationDelay > 0 ? `${animationDelay}s` : undefined;
  const seedA = 1 + seedOffset;
  const seedB = 2 + seedOffset;
  const isVerticalMotion = motion === "vertical";
  const travelY = isVerticalMotion ? Math.round(dy * 2.4) : dy;
  const travelX = isVerticalMotion ? Math.round(dx * 0.2) : dx;
  const travelYAlt = Math.round(travelY * 0.75);

  const turbulenceAnimate = (axis: "dx" | "dy", values: string, key: string) => (
    <animate
      key={key}
      attributeName={axis}
      values={values}
      dur="6s"
      repeatCount="indefinite"
      calcMode="linear"
      begin={animateBegin}
    />
  );

  const style = {
    "--electric-filter": `url(#${filterId})`,
  } as CSSProperties;

  return (
    <div
      className={cn("electric-border", `electric-border--${variant}`, className)}
      style={style}
    >
      <svg className="electric-border__svg" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x={`${-filterPad * 100}%`}
            y={`${-filterPad * 100}%`}
            width={`${100 + filterPad * 200}%`}
            height={`${100 + filterPad * 200}%`}
          >
            <feTurbulence
              type="turbulence"
              baseFrequency={freq}
              numOctaves="10"
              result="noise1"
              seed={seedA}
              stitchTiles="stitch"
            />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              {turbulenceAnimate("dy", `${travelY}; 0`, `dy1-${travelY}-${animationDelay}`)}
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency={freq}
              numOctaves="10"
              result="noise2"
              seed={seedA}
              stitchTiles="stitch"
            />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              {turbulenceAnimate("dy", `0; ${-travelY}`, `dy2-${travelY}-${animationDelay}`)}
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency={freq}
              numOctaves="10"
              result="noise3"
              seed={seedB}
              stitchTiles="stitch"
            />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              {isVerticalMotion ? (
                turbulenceAnimate(
                  "dy",
                  `${travelYAlt}; ${-Math.round(travelYAlt * 0.45)}`,
                  `dy3-${travelYAlt}-${animationDelay}`
                )
              ) : (
                turbulenceAnimate("dx", `${travelX}; 0`, `dx1-${travelX}-${animationDelay}`)
              )}
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency={freq}
              numOctaves="10"
              result="noise4"
              seed={seedB}
              stitchTiles="stitch"
            />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              {isVerticalMotion ? (
                turbulenceAnimate(
                  "dy",
                  `${Math.round(-travelYAlt * 0.55)}; ${travelYAlt}`,
                  `dy4-${travelYAlt}-${animationDelay}`
                )
              ) : (
                turbulenceAnimate("dx", `0; ${-travelX}`, `dx2-${travelX}-${animationDelay}`)
              )}
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale={displace}
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div ref={containerRef} className="electric-border__container">
        <div className="electric-border__bg-glow" aria-hidden />
        <div className="electric-border__content">{children}</div>
        <div className="electric-border__overlay-1" aria-hidden />
        <div className="electric-border__overlay-2" aria-hidden />
        <div className="electric-border__inner">
          <div className="electric-border__outer">
            <div className="electric-border__edge" aria-hidden />
          </div>
          <div className="electric-border__glow-1" aria-hidden />
          <div className="electric-border__glow-2" aria-hidden />
        </div>
      </div>
    </div>
  );
}
