#!/usr/bin/env node

/**
 * Script para actualizar URLs de SoundCloud en murals.json
 * 
 * Uso:
 * 1. Editar las URLs en la sección SOUNDCLOUD_URLS
 * 2. Ejecutar: node update-soundcloud-urls.js
 * 3. Verificar los cambios en src/data/murals.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN - EDITAR ESTAS URLs CON LAS REALES DE SOUNDCLOUD
// ============================================================================

const SOUNDCLOUD_URLS = {
  // Mural 1: "La llegada del color"
  mural1: {
    normal: {
      es: "https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU",
      en: "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-en"
    },
    descriptive: "https://soundcloud.com/audioguias-santa-marta/mural-1-descriptive-es",
    easy: "https://soundcloud.com/audioguias-santa-marta/mural-1-easy-es"
  },

  // Mural 2: "Memoria urbana"
  mural2: {
    normal: {
      es: "https://soundcloud.com/audioguias-santa-marta/mural-2-normal-es",
      en: "https://soundcloud.com/audioguias-santa-marta/mural-2-normal-en"
    },
    descriptive: "https://soundcloud.com/audioguias-santa-marta/mural-2-descriptive-es",
    easy: "https://soundcloud.com/audioguias-santa-marta/mural-2-easy-es"
  },

  // Mural 3: "Futuro sostenible"
  mural3: {
    normal: {
      es: "https://soundcloud.com/audioguias-santa-marta/mural-3-normal-es",
      en: "https://soundcloud.com/audioguias-santa-marta/mural-3-normal-en"
    },
    descriptive: "https://soundcloud.com/audioguias-santa-marta/mural-3-descriptive-es",
    easy: "https://soundcloud.com/audioguias-santa-marta/mural-3-easy-es"
  }
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Validar que una URL de SoundCloud sea válida
 */
function validateSoundCloudUrl(url) {
  if (!url) return false;

  // Verificar que sea una URL de SoundCloud (pública o API)
  if (!url.includes('soundcloud.com/')) {
    console.warn(`⚠️  URL no es de SoundCloud: ${url}`);
    return false;
  }

  // Verificar formato de URL pública
  const publicPattern = /^https:\/\/soundcloud\.com\/[^\/]+\/[^\/]+$/;

  // Verificar formato de URL de API
  const apiPattern = /^https:\/\/api\.soundcloud\.com\/tracks\/\d+(\?secret_token=[\w-]+)?$/;

  if (!publicPattern.test(url) && !apiPattern.test(url)) {
    console.warn(`⚠️  Formato de URL de SoundCloud inválido: ${url}`);
    console.warn(`     Formatos válidos:`);
    console.warn(`     - Pública: https://soundcloud.com/usuario/track`);
    console.warn(`     - API: https://api.soundcloud.com/tracks/123456?secret_token=abc`);
    return false;
  }

  return true;
}

/**
 * Crear backup del archivo original
 */
