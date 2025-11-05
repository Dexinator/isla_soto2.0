import { getMuralImage } from '../../data/muralImages.js';

const MuralImage = ({
  muralId,
  imagePath, // fallback si no hay muralId
  alt,
  size = 'medium', // 'thumb' (80x80), 'medium' (400x400), 'large' (800x800)
  className = "w-full h-full object-cover",
  fallbackIcon = "🎨",
  fallbackIconSize = "text-6xl",
  showLoading = true
}) => {
  // Intentar obtener la imagen optimizada por ID y tamaño
  const optimizedImageUrl = muralId ? getMuralImage(muralId, size) : null;

  // Usar la imagen optimizada si está disponible, si no usar la ruta directa
  const imageUrl = optimizedImageUrl || imagePath;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Fallback
  return (
    <span className={`text-white ${fallbackIconSize}`}>
      {fallbackIcon}
    </span>
  );
};

export default MuralImage;