// Mapa de nombres de archivo por ID de mural
// Las imágenes optimizadas están en /public/images/optimized/
const muralFileNames = {
  1: 'isla-soto-comenzamos-paseo-santa-marta-tormes',
  2: 'isla-soto-origen-islas-rio-tormes',
  3: 'isla-soto-flora-vegetacion-caracteristica',
  4: 'isla-soto-fauna-animales-habitat',
  5: 'isla-soto-avifauna-rio-bosque-ribera',
  6: 'isla-soto-especies-introducidas-no-autoctonas',
  7: 'isla-soto-centro-interpretacion-naturaleza',
  8: 'isla-soto-zonas-usos-actividades',
  9: 'isla-soto-rutas-senderos-santa-marta-tormes',
  10: 'isla-soto-final-paseo-despedida'
};

/**
 * Obtener la URL de la imagen optimizada por ID y tamaño
 * @param {number} muralId - ID del mural (1-10)
 * @param {string} size - Tamaño: 'thumb' (80x80), 'medium' (400x400), 'large' (800x800)
 * @returns {string|null} URL de la imagen optimizada en WebP
 */
export const getMuralImage = (muralId, size = 'medium') => {
  const fileName = muralFileNames[muralId];
  if (!fileName) return null;

  // Validar tamaño
  const validSizes = ['thumb', 'medium', 'large'];
  if (!validSizes.includes(size)) {
    console.warn(`Tamaño inválido: ${size}. Usando 'medium' por defecto.`);
    size = 'medium';
  }

  // Devolver la URL de la imagen optimizada en WebP
  return `/images/optimized/${size}/${fileName}.webp`;
};

/**
 * Obtener todas las URLs de una imagen (todos los tamaños)
 * Útil para responsive images con srcset
 */
export const getMuralImageSet = (muralId) => {
  const fileName = muralFileNames[muralId];
  if (!fileName) return null;

  return {
    thumb: `/images/optimized/thumb/${fileName}.webp`,
    medium: `/images/optimized/medium/${fileName}.webp`,
    large: `/images/optimized/large/${fileName}.webp`
  };
};