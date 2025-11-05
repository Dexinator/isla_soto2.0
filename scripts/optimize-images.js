import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorios
const SOURCE_DIR = join(__dirname, '../src/assets/images/sites');
const OUTPUT_BASE_DIR = join(__dirname, '../public/images/optimized');

// Configuración de tamaños
const SIZES = {
  thumb: { width: 80, height: 80, quality: 85 },      // Para playlist
  medium: { width: 400, height: 400, quality: 90 },   // Para reproductor
  large: { width: 800, height: 800, quality: 92 }     // Para vista completa
};

/**
 * Crear directorios si no existen
 */
async function ensureDirectories() {
  for (const size of Object.keys(SIZES)) {
    const dir = join(OUTPUT_BASE_DIR, size);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  }
}

/**
 * Optimizar una imagen en múltiples tamaños
 */
async function optimizeImage(filePath, fileName) {
  console.log(`\n🖼️  Procesando: ${fileName}`);

  const fileStats = await stat(filePath);
  const originalSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
  console.log(`   Tamaño original: ${originalSizeMB}MB`);

  const baseName = fileName.replace('.png', '');
  const results = {};

  for (const [sizeName, config] of Object.entries(SIZES)) {
    const outputPath = join(OUTPUT_BASE_DIR, sizeName, `${baseName}.webp`);

    try {
      await sharp(filePath)
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: config.quality })
        .toFile(outputPath);

      const outputStats = await stat(outputPath);
      const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - outputStats.size / fileStats.size) * 100).toFixed(1);

      results[sizeName] = {
        path: outputPath,
        size: outputSizeMB,
        reduction
      };

      console.log(`   ✓ ${sizeName}: ${outputSizeMB}MB (${config.width}x${config.height}) - Reducción: ${reduction}%`);
    } catch (error) {
      console.error(`   ✗ Error procesando ${sizeName}:`, error.message);
    }
  }

  return results;
}

/**
 * Procesar todas las imágenes
 */
async function processAllImages() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  console.log(`📁 Directorio fuente: ${SOURCE_DIR}`);
  console.log(`📁 Directorio destino: ${OUTPUT_BASE_DIR}\n`);

  // Crear directorios
  await ensureDirectories();

  // Leer archivos del directorio fuente
  const files = await readdir(SOURCE_DIR);
  const imageFiles = files.filter(file => file.endsWith('.png'));

  console.log(`📊 Encontradas ${imageFiles.length} imágenes PNG para procesar\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  // Procesar cada imagen
  for (const file of imageFiles) {
    const filePath = join(SOURCE_DIR, file);
    const stats = await stat(filePath);
    totalOriginalSize += stats.size;

    const results = await optimizeImage(filePath, file);

    // Sumar el tamaño de todas las versiones optimizadas
    for (const result of Object.values(results)) {
      totalOptimizedSize += parseFloat(result.size) * 1024 * 1024;
    }
  }

  // Resumen final
  const totalOriginalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const totalOptimizedMB = (totalOptimizedSize / 1024 / 1024).toFixed(2);
  const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE OPTIMIZACIÓN');
  console.log('='.repeat(60));
  console.log(`📦 Total imágenes procesadas: ${imageFiles.length}`);
  console.log(`💾 Tamaño original total: ${totalOriginalMB}MB`);
  console.log(`✨ Tamaño optimizado total: ${totalOptimizedMB}MB`);
  console.log(`📉 Reducción total: ${totalReduction}%`);
  console.log('='.repeat(60));
  console.log('\n✅ ¡Optimización completada!\n');
}

// Ejecutar
processAllImages().catch(error => {
  console.error('❌ Error durante la optimización:', error);
  process.exit(1);
});
