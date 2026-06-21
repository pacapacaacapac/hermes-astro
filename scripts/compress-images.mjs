import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const INPUT_DIR  = 'public/pictures';
const OUTPUT_DIR = 'public/pictures-optimized';
const MAX_WIDTH  = 1920;

const QUALITY = { jpeg: 75, webp: 75, png: 9 };

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.webp', '.png']);

async function compress() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const files = await readdir(INPUT_DIR);
  const images = files.filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));

  console.log(`\nKomprimiere ${images.length} Bilder → ${OUTPUT_DIR}\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of images) {
    const inputPath  = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);
    const ext = path.extname(file).toLowerCase();

    try {
      const { size: originalSize } = (await import('fs')).default.statSync(inputPath);
      totalOriginal += originalSize;

      let pipeline = sharp(inputPath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: QUALITY.jpeg, progressive: true });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: QUALITY.webp });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ compressionLevel: QUALITY.png, palette: true });
      }

      await pipeline.toFile(outputPath);

      const { size: optimizedSize } = (await import('fs')).default.statSync(outputPath);
      totalOptimized += optimizedSize;

      const saving = Math.round((1 - optimizedSize / originalSize) * 100);
      const origKB = Math.round(originalSize / 1024);
      const optKB  = Math.round(optimizedSize / 1024);
      console.log(`  ${saving > 0 ? '-' + saving + '%' : '  0%'}  ${origKB} KB → ${optKB} KB   ${file}`);
    } catch (err) {
      console.error(`  FEHLER: ${file} — ${err.message}`);
    }
  }

  const totalSaving = Math.round((1 - totalOptimized / totalOriginal) * 100);
  console.log(`\n  Gesamt: ${Math.round(totalOriginal/1024)} KB → ${Math.round(totalOptimized/1024)} KB  (${totalSaving}% gespart)\n`);
  console.log(`Originale unberührt in: ${INPUT_DIR}`);
  console.log(`Optimierte Bilder in:   ${OUTPUT_DIR}`);
  console.log(`\nWenn du zufrieden bist, tausch die Ordner:\n  mv public/pictures public/pictures-originals\n  mv public/pictures-optimized public/pictures`);
}

compress();
