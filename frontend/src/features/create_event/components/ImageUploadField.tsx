import { useRef, useCallback } from 'react';
import { ImagePlus, X, FileImage } from 'lucide-react';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ImageUploadFieldProps {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File, previewUrl: string) => void;
  onClear: () => void;
  error?: string;
}

export function ImageUploadField({
  file,
  previewUrl,
  onChange,
  onClear,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (f: File) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        alert('Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.');
        return;
      }
      if (f.size > MAX_SIZE_BYTES) {
        alert(`L'image ne doit pas dépasser ${MAX_SIZE_MB} Mo.`);
        return;
      }
      const url = URL.createObjectURL(f);
      onChange(f, url);
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    // Reset pour permettre re-sélection du même fichier
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div id="image-upload-field" className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl && file ? (
        /* ── Aperçu image sélectionnée ── */
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={previewUrl}
            alt="Aperçu"
            className="w-full h-52 object-cover"
          />
          {/* Overlay bas : nom + taille */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileImage size={14} className="text-white shrink-0" />
              <span className="text-xs text-white truncate">{file.name}</span>
              <span className="text-xs text-white/70 shrink-0">{formatSize(file.size)}</span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
              title="Supprimer l'image"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
          {/* Bouton changer */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute top-2 right-2 text-xs px-2.5 py-1 rounded-lg bg-white/90 text-gray-700 font-medium hover:bg-white transition-colors shadow-sm"
          >
            Changer
          </button>
        </div>
      ) : (
        /* ── Zone drop / click ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`w-full flex flex-col items-center justify-center gap-3 py-8 px-4
            rounded-xl border-2 border-dashed transition-colors cursor-pointer
            hover:border-iakoa-blue hover:bg-blue-50
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
            ${error ? 'bg-red-100' : 'bg-white border border-gray-200'}`}>
            <ImagePlus size={22} className={error ? 'text-red-400' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Glissez une image ici ou{' '}
              <span className="text-iakoa-blue">parcourir</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPEG, PNG, WebP, GIF · max {MAX_SIZE_MB} Mo
            </p>
          </div>
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
