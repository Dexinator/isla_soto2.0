# Configuración de Audio.com para Audioguías Murales

## 1. Preparar los archivos de audio

### Estructura recomendada de archivos:
```
audios/
├── mural-1/
│   ├── mural-1-normativa-es.mp3
│   ├── mural-1-normativa-en.mp3
│   ├── mural-1-descriptiva-es.mp3
│   └── mural-1-facil-es.mp3
├── mural-2/
│   ├── mural-2-normativa-es.mp3
│   ├── mural-2-normativa-en.mp3
│   ├── mural-2-descriptiva-es.mp3
│   └── mural-2-facil-es.mp3
└── mural-3/
    ├── mural-3-normativa-es.mp3
    ├── mural-3-normativa-en.mp3
    ├── mural-3-descriptiva-es.mp3
    └── mural-3-facil-es.mp3
```

## 2. Subir a Audio.com

### Pasos:
1. **Crear cuenta en Audio.com**
   - Ir a https://audio.com
   - Registrarse con email
   - Verificar cuenta

2. **Crear un proyecto/álbum**
   - Nombre: "Audioguías Murales Santa Marta"
   - Descripción: "Audioguías accesibles para los murales de Santa Marta de Tormes"

3. **Subir cada archivo**
   - Usar nombres descriptivos
   - Añadir metadatos (título, descripción, tags)
   - Configurar como público o unlisted según preferencia

4. **Obtener URLs de embed**
   - Para cada audio, obtener la URL de embed
   - Audio.com te dará un código como:
   ```html
   <div style="height: 228px; width: 204px;">
     <iframe src="https://audio.com/embed/audio/1834028613584727?theme=image"...>
     </iframe>
   </div>
   ```
   - Extrae solo la URL del src: `https://audio.com/embed/audio/1834028613584727?theme=image`
   - O puedes usar la URL directa del audio: `https://audio.com/usuario/audio/nombre-audio`

## 3. Actualizar murals.json

### Plantilla para copiar las URLs:

```json
{
  "id": 1,
  "audio": {
    "normal": {
      "es": "https://audio.com/embed/[ID-MURAL-1-NORMATIVA-ES]",
      "en": "https://audio.com/embed/[ID-MURAL-1-NORMATIVA-EN]"
    },
    "descriptive": "https://audio.com/embed/[ID-MURAL-1-DESCRIPTIVA-ES]",
    "easy": "https://audio.com/embed/[ID-MURAL-1-FACIL-ES]"
  }
}
```

## 4. Configuración recomendada en Audio.com

### Metadatos para cada audio:

**Mural 1 - Normativa ES:**
- Título: "La llegada del color - Audioguía Normativa"
- Descripción: "Audio estándar del mural 'La llegada del color' por Daniel Martín"
- Tags: "mural, santa marta, arte urbano, normativa, español"
- Duración: ~8 minutos

**Mural 1 - Normativa EN:**
- Título: "The Arrival of Color - Standard Audioguide"
- Descripción: "Standard audio for 'The Arrival of Color' mural by Daniel Martín"
- Tags: "mural, santa marta, urban art, standard, english"
- Duración: ~8 minutos

**Mural 1 - Descriptiva ES:**
- Título: "La llegada del color - Audioguía Descriptiva"
- Descripción: "Audio con descripciones detalladas para personas con discapacidad visual"
- Tags: "mural, santa marta, descriptiva, accesibilidad, español"
- Duración: ~12 minutos

**Mural 1 - Fácil ES:**
- Título: "La llegada del color - Audioguía Fácil"
- Descripción: "Audio adaptado para discapacidad intelectual con lenguaje claro"
- Tags: "mural, santa marta, facil, accesibilidad, español"
- Duración: ~5 minutos

## 5. Configuración de privacidad

### Opciones recomendadas:
- **Público:** Si quieres que aparezcan en búsquedas de Audio.com
- **Unlisted:** Si solo quieres que sean accesibles por URL directa
- **Embeddable:** Siempre activar para que funcionen en la web

## 6. Analytics y tracking

### Audio.com proporciona:
- Número de reproducciones
- Tiempo de escucha promedio
- Ubicación geográfica de oyentes
- Dispositivos utilizados
- Tasa de finalización

## 7. Backup y organización

### Recomendaciones:
- Mantener archivos originales organizados
- Documentar todas las URLs en una hoja de cálculo
- Hacer backup regular de la configuración
- Versionar los audios si hay actualizaciones

## 8. Testing

### Checklist antes de publicar:
- [ ] Todos los embeds cargan correctamente
- [ ] Audio se reproduce sin problemas
- [ ] Metadatos son correctos
- [ ] URLs funcionan en diferentes navegadores
- [ ] Responsive design funciona en móvil
- [ ] Analytics están configurados

## 9. URLs de ejemplo (reemplazar con las reales)

```javascript
// Ejemplo de cómo quedarían las URLs reales:
const audioUrls = {
  mural1: {
    normal: {
      es: "https://audio.com/embed/abc123",
      en: "https://audio.com/embed/def456"
    },
    descriptive: "https://audio.com/embed/ghi789",
    easy: "https://audio.com/embed/jkl012"
  }
  // ... más murales
};
```

## 10. Próximos pasos

1. **Subir audios a Audio.com**
2. **Obtener URLs de embed**
3. **Actualizar murals.json con URLs reales**
4. **Probar funcionamiento**
5. **Configurar analytics**
6. **Publicar en producción**

---

**Nota:** Una vez tengas las URLs reales de Audio.com, simplemente reemplaza las URLs de ejemplo en `web/src/data/murals.json` y la integración funcionará automáticamente.
