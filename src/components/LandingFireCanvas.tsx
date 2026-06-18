import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

type Rgb = { r: number; g: number; b: number };

type FireParticle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  colorIndex: number;
  rotation: number;
  rotationSpeed: number;
  sway: number;
  swaySpeed: number;
  swayOffset: number;
  lifespan: number;
};

const PALETTE_BASE: Rgb[] = [
  { r: 232, g: 93, b: 117 },
  { r: 196, g: 30, b: 58 },
  { r: 255, g: 80, b: 40 },
  { r: 139, g: 14, b: 26 },
  { r: 72, g: 16, b: 48 },
];

function clonePalette(base: Rgb[]): Rgb[] {
  return base.map((color) => ({ ...color }));
}

type FireDensity = "default" | "compact" | "subtle";

function createParticle(
  width: number,
  height: number,
  paletteLength: number,
  density: FireDensity = "default",
  fullSpread = false
): FireParticle {
  const presets: Record<
    FireDensity,
    Pick<FireParticle, "size" | "opacity" | "speedX" | "speedY" | "rotationSpeed" | "sway" | "swaySpeed" | "lifespan">
  > = {
    default: {
      size: 5 + Math.random() * 14,
      opacity: 0.2 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 1.4,
      speedY: -1.4 - Math.random() * 2.8,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      sway: 0.35 + Math.random() * 0.55,
      swaySpeed: 0.005 + Math.random() * 0.012,
      lifespan: 110 + Math.random() * 180,
    },
    compact: {
      size: 3 + Math.random() * 7,
      opacity: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.9,
      speedY: -0.9 - Math.random() * 1.6,
      rotationSpeed: (Math.random() - 0.5) * 0.018,
      sway: 0.28 + Math.random() * 0.42,
      swaySpeed: 0.004 + Math.random() * 0.009,
      lifespan: 70 + Math.random() * 90,
    },
    subtle: {
      size: 1.5 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.18,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -0.28 - Math.random() * 0.55,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      sway: 0.12 + Math.random() * 0.22,
      swaySpeed: 0.002 + Math.random() * 0.004,
      lifespan: 120 + Math.random() * 140,
    },
  };

  const preset = presets[density];
  const spawnY = fullSpread
    ? Math.random() * height * 0.92 + height * 0.04
    : height * 0.45 + Math.random() * height * 0.65;

  return {
    x: Math.random() * width,
    y: spawnY,
    colorIndex: Math.floor(Math.random() * paletteLength),
    rotation: Math.random() * Math.PI * 2,
    swayOffset: Math.random() * Math.PI * 2,
    ...preset,
  };
}

function drawBrushstroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: Rgb,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const gradient = ctx.createLinearGradient(0, -size, 0, size);
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
  gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-size / 3, -size);
  ctx.quadraticCurveTo(size / 2, 0, -size / 3, size);
  ctx.quadraticCurveTo(size / 2, 0, size / 3, -size / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(size / 6, 0, size / 4, size / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

type LandingFireCanvasProps = {
  className?: string;
  density?: FireDensity;
  speedMultiplier?: number;
  countMultiplier?: number;
  fullSpread?: boolean;
};

export function LandingFireCanvas({
  className,
  density = "default",
  speedMultiplier = 1,
  countMultiplier = 1,
  fullSpread = false,
}: LandingFireCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let time = 0;
    let palette = clonePalette(PALETTE_BASE);
    let particles: FireParticle[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const baseCount =
        density === "subtle"
          ? Math.min(12, Math.max(4, Math.floor((width * height) / 10000)))
          : density === "compact"
            ? Math.min(28, Math.max(10, Math.floor((width * height) / 4200)))
            : Math.min(140, Math.max(38, Math.floor((width * height) / 1800)));
      const targetCount = Math.min(
        density === "subtle" ? 60 : density === "compact" ? 140 : 700,
        Math.max(1, Math.floor(baseCount * countMultiplier))
      );
      particles = Array.from({ length: targetCount }, () =>
        createParticle(width, height, PALETTE_BASE.length, density, fullSpread)
      );
    };

    const updatePalette = () => {
      palette = PALETTE_BASE.map((color, index) => {
        const t = time + index * 0.5;
        const variation = 16;
        return {
          r: Math.min(255, Math.max(0, color.r + Math.sin(t) * variation)),
          g: Math.min(255, Math.max(0, color.g + Math.sin(t + 1) * variation)),
          b: Math.min(255, Math.max(0, color.b + Math.sin(t + 2) * variation)),
        };
      });
    };

    const updateParticles = (speedBoost: number) => {
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        particle.x +=
          (particle.speedX + Math.sin(time * particle.swaySpeed + particle.swayOffset) * particle.sway) *
          speedBoost;
        particle.y += particle.speedY * speedBoost;
        particle.rotation += particle.rotationSpeed * speedBoost;
        particle.lifespan -= speedBoost;

        const lifeFactor = particle.lifespan / 300;
        const currentSize = particle.size * lifeFactor;
        const currentOpacity = particle.opacity * lifeFactor;

        if (particle.lifespan > 0 && particle.y > -40) {
          drawBrushstroke(
            ctx,
            particle.x,
            particle.y,
            currentSize,
            particle.rotation,
            palette[particle.colorIndex],
            currentOpacity
          );
        }

        if (particle.lifespan <= 0 || particle.y < -40) {
          particles[i] = createParticle(width, height, PALETTE_BASE.length, density, fullSpread);
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      time += (density === "subtle" ? 0.007 : 0.012) * speedMultiplier;
      updatePalette();
      updateParticles(speedMultiplier);
      ctx.globalCompositeOperation = "source-over";
      rafId = window.requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    rafId = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [countMultiplier, density, fullSpread, speedMultiplier]);

  return (
    <div ref={containerRef} className={cn("theme-landing-fire-canvas", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="theme-landing-fire-canvas__canvas" />
    </div>
  );
}

