import { useState, useEffect } from 'react';

/**
 * Hook para cargar imágenes dinámicamente desde src/assets/images/murals/
 * Astro optimiza automáticamente las imágenes importadas
 */
export const useImageLoader = (imagePath) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Extraer el nombre del archivo de la ruta
        const filename = imagePath.split('/').pop();
        
        if (!filename) {
          throw new Error('Nombre de archivo inválido');
        }

        // Importar dinámicamente desde assets
        const imageModule = await import(`../../assets/images/murals/${filename}`);
        
        // Astro procesa las imágenes y devuelve un objeto con src optimizado
        setImageUrl(imageModule.default?.src || imageModule.default);
        
      } catch (err) {
        console.warn(`No se pudo cargar la imagen: ${imagePath}`, err);
        setError(err.message);
        // Fallback: intentar usar la ruta directamente si la importación falla
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return { imageUrl, isLoading, error };
};

/**
 * Función para limpiar nombres de archivo y convertirlos a un formato válido
 */
export const sanitizeImagePath = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  // Si ya es una ruta HTTP, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Extraer solo el nombre del archivo
  const filename = imagePath.split('/').pop();
  
  return filename;
};