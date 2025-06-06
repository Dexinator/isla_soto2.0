#!/usr/bin/env node

/**
 * Script para actualizar las URLs de Audio.com en murals.json
 * 
 * Uso:
 * 1. Edita las URLs en la sección CONFIGURACIÓN
 * 2. Ejecuta: node update-audio-urls.js
 * 3. El archivo murals.json se actualizará automáticamente
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURACIÓN - EDITA ESTAS URLs
// ============================================

const AUDIO_URLS = {
  mural1: {
    normal: {
      es: "https://audio.com/jorge-badillo/audio/me-miento-mal",
      en: "https://audio.com/embed/audio/REEMPLAZAR-CON-ID-REAL-2?theme=image"
    },
    descriptive: "https://audio.com/embed/audio/REEMPLAZAR-CON-ID-REAL-3?theme=image",
    easy: "https://audio.com/embed/audio/REEMPLAZAR-CON-ID-REAL-4?theme=image"
  },
  mural2: {
    normal: {
      es: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-5",
      en: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-6"
    },
    descriptive: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-7",
    easy: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-8"
  },
  mural3: {
    normal: {
      es: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-9",
      en: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-10"
    },
    descriptive: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-11",
    easy: "https://audio.com/embed/REEMPLAZAR-CON-ID-REAL-12"
  }
};

// ============================================
// SCRIPT - NO EDITAR DEBAJO DE ESTA LÍNEA
// ============================================

const MURALS_FILE = path.join(__dirname, 'src', 'data', 'murals.json');

function updateAudioUrls() {
  try {
    // Leer archivo actual
    console.log('📖 Leyendo murals.json...');
    const muralsData = JSON.parse(fs.readFileSync(MURALS_FILE, 'utf8'));
    
    // Verificar que tenemos URLs reales
    const hasRealUrls = Object.values(AUDIO_URLS).some(mural => 
      Object.values(mural).some(audio => 
        typeof audio === 'string' 
          ? !audio.includes('REEMPLAZAR-CON-ID-REAL')
          : Object.values(audio).some(url => !url.includes('REEMPLAZAR-CON-ID-REAL'))
      )
    );
    
    if (!hasRealUrls) {
      console.log('⚠️  ADVERTENCIA: Todas las URLs contienen "REEMPLAZAR-CON-ID-REAL"');
      console.log('   Edita las URLs en la sección CONFIGURACIÓN antes de ejecutar este script.');
      return;
    }
    
    // Actualizar URLs
    console.log('🔄 Actualizando URLs de audio...');
    
    muralsData.murals.forEach((mural, index) => {
      const muralKey = `mural${index + 1}`;
      if (AUDIO_URLS[muralKey]) {
        mural.audio = AUDIO_URLS[muralKey];
        console.log(`   ✅ Mural ${mural.id}: ${mural.title.es}`);
      }
    });
    
    // Actualizar metadata
    muralsData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    
    // Escribir archivo actualizado
    console.log('💾 Guardando cambios...');
    fs.writeFileSync(MURALS_FILE, JSON.stringify(muralsData, null, 2), 'utf8');
    
    console.log('✅ ¡URLs actualizadas correctamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   - Archivo: ${MURALS_FILE}`);
    console.log(`   - Murales actualizados: ${muralsData.murals.length}`);
    console.log(`   - Fecha de actualización: ${muralsData.metadata.lastUpdated}`);
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('   1. Verifica que las URLs son correctas');
    console.log('   2. Prueba la aplicación: npm run dev');
    console.log('   3. Verifica que los audios se reproducen correctamente');
    
  } catch (error) {
    console.error('❌ Error al actualizar URLs:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('');
      console.log('💡 Asegúrate de ejecutar este script desde la carpeta web/');
      console.log('   Estructura esperada: web/src/data/murals.json');
    }
  }
}

// Función para validar URLs
function validateUrls() {
  console.log('🔍 Validando URLs...');
  
  const allUrls = [];
  Object.entries(AUDIO_URLS).forEach(([muralKey, mural]) => {
    Object.entries(mural).forEach(([audioType, audio]) => {
      if (typeof audio === 'string') {
        allUrls.push({ mural: muralKey, type: audioType, url: audio });
      } else {
        Object.entries(audio).forEach(([lang, url]) => {
          allUrls.push({ mural: muralKey, type: `${audioType}-${lang}`, url });
        });
      }
    });
  });
  
  const invalidUrls = allUrls.filter(item => 
    item.url.includes('REEMPLAZAR-CON-ID-REAL') || 
    !item.url.startsWith('https://audio.com/embed/')
  );
  
  if (invalidUrls.length > 0) {
    console.log('⚠️  URLs que necesitan actualización:');
    invalidUrls.forEach(item => {
      console.log(`   - ${item.mural} (${item.type}): ${item.url}`);
    });
    return false;
  }
  
  console.log('✅ Todas las URLs parecen válidas');
  return true;
}

// Función principal
function main() {
  console.log('🎵 Actualizador de URLs de Audio.com');
  console.log('=====================================');
  console.log('');
  
  if (process.argv.includes('--validate')) {
    validateUrls();
    return;
  }
  
  if (process.argv.includes('--help')) {
    console.log('Uso:');
    console.log('  node update-audio-urls.js           # Actualizar URLs');
    console.log('  node update-audio-urls.js --validate # Validar URLs');
    console.log('  node update-audio-urls.js --help     # Mostrar ayuda');
    return;
  }
  
  updateAudioUrls();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { updateAudioUrls, validateUrls, AUDIO_URLS };
