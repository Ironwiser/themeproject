import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CharacterTheme } from "../data/characters";
import { ThemeElectricIconButton } from "./ThemeElectricIconButton";
import { ThemeImageFrame } from "./ThemeImageFrame";

type ThemeGalleryModalProps = {
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  character: CharacterTheme;
  onClose: () => void;
};

export function ThemeGalleryModal({
  images,
  index,
  onIndexChange,
  character,
  onClose,
}: ThemeGalleryModalProps) {
  const src = images[index] ?? images[0];
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
  }, [images.length, index, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % images.length);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultiple) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, hasMultiple, onClose]);

  return createPortal(
    <div
      className="theme-gallery-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Görsel önizleme"
      onClick={onClose}
    >
      <ThemeElectricIconButton
        onClick={onClose}
        ariaLabel="Kapat"
        character={character}
        shellClassName="theme-modal-dismiss-shell"
        className="theme-modal-dismiss-btn"
      >
        <X size={32} strokeWidth={2.5} aria-hidden />
      </ThemeElectricIconButton>

      <div className="theme-modal-carousel" onClick={(e) => e.stopPropagation()}>
        {hasMultiple && (
          <ThemeElectricIconButton
            onClick={goPrev}
            ariaLabel="Önceki görsel"
            character={character}
            className="theme-modal-step-btn--prev"
          >
            <ChevronLeft size={36} strokeWidth={2.5} aria-hidden />
          </ThemeElectricIconButton>
        )}

        <div className="theme-gallery-modal__content">
          <ThemeImageFrame
            key={src}
            src={src}
            alt=""
            character={character}
            variant="showcase"
            dualElectricBorder={character.id === "imperius"}
            className="theme-gallery-modal__frame"
          />
        </div>

        {hasMultiple && (
          <ThemeElectricIconButton
            onClick={goNext}
            ariaLabel="Sonraki görsel"
            character={character}
            className="theme-modal-step-btn--next"
          >
            <ChevronRight size={36} strokeWidth={2.5} aria-hidden />
          </ThemeElectricIconButton>
        )}
      </div>
    </div>,
    document.body
  );
}
