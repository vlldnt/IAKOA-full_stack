import { useEffect, useState } from 'react';

// Clé de stockage de la préférence de taille de police.
const FONT_SIZE_KEY = 'iakoa-font-size';
// Bornes (en pixels) de la taille de police de base.
const MIN_SIZE = 12;
const MAX_SIZE = 20;
// Pas entre deux tailles (12, 14, 16, 18, 20).
const STEP = 2;
// Taille par défaut (équivalente au réglage navigateur usuel).
const DEFAULT_SIZE = 16;

// Lit la taille enregistrée, alignée sur un pas et bornée entre MIN et MAX.
function readStoredFontSize(): number {
  const raw = Number(localStorage.getItem(FONT_SIZE_KEY));
  if (!Number.isFinite(raw) || raw === 0) return DEFAULT_SIZE;
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, snapped));
}

// Sélecteur d'accessibilité [A−] Taille du texte [A+], fixé en bas à gauche.
// Dimensions en px fixes : le sélecteur ne change pas de taille quand on règle
// la police globale.
export function FontSizeControl() {
  const [size, setSize] = useState<number>(readStoredFontSize);

  // Applique la taille au document <html> et la mémorise à chaque changement.
  useEffect(() => {
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem(FONT_SIZE_KEY, String(size));
  }, [size]);

  // Diminue la taille d'un pas (sans descendre sous le minimum).
  const decrease = () => setSize((current) => Math.max(MIN_SIZE, current - STEP));
  // Augmente la taille d'un pas (sans dépasser le maximum).
  const increase = () => setSize((current) => Math.min(MAX_SIZE, current + STEP));

  const buttonClass =
    'flex h-[26px] w-[26px] items-center justify-center rounded-full text-gray-600 ' +
    'hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 transition-colors';

  return (
    <div
      id="font-size-control"
      className="fixed bottom-[16px] left-[16px] z-[10000] flex h-[36px] items-center gap-[8px] rounded-full bg-white/80 px-[10px] shadow-sm ring-1 ring-gray-200/70 backdrop-blur"
    >
      <button
        type="button"
        onClick={decrease}
        disabled={size <= MIN_SIZE}
        aria-label="Diminuer la taille du texte"
        className={buttonClass}
      >
        <span className="text-[12px] leading-none">A−</span>
      </button>

      <span className="w-[84px] text-center text-[11px] leading-none text-gray-500 whitespace-nowrap select-none">
        Taille du texte
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={size >= MAX_SIZE}
        aria-label="Augmenter la taille du texte"
        className={buttonClass}
      >
        <span className="text-[16px] leading-none">A+</span>
      </button>
    </div>
  );
}
