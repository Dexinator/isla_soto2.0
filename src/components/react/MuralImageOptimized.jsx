import { getMuralImage } from '../../data/muralImages.js';

const MuralImage = ({ 
  muralId,
  imagePath, // fallback si no hay muralId
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🎨",
  fallbackIconSize = "text-6xl",
  showLoading = true 
}) => {
  // Intentar obtener la imagen optimizada por ID
  const optimizedImageUrl = muralId ? getMuralImage(muralId) : null;
  
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