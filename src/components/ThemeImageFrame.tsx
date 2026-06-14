import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { CharacterTheme } from "../data/characters";
import { ElectricBorder, type ElectricBorderVariant } from "./ElectricBorder";
import { cn } from "../lib/utils";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function setFrameMetrics(frame: HTMLDivElement, w: number, h: number) {
  const minDim = Math.min(w, h);
  const stroke = clamp(Math.round(minDim * 0.0035), 1, 2);

  frame.style.setProperty("--frame-corner", `${Math.round(clamp(minDim * 0.045, 8, 30))}px`);
  frame.style.setProperty("--frame-gem", `${Math.round(clamp(minDim * 0.014, 3, 7))}px`);
  frame.style.setProperty("--frame-padding", `${Math.round(clamp(minDim * 0.005, 1, 4))}px`);
  frame.style.setProperty("--frame-border", `${stroke}px`);
  frame.style.setProperty("--frame-corner-stroke", `${stroke}px`);
}

function applyDualBorderFrameMetrics(frame: HTMLDivElement, w: number, h: number) {
  setFrameMetrics(frame, w, h);
}

function fitImageToBounds(img: HTMLImageElement, allowUpscale = false) {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;

  img.style.width = "";
  img.style.height = "";

  const styles = getComputedStyle(img);
  const maxW = Number.parseFloat(styles.maxWidth);
  const maxH = Number.parseFloat(styles.maxHeight);
  const boundsW = Number.isFinite(maxW) && maxW > 0 ? maxW : nw;
  const boundsH = Number.isFinite(maxH) && maxH > 0 ? maxH : nh;
  const scaleCap = allowUpscale ? Number.POSITIVE_INFINITY : 1;
  const scale = Math.min(boundsW / nw, boundsH / nh, scaleCap);
  const w = Math.max(1, Math.round(nw * scale));
  const h = Math.max(1, Math.round(nh * scale));

  img.style.width = `${w}px`;
  img.style.height = `${h}px`;

  return { w, h };
}

type ThemeImageFrameProps = {
  src: string;
  alt: string;
  character: CharacterTheme;
  variant?: "hero" | "showcase" | "showcase-wide" | "gallery" | "landing";
  className?: string;
  /** Landing vb.: görsel çerçevesinin altına bindirilen içerik */
  bottomOverlay?: ReactNode;
  /** Imperius hero/modal: klasik çerçeve + 3 katman electric overlay */
  dualElectricBorder?: boolean;
  /** showcase/hero: görseli sınırlara kadar büyüt (native boyutu aşabilir) */
  showcaseFill?: boolean;
};

function electricVariantForFrame(
  variant: ThemeImageFrameProps["variant"]
): ElectricBorderVariant {
  if (variant === "showcase-wide") return "wide";
  if (variant === "landing") return "landing";
  if (variant === "gallery") return "gallery";
  if (variant === "showcase" || variant === "hero") return "showcase";
  return "default";
}

