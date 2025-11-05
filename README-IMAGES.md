# 🖼️ Sistema de Optimización de Imágenes

## 📊 Resumen de la optimización

- **Formato original:** 10 imágenes PNG (121.39 MB)
- **Formato optimizado:** 30 imágenes WebP (2.64 MB)
- **Reducción total:** 97.8%

## 🎯 Tamaños generados

| Tamaño | Dimensiones | Peso aprox. | Uso |
|--------|-------------|-------------|-----|
| `thumb` | 80x80 | ~2 KB | Miniaturas en playlist y controles flotantes |
| `medium` | 400x400 | ~50 KB | *(Sin uso actual)* |
| `large` | 800x800 | ~200 KB | Cover del reproductor principal |

## 📁 Ubicación de archivos

```
public/
└── images/
    └── optimized/
        ├── thumb/     (80x80)  - Para listas y thumbnails
        ├── medium/    (400x400) - Reservado para uso futuro
        └── large/     (800x800) - Para reproductores principales
```

## 🔧 Uso en componentes

### PlaylistManager
```jsx
<MuralImage muralId={mural.id} size="thumb" />
```
**Razón:** Lista con 10 murales, solo necesita thumbnails pequeños

### SoundCloudPlayer / VimeoPlayer
```jsx
<MuralImage muralId={currentMural.id} size="large" />
```
**Razón:** Cover principal del reproductor, puede ocupar ~500-600px en desktop

### AudioguideContainer / SignoguideContainer (controles flotantes)
```jsx
<MuralImage muralId={currentMural.id} size="thumb" />
```
**Razón:** Thumbnail pequeño de 40x40px en controles móviles

## 🚀 Cómo regenerar las imágenes

```bash
# Dentro del contenedor de desarrollo
docker-compose exec dev npm run optimize-images
```

## 💡 Notas técnicas

- Las imágenes se generan con **Sharp** y se convierten a **WebP**
- Calidades: thumb (85%), medium (90%), large (92%)
- Todas usan `loading="lazy"` para carga diferida
- El sistema es automático y requiere una sola ejecución del script
