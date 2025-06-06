# Guía de URLs de SoundCloud - Audioguías Murales Santa Marta

## Tipos de URLs de SoundCloud

Nuestro SoundCloudPlayer puede manejar diferentes tipos de URLs de SoundCloud:

### 1. URLs Públicas
```
https://soundcloud.com/usuario/nombre-del-track
```
**Ejemplo:** `https://soundcloud.com/jorge-badillo-222916125/la-tierra-de-la-aventura`

### 2. URLs de API con Secret Token
```
https://api.soundcloud.com/tracks/ID?secret_token=TOKEN
```
**Ejemplo:** `https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU`

### 3. URLs de Embed Completas
```
https://w.soundcloud.com/player/?url=ENCODED_URL&parámetros
```

## Cómo Obtener las URLs

### Método 1: URL Pública (Recomendado)

1. **Subir el audio** a SoundCloud
2. **Hacer el track público**
3. **Ir a la página del track**
4. **Copiar la URL** de la barra de direcciones
5. **Usar directamente** en murals.json

**Ventajas:**
- ✅ Más simple de manejar
- ✅ No requiere secret tokens
- ✅ Funciona con Widget API sin problemas

### Método 2: URL de API con Secret Token

1. **Subir el audio** a SoundCloud (puede ser privado)
2. **Ir a la página del track**
3. **Hacer clic en "Share"**
4. **Seleccionar "Embed"**
5. **Copiar el código de embed**
6. **Extraer la URL** del parámetro `url=`

**Ejemplo de extracción:**

Del embed:
```html
<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" 
src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2107850961%3Fsecret_token%3Ds-aPi7bGa9jHU&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true">
</iframe>
```

Extraer:
```
https%3A//api.soundcloud.com/tracks/2107850961%3Fsecret_token%3Ds-aPi7bGa9jHU
```

Decodificar:
```
https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU
```

**Ventajas:**
- ✅ Permite tracks privados
- ✅ Control total sobre quién puede acceder
- ✅ Funciona con Widget API

## Configuración en murals.json

### Ejemplo con URL Pública
```json
{
  "audio": {
    "normal": {
      "es": "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-es",
      "en": "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-en"
    },
    "descriptive": "https://soundcloud.com/audioguias-santa-marta/mural-1-descriptive-es",
    "easy": "https://soundcloud.com/audioguias-santa-marta/mural-1-easy-es"
  }
}
```

### Ejemplo con URL de API
```json
{
  "audio": {
    "normal": {
      "es": "https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU",
      "en": "https://api.soundcloud.com/tracks/2107850962?secret_token=s-bXy8cHd2kLV"
    },
    "descriptive": "https://api.soundcloud.com/tracks/2107850963?secret_token=s-cZa9dIe3mNW",
    "easy": "https://api.soundcloud.com/tracks/2107850964?secret_token=s-dAb0eJf4nOX"
  }
}
```

## Procesamiento Automático

Nuestro `SoundCloudPlayer.jsx` procesa automáticamente cualquier tipo de URL:

```javascript
// Función getSoundCloudEmbedUrl() maneja:
// 1. URLs públicas de SoundCloud
// 2. URLs de API con secret tokens
// 3. URLs de embed existentes
// 4. Aplica parámetros personalizados (color, controles, etc.)
```

### Parámetros Aplicados Automáticamente
- `color=%230072c0` - Color corporativo (SM-blue)
- `auto_play=false` - No reproducir automáticamente
- `hide_related=true` - Ocultar tracks relacionados
- `show_comments=false` - Ocultar comentarios
- `show_user=true` - Mostrar usuario
- `show_reposts=false` - Ocultar reposts
- `show_teaser=false` - Ocultar teaser
- `visual=false` - Sin visualización, solo controles

## Script de Actualización

Usar `update-soundcloud-urls.js` para actualizar múltiples URLs:

```bash
cd web
node update-soundcloud-urls.js
```

### Configurar URLs en el Script

Editar la sección `SOUNDCLOUD_URLS`:

```javascript
const SOUNDCLOUD_URLS = {
  mural1: {
    normal: {
      es: "https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU",
      en: "https://soundcloud.com/audioguias-santa-marta/mural-1-normal-en"
    },
    descriptive: "https://api.soundcloud.com/tracks/2107850963?secret_token=s-cZa9dIe3mNW",
    easy: "https://api.soundcloud.com/tracks/2107850964?secret_token=s-dAb0eJf4nOX"
  }
};
```

## Validación de URLs

El script valida automáticamente:

### ✅ URLs Válidas
- `https://soundcloud.com/usuario/track`
- `https://api.soundcloud.com/tracks/123456`
- `https://api.soundcloud.com/tracks/123456?secret_token=abc123`

### ❌ URLs Inválidas
- URLs que no contienen `soundcloud.com`
- Formatos incorrectos
- URLs malformadas

## Troubleshooting

### Problema: Track no carga
**Posibles causas:**
1. Track es privado sin secret token
2. Secret token incorrecto o expirado
3. Track fue eliminado

**Solución:**
1. Verificar que el track existe en SoundCloud
2. Si es privado, obtener nuevo embed con secret token
3. Si es público, usar URL pública directa

### Problema: Widget API no funciona
**Posibles causas:**
1. URL malformada
2. Problemas de CORS
3. Script de Widget API no cargado

**Solución:**
1. Verificar formato de URL
2. Comprobar consola del navegador
3. Verificar que se carga `https://w.soundcloud.com/player/api.js`

### Problema: Controles no responden
**Posibles causas:**
1. Widget no está listo (`READY` event no disparado)
2. Error en la inicialización
3. Track no permite controles externos

**Solución:**
1. Esperar evento `READY`
2. Verificar que `widgetReady` sea `true`
3. Comprobar configuración del track en SoundCloud

## Recomendaciones

### Para Producción
1. **Usar URLs públicas** cuando sea posible
2. **Configurar tracks** con metadatos apropiados
3. **Testear todas las URLs** antes del deploy
4. **Mantener backups** de los secret tokens

### Para Desarrollo
1. **Usar tracks de prueba** públicos
2. **Verificar funcionamiento** en diferentes navegadores
3. **Comprobar responsive** en móviles
4. **Testear fallbacks** desconectando internet

## Próximos Pasos

1. **Subir todos los audios** a SoundCloud
2. **Obtener URLs** (públicas o con secret tokens)
3. **Actualizar murals.json** con URLs reales
4. **Ejecutar script** de validación
5. **Testear funcionamiento** completo
6. **Deploy** a producción

## URLs Actuales del Proyecto

### Mural 1: "La llegada del color"
- ✅ **Normal ES:** `https://api.soundcloud.com/tracks/2107850961?secret_token=s-aPi7bGa9jHU`
- ⏳ **Normal EN:** Pendiente
- ⏳ **Descriptiva:** Pendiente  
- ⏳ **Fácil:** Pendiente

### Mural 2: "Memoria urbana"
- ⏳ **Todas las versiones:** Pendientes

### Mural 3: "Futuro sostenible"
- ⏳ **Todas las versiones:** Pendientes
