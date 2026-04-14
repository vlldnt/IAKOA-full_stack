const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload une image vers Cloudinary (unsigned upload preset requis).
 * Retourne l'URL publique sécurisée du fichier uploadé.
 * Variables d'env requises :
 *   VITE_CLOUDINARY_CLOUD_NAME=moncloud
 *   VITE_CLOUDINARY_UPLOAD_PRESET=mon_preset
 */
export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Configuration Cloudinary manquante. Définissez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans votre .env'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Échec de l'upload de l'image.");
  }

  const data = await res.json();
  return data.secure_url as string;
}
