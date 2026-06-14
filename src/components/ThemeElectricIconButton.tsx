import { type AnimationEventHandler, type CSSProperties, type ReactNode } from "react";
import type { CharacterTheme } from "../data/characters";
import { ElectricBorder } from "./ElectricBorder";
import { cn } from "../lib/utils";

/** Imperius electric border edge rengi — index.css ile aynı */
export const IMPERIUS_ELECTRIC_BORDER = "#5ec8ff";

export function getThemeElectricIconColor(character: CharacterTheme) {
  const { primary, glow } = character.colors;
  const glowColor = glow ?? primary;
  return character.id === "imperius" ? IMPERIUS_ELECTRIC_BORDER : glowColor;
}

type ThemeElectricIconButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  character: CharacterTheme;
  className?: string;
  shellClassName?: string;
  onShellAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
  children: ReactNode;
};

export function ThemeElectricIconButton({
  onClick,
  ariaLabel,
  character,
  className,
  shellClassName,
  onShellAnimationEnd,
  children,
}: ThemeElectricIconButtonProps) {
  const useElectric = character.id === "imperius";
  const iconColor = getThemeElectricIconColor(character);

  const style = {
    "--modal-icon-fg": iconColor,
    backgroundColor: "transparent",
    color: iconColor,
  } as CSSProperties;

  const button = (
    <button
      type="button"
      className={cn(
        "theme-modal-icon-btn",
        useElectric && "theme-modal-icon-btn--electric",
        className
      )}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );

  const content = useElectric ? (
    <ElectricBorder variant="circle" className="theme-modal-icon-btn__electric">
      {button}
    </ElectricBorder>
  ) : (
    button
  );

  return (
    <div
      className={cn("theme-modal-icon-shell", shellClassName)}
      onAnimationEnd={onShellAnimationEnd}
    >
      {content}
    </div>
  );
}
