# Guía para Obtener URLs Directas de Audio.com

## ¿Por qué URLs directas?

Con URLs directas de MP3 podemos usar nuestros **controles personalizados** que son más bonitos y consistentes con el diseño de la página, en lugar de depender del embed de Audio.com.

## Métodos para obtener URLs directas:

### Método 1: Inspeccionar el reproductor de Audio.com

1. **Abre tu audio en Audio.com** en el navegador
2. **Abre las herramientas de desarrollador** (F12)
3. **Ve a la pestaña Network**
4. **Reproduce el audio**
5. **Busca en Network** una petición que termine en `.mp3` o similar
6. **Copia esa URL** - esa es la URL directa

### Método 2: Verificar si Audio.com expone URLs directas

Algunas plataformas tienen patrones predecibles:

```
# Patrón posible (hay que verificar):
https://audio.com/api/audio/[ID]/stream
https://audio.com/direct/[ID].mp3
https://cdn.audio.com/[ID]/audio.mp3
```

### Método 3: Usar la API de Audio.com (si existe)

Revisar la documentación de Audio.com para ver si tienen una API que proporcione URLs directas.

## Configuración en nuestro proyecto:

### Si tienes URLs directas:

```json
{
  "id": 1,
  "audio": {
    "normal": {
      "es": "https://audio.com/direct/1834028613584727.mp3",
      "en": "https://audio.com/direct/OTRO-ID.mp3"
    },
    "descriptive": "https://audio.com/direct/ID-DESCRIPTIVA.mp3",
    "easy": "https://audio.com/direct/ID-FACIL.mp3"
  }
}
```

### Si solo tienes URLs de embed:

```json
{
  "id": 1,
  "audio": {
    "normal": {
      "es": "https://audio.com/embed/audio/1834028613584727?theme=image",
      "en": "https://audio.com/embed/audio/OTRO-ID?theme=image"
    }
  }
}
```

## Ventajas de cada método:

### URLs Directas (Recomendado):
✅ **Controles personalizados** bonitos y consistentes  
✅ **Mejor experiencia de usuario**  
✅ **Control total** sobre la reproducción  
✅ **Progreso real** y seeking preciso  
✅ **Integración perfecta** con nuestro diseño  

### URLs de Embed (Fallback):
✅ **Siempre funciona** sin configuración adicional  
✅ **Mantenido por Audio.com**  
❌ Controles menos integrados  
❌ Diseño menos consistente  

## Nuestro sistema híbrido:

El código actual **intenta usar URLs directas primero** y si no funcionan, **hace fallback automático al embed de Audio.com**.

## Pasos para implementar:

1. **Prueba el Método 1** con tu audio actual
2. **Si encuentras la URL directa**, actualiza `murals.json`
3. **Si no funciona**, el sistema usará automáticamente el embed

## Ejemplo de testing:

```javascript
// En la consola del navegador, prueba:
const audio = new Audio('https://audio.com/api/audio/1834028613584727/stream');
audio.play().then(() => {
  console.log('✅ URL directa funciona!');
}).catch(() => {
  console.log('❌ URL directa no funciona, usar embed');
});
```

## Configuración actual:

Tu audio `1834028613584727` está configurado como embed. El sistema:

1. **Intenta convertir** a URL directa automáticamente
2. **Si falla**, muestra el embed de Audio.com como fallback
3. **Mantiene** nuestros controles bonitos cuando es posible

## ¿Qué hacer ahora?

1. **Prueba la página** tal como está - debería funcionar
2. **Si quieres controles más integrados**, busca las URLs directas
3. **Si prefieres simplicidad**, mantén los embeds actuales

El sistema está preparado para ambos casos! 🎵
