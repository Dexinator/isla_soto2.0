# Guía de Configuración SoundCloud - Audioguías Murales Santa Marta

## Información General

Este proyecto ahora utiliza **SoundCloud Widget API** en lugar de Audio.com para una mejor experiencia de usuario con controles completamente personalizados.

## Ventajas de SoundCloud Widget API

### ✅ Beneficios Técnicos
- **Widget API completa:** Control total sobre reproducción, volumen, seeking
- **Controles personalizados:** Interfaz propia ocultando el reproductor nativo
- **Infraestructura robusta:** Streaming confiable y escalable
- **Analytics nativos:** Métricas integradas de SoundCloud
- **Sin backend propio:** Solución completamente frontend
- **Móvil optimizado:** Funciona perfectamente en dispositivos móviles

### ✅ Beneficios de UX
- **Experiencia consistente:** Misma interfaz en toda la aplicación
- **Controles intuitivos:** Diseño personalizado siguiendo el manual de identidad
- **Estados visuales claros:** Indicadores de carga, error y progreso
- **Iframe completamente oculto:** Solo nuestros controles, sin reproductores nativos visibles

## Configuración Paso a Paso

### 1. Crear Cuenta SoundCloud

1. **Ir a SoundCloud:** https://soundcloud.com
2. **Crear cuenta** para el proyecto (recomendado: cuenta específica para Santa Marta)
3. **Configurar perfil:**
   - Nombre: "Audioguías Murales Santa Marta"
   - Descripción: "Audioguías oficiales de los murales de Santa Marta de Tormes"
   - Imagen de perfil: Logo del proyecto

### 2. Subir Audios

Para cada mural, subir los siguientes audios:

#### Mural 1: "La llegada del color"
- `mural-1-normal-es` - Audioguía normativa en español
- `mural-1-normal-en` - Audioguía normativa en inglés  
- `mural-1-descriptive-es` - Audioguía descriptiva en español
- `mural-1-easy-es` - Audioguía fácil en español

#### Mural 2: "Memoria urbana"
- `mural-2-normal-es` - Audioguía normativa en español
- `mural-2-normal-en` - Audioguía normativa en inglés
- `mural-2-descriptive-es` - Audioguía descriptiva en español
- `mural-2-easy-es` - Audioguía fácil en español

#### Mural 3: "Futuro sostenible"
- `mural-3-normal-es` - Audioguía normativa en español
- `mural-3-normal-en` - Audioguía normativa en inglés
- `mural-3-descriptive-es` - Audioguía descriptiva en español
- `mural-3-easy-es` - Audioguía fácil en español

### 3. Configurar Metadatos

Para cada audio, configurar:

```
Título: [Nombre del mural] - [Tipo de audioguía] ([Idioma])
Descripción: Audioguía [tipo] del mural "[nombre]" ubicado en [ubicación], Santa Marta de Tormes.
Tags: audioguía, mural, santa marta, tormes, arte urbano, turismo, accesible
Género: Spoken Word
```

**Ejemplo:**
```
Título: La llegada del color - Audioguía Normativa (Español)
Descripción: Audioguía normativa del mural "La llegada del color" ubicado en Dr. Torres Villarroel, 1, Santa Marta de Tormes.
Tags: audioguía, mural, santa marta, tormes, arte urbano, turismo, accesible, daniel martin
```

### 4. Obtener URLs

Una vez subidos, obtener las URLs públicas:

1. **Ir a cada track** en SoundCloud
2. **Copiar la URL** de la barra de direcciones
3. **Formato esperado:** `https://soundcloud.com/[usuario]/[track-name]`

### 5. Actualizar murals.json

Editar el archivo `web/src/data/murals.json` con las URLs reales:

```json
{
  "murals": [
    {
      "id": 1,
      "title": {
        "es": "La llegada del color",
        "en": "The Arrival of Color"
      },
      "audio": {
        "normal": {
          "es": "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-es",
          "en": "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-en"
        },
        "descriptive": "https://soundcloud.com/audioguias-santa-marta/mural-1-descriptive-es",
        "easy": "https://soundcloud.com/audioguias-santa-marta/mural-1-easy-es"
      }
    }
  ]
}
```

## Implementación Técnica

### SoundCloudPlayer.jsx

El componente `SoundCloudPlayer.jsx` maneja automáticamente:

1. **Carga del Widget API:** Script de SoundCloud cargado dinámicamente
2. **Conversión de URLs:** URLs de SoundCloud convertidas a embeds automáticamente
3. **Configuración personalizada:**
   - Color corporativo: `#0072c0` (SM-blue)
   - Controles ocultos: `visual=false`
   - Sin elementos distractores: `hide_related=true`, `show_comments=false`

### Parámetros del Embed

```javascript
const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230072c0&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
```

### Widget API Events

El reproductor escucha los siguientes eventos:

- `READY` - Widget cargado y listo
- `PLAY` - Reproducción iniciada
- `PAUSE` - Reproducción pausada
- `FINISH` - Track terminado
- `PLAY_PROGRESS` - Progreso de reproducción
- `ERROR` - Error en la carga

## Testing y Validación

### 1. Probar Localmente

```bash
cd web
npm run dev
```

### 2. Verificar Funcionalidades

- ✅ **Carga del audio:** Widget se inicializa correctamente
- ✅ **Controles personalizados:** Play/pause, seek, volumen funcionan
- ✅ **Progreso en tiempo real:** Barra de progreso se actualiza
- ✅ **Navegación:** Anterior/siguiente entre murales
- ✅ **Estados visuales:** Carga, error, reproduciendo
- ✅ **Iframe oculto:** Solo controles personalizados visibles

### 3. Testing en Dispositivos

- **Desktop:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS Safari, Android Chrome
- **Tablet:** iPad, Android tablets

## Troubleshooting

### Problema: Widget no se carga

**Solución:**
1. Verificar que las URLs de SoundCloud sean públicas
2. Comprobar que el script de Widget API se carga correctamente
3. Revisar la consola del navegador para errores

### Problema: Audio no reproduce

**Solución:**
1. Verificar que el track esté público en SoundCloud
2. Comprobar que la URL sea correcta
3. Verificar permisos de autoplay del navegador

### Problema: Controles no responden

**Solución:**
1. Esperar a que el evento `READY` se dispare
2. Verificar que `widgetReady` sea `true`
3. Comprobar que no hay errores en la consola

## Monitoreo y Analytics

### SoundCloud Analytics

- **Dashboard nativo:** https://soundcloud.com/you/stats
- **Métricas disponibles:**
  - Reproducciones por track
  - Tiempo de escucha
  - Ubicación de oyentes
  - Dispositivos utilizados

### Google Analytics 4

El reproductor envía eventos personalizados:

```javascript
gtag('event', 'audio_play', {
  'mural_id': muralId,
  'audio_type': audioType,
  'language': language,
  'progress': progress,
  'platform': 'soundcloud'
});
```

## Próximos Pasos

1. **Configurar cuenta SoundCloud real**
2. **Subir audios con metadatos apropiados**
3. **Actualizar URLs en murals.json**
4. **Testing completo en todos los dispositivos**
5. **Implementar audioguía fácil con SoundCloudPlayer**
6. **Configurar analytics y monitoreo**

## Contacto y Soporte

Para dudas sobre la implementación técnica, consultar:
- Documentación SoundCloud Widget API: https://developers.soundcloud.com/docs/api/html5-widget
- Código fuente: `web/src/components/react/SoundCloudPlayer.jsx`
