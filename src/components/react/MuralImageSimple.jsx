const MuralImage = ({ 
  imagePath, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🎨",
  fallbackIconSize = "text-6xl",
  showLoading = true 
}) => {
  // Si hay una ruta de imagen, usarla directamente
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={alt}
        className={className}
        loading="lazy"
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