function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = filePath.replace('.json', `_backup_${timestamp}.json`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backup creado: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Error creando backup: ${error.message}`);
    return null;
  }
}

/**
 * Validar estructura de datos
 */
function validateMuralsData(data) {
  if (!data.murals || !Array.isArray(data.murals)) {
    throw new Error('Estructura de datos inválida: falta array "murals"');
  }
  
  if (data.murals.length !== 3) {
    throw new Error(`Se esperaban 3 murales, encontrados: ${data.murals.length}`);
  }
  
  return true;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

function updateSoundCloudUrls() {
  const muralsPath = path.join(__dirname, 'src', 'data', 'murals.json');
  
  console.log('🎵 Actualizando URLs de SoundCloud...\n');
  
  // Verificar que el archivo existe
  if (!fs.existsSync(muralsPath)) {
    console.error(`❌ Archivo no encontrado: ${muralsPath}`);
    process.exit(1);
  }
  
  // Crear backup
  const backupPath = createBackup(muralsPath);
  if (!backupPath) {
    console.error('❌ No se pudo crear backup. Abortando.');
    process.exit(1);
  }
  
  try {
    // Leer archivo actual
    const rawData = fs.readFileSync(muralsPath, 'utf8');
    const muralsData = JSON.parse(rawData);
    
    // Validar estructura
    validateMuralsData(muralsData);
    
    // Contador de URLs actualizadas
    let updatedCount = 0;
    let validationErrors = 0;
    
    // Actualizar URLs para cada mural
    const urlMappings = [
      { muralIndex: 0, urlKey: 'mural1' },
      { muralIndex: 1, urlKey: 'mural2' },
      { muralIndex: 2, urlKey: 'mural3' }
    ];
    
    urlMappings.forEach(({ muralIndex, urlKey }) => {
      const mural = muralsData.murals[muralIndex];
      const newUrls = SOUNDCLOUD_URLS[urlKey];
      
      console.log(`📝 Actualizando Mural ${muralIndex + 1}: "${mural.title.es}"`);
      
      // Actualizar URLs normales (español e inglés)
      if (newUrls.normal.es) {
        if (validateSoundCloudUrl(newUrls.normal.es)) {
          mural.audio.normal.es = newUrls.normal.es;
          updatedCount++;
          console.log(`   ✅ Normal ES: ${newUrls.normal.es}`);
        } else {
          validationErrors++;
        }
      }
      
      if (newUrls.normal.en) {
        if (validateSoundCloudUrl(newUrls.normal.en)) {
          mural.audio.normal.en = newUrls.normal.en;
          updatedCount++;
          console.log(`   ✅ Normal EN: ${newUrls.normal.en}`);
        } else {
          validationErrors++;
        }
      }
      
      // Actualizar URL descriptiva
      if (newUrls.descriptive) {
        if (validateSoundCloudUrl(newUrls.descriptive)) {
          mural.audio.descriptive = newUrls.descriptive;
          updatedCount++;
          console.log(`   ✅ Descriptiva: ${newUrls.descriptive}`);
        } else {
          validationErrors++;
        }
      }
      
      // Actualizar URL fácil
      if (newUrls.easy) {
        if (validateSoundCloudUrl(newUrls.easy)) {
          mural.audio.easy = newUrls.easy;
          updatedCount++;
          console.log(`   ✅ Fácil: ${newUrls.easy}`);
        } else {
          validationErrors++;
        }
      }
      
      console.log('');
    });
    
    // Guardar archivo actualizado
    const updatedJson = JSON.stringify(muralsData, null, 2);
    fs.writeFileSync(muralsPath, updatedJson, 'utf8');
    
    // Resumen
    console.log('📊 RESUMEN:');
    console.log(`   ✅ URLs actualizadas: ${updatedCount}`);
    console.log(`   ⚠️  Errores de validación: ${validationErrors}`);
    console.log(`   📁 Archivo actualizado: ${muralsPath}`);
    console.log(`   💾 Backup disponible: ${backupPath}`);
    
    if (validationErrors > 0) {
      console.log('\n⚠️  Hay errores de validación. Revisa las URLs antes de continuar.');
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Actualización completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Revisar los cambios en src/data/murals.json');
    console.log('   2. Probar la aplicación: npm run dev');
    console.log('   3. Verificar que los audios cargan correctamente');
    
  } catch (error) {
    console.error(`❌ Error procesando archivo: ${error.message}`);
    
    // Restaurar backup si hay error
    if (backupPath && fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, muralsPath);
        console.log('🔄 Archivo restaurado desde backup');
      } catch (restoreError) {
        console.error(`❌ Error restaurando backup: ${restoreError.message}`);
      }
    }
    
    process.exit(1);
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

// Verificar que se ejecuta desde el directorio correcto
if (!fs.existsSync(path.join(__dirname, 'src', 'data'))) {
  console.error('❌ Este script debe ejecutarse desde el directorio web/');
  console.error('   Uso: cd web && node update-soundcloud-urls.js');
  process.exit(1);
}

// Ejecutar función principal
updateSoundCloudUrls();
