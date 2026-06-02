import { useEffect, useState } from 'react';

// Clé de stockage de la préférence de taille de police.
const FONT_SIZE_KEY = 'iakoa-font-size';
// Bornes (en pixels) de la taille de police de base.
const MIN_SIZE = 12;
const MAX_SIZE = 20;
// Pas entre deux crans (12, 14, 16, 18, 20).
const STEP = 2;
// Taille par défaut (équivalente au réglage navigateur usuel).
const DEFAULT_SIZE = 16;

// Lit la taille enregistrée, alignée sur un cran et bornée entre MIN et MAX.
function readStoredFontSize(): number {
  const raw = Number(localStorage.getItem(FONT_SIZE_KEY));
  if (!Number.isFinite(raw) || raw === 0) return DEFAULT_SIZE;
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, snapped));
}

// Curseur d'accessibilité (12→20px) fixé en bas à gauche, au-dessus de tout.
// Dimensions en px fixes : le sélecteur ne change pas de taille quand on règle
// la police globale.
export function FontSizeControl() {
  const [size, setSize] = useState<number>(readStoredFontSize);

  // Applique la taille au document <html> et la mémorise à chaque changement.
  useEffect(() => {
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem(FONT_SIZE_KEY, String(size));
  }, [size]);

  return (
    <div
      className="fixed bottom-[16px] left-[16px] z-[10000] flex items-center gap-[6px] rounded-full bg-white/80 px-[10px] py-[5px] shadow-sm ring-1 ring-gray-200/70 backdrop-blur"
      title={`Taille du texte : ${size}px`}
    >
      {/* Aperçu de la taille minimale (taille fixe). */}
      <span aria-hidden="true" className="text-[11px] leading-none text-gray-400">
        A
      </span>
      <input
        type="range"
        min={MIN_SIZE}
        max={MAX_SIZE}
        step={STEP}
        value={size}
        list="iakoa-font-steps"
        onChange={(event) => setSize(Number(event.target.value))}
        aria-label={`Taille du texte : ${size} pixels`}
        className="w-[80px] cursor-pointer accent-iakoa-blue"
      />
      {/* Crans à 12, 14, 16, 18, 20. */}
      <datalist id="iakoa-font-steps">
        {Array.from({ length: (MAX_SIZE - MIN_SIZE) / STEP + 1 }, (_, i) => (
          <option key={MIN_SIZE + i * STEP} value={MIN_SIZE + i * STEP} />
        ))}
      </datalist>
      {/* Aperçu de la taille maximale (taille fixe). */}
      <span aria-hidden="true" className="text-[17px] leading-none text-gray-500">
        A
      </span>
    </div>
  );
}