export function ThemeImageFrame({
  src,
  alt,
  character,
  variant = "hero",
  className,
  bottomOverlay,
  dualElectricBorder = false,
  showcaseFill = false,
}: ThemeImageFrameProps) {
  const { primary, accent, glow } = character.colors;
  const frameClass =
    variant === "showcase-wide"
      ? "theme-image-frame--showcase-wide"
      : variant === "showcase"
        ? "theme-image-frame--showcase"
        : variant === "hero"
          ? "theme-image-frame--hero"
          : variant === "landing"
            ? "theme-image-frame--landing"
            : "theme-image-frame--gallery";

  const frameStyle = {
    "--frame-primary": primary,
    "--frame-accent": accent,
    "--frame-glow": glow ?? primary,
  } as CSSProperties;

  const useElectricBorder = character.id === "imperius";
  const useClassicUnderElectric =
    useElectricBorder &&
    (variant === "showcase-wide" ||
      variant === "landing" ||
      variant === "gallery" ||
      dualElectricBorder);
  const electricOnlyBorder = useClassicUnderElectric && variant === "gallery";
  const dualElectricVariant: ElectricBorderVariant = "wide";
  const showFrameOrnaments =
    !electricOnlyBorder &&
    (useClassicUnderElectric || (variant !== "landing" && !useElectricBorder));
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const syncBorderToImage =
    variant !== "landing" || (useElectricBorder && variant === "landing");

  useEffect(() => {
    if (!syncBorderToImage) return;

    const img = imgRef.current;
    const frame = frameRef.current;
    if (!img || !frame) return;

    const apply = () => {
      if (variant === "landing" && useElectricBorder) {
        const w = frame.clientWidth;
        const h = frame.clientHeight;
        if (w < 2 || h < 2) return;
        applyDualBorderFrameMetrics(frame, w, h);
        return;
      }

      if (variant === "gallery" && useElectricBorder) {
        const w = img.clientWidth;
        const h = img.clientHeight;
        if (w < 2 || h < 2) return;
        applyDualBorderFrameMetrics(frame, w, h);
        return;
      }

      if (variant === "showcase-wide") {
        img.style.width = "";
        img.style.height = "";
        const w = frame.clientWidth;
        const h = frame.clientHeight;
        if (w < 2 || h < 2) return;
        applyDualBorderFrameMetrics(frame, w, h);
        return;
      }

      const fitted =
        variant === "showcase" || variant === "hero"
          ? fitImageToBounds(img, showcaseFill)
          : null;

      const w = fitted?.w ?? img.clientWidth;
      const h = fitted?.h ?? img.clientHeight;
      if (w < 2 || h < 2) return;

      if (dualElectricBorder && variant === "showcase") {
        applyDualBorderFrameMetrics(frame, w, h);
        return;
      }

      setFrameMetrics(frame, w, h);
    };

    const observer = new ResizeObserver(apply);
    observer.observe(frame);
    observer.observe(img);
    img.addEventListener("load", apply);
    window.addEventListener("resize", apply);
    if (img.complete) apply();

    return () => {
      observer.disconnect();
      img.removeEventListener("load", apply);
      window.removeEventListener("resize", apply);
    };
  }, [src, syncBorderToImage, variant, dualElectricBorder, showcaseFill]);

  const frameInner = (
    <div className="theme-image-frame__inner">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="theme-image-frame__img"
        decoding="sync"
        draggable={false}
      />
      {variant === "showcase-wide" && (
        <span className="theme-image-frame__media-filter" aria-hidden />
      )}
      {variant === "landing" && !useElectricBorder && (
        <span className="theme-landing__bevel-glass" aria-hidden />
      )}
      {variant !== "showcase-wide" &&
        variant !== "landing" &&
        variant !== "gallery" &&
        !useClassicUnderElectric && (
        <div className="theme-image-frame__vignette" aria-hidden />
      )}
      {bottomOverlay && (
        <div className="theme-image-frame__bottom-overlay">{bottomOverlay}</div>
      )}
    </div>
  );

  const frameOrnaments = showFrameOrnaments && (
    <>
      <span className="theme-image-frame__corner theme-image-frame__corner--tl" aria-hidden />
      <span className="theme-image-frame__corner theme-image-frame__corner--tr" aria-hidden />
      <span className="theme-image-frame__corner theme-image-frame__corner--bl" aria-hidden />
      <span className="theme-image-frame__corner theme-image-frame__corner--br" aria-hidden />
      <span className="theme-image-frame__gem theme-image-frame__gem--tl" aria-hidden />
      <span className="theme-image-frame__gem theme-image-frame__gem--tr" aria-hidden />
      <span className="theme-image-frame__gem theme-image-frame__gem--bl" aria-hidden />
      <span className="theme-image-frame__gem theme-image-frame__gem--br" aria-hidden />
    </>
  );

  const classicRing = (
    <div className="theme-image-frame__ring">
      {!useClassicUnderElectric && frameOrnaments}
      {frameInner}
    </div>
  );

  const frontOrnaments = useClassicUnderElectric && frameOrnaments && (
    <div className="theme-image-frame__ornaments theme-image-frame__ornaments--front" aria-hidden>
      {frameOrnaments}
    </div>
  );

  return (
    <div
      ref={frameRef}
      className={cn(
        "theme-image-frame",
        frameClass,
        useElectricBorder && "theme-image-frame--electric",
        useClassicUnderElectric && "theme-image-frame--dual-border",
        electricOnlyBorder && "theme-image-frame--electric-only",
        className
      )}
      style={frameStyle}
    >
      {useClassicUnderElectric ? (
        <>
          {classicRing}
          <ElectricBorder
            variant={dualElectricVariant}
            className="theme-image-frame__electric theme-image-frame__electric--overlay"
          >
            <span className="theme-image-frame__electric-anchor" aria-hidden />
          </ElectricBorder>
          <ElectricBorder
            variant={dualElectricVariant}
            animationDelay={1}
            seedOffset={2}
            className="theme-image-frame__electric theme-image-frame__electric--overlay theme-image-frame__electric--overlay-delayed"
          >
            <span className="theme-image-frame__electric-anchor" aria-hidden />
          </ElectricBorder>
          <ElectricBorder
            variant={dualElectricVariant}
            animationDelay={2}
            seedOffset={4}
            motion="vertical"
            className="theme-image-frame__electric theme-image-frame__electric--overlay theme-image-frame__electric--overlay-delayed theme-image-frame__electric--overlay-delayed-2"
          >
            <span className="theme-image-frame__electric-anchor" aria-hidden />
          </ElectricBorder>
          {frontOrnaments}
        </>
      ) : useElectricBorder ? (
        <ElectricBorder
          variant={electricVariantForFrame(variant)}
          className="theme-image-frame__electric"
        >
          {frameInner}
        </ElectricBorder>
      ) : (
        classicRing
      )}
    </div>
  );
}
