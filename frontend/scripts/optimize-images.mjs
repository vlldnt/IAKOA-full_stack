// Optimisation des images du dossier assets : PNG → WebP redimensionné.
// Usage : npm run optimize:images
// Les .webp sont générés à côté des originaux ; les imports du code
// pointent vers les .webp.
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const IMAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/assets/images');

// Largeur max selon l'usage : vignettes de catégories vs visuels de la modal d'auth
const WIDE_IMAGES = new Set(['login.png', 'happy.png']);
const THUMB_WIDTH = 320;
const WIDE_WIDTH = 640;
const QUALITY = 80;

const files = (await readdir(IMAGES_DIR)).filter(file => file.endsWith('.png'));

for (const file of files) {
  const source = join(IMAGES_DIR, file);
  const target = source.replace(/\.png$/, '.webp');
  const width = WIDE_IMAGES.has(file) ? WIDE_WIDTH : THUMB_WIDTH;

  const { size: before } = await stat(source);
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(target);
  const { size: after } = await stat(target);

  console.log(
    `${file} → ${file.replace('.png', '.webp')} : ${(before / 1024).toFixed(0)} Ko → ${(after / 1024).toFixed(0)} Ko`,
  );
}
