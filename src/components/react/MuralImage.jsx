import { useImageLoader } from './useImageLoader.js';

const MuralImage = ({ 
  imagePath, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🎨",
  fallbackIconSize = "text-6xl",
  showLoading = true 
}) => {
  const { imageUrl, isLoading, error } = useImageLoader(imagePath);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center text-white">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
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