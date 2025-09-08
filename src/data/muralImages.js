// Importar todas las imágenes de sites estáticamente
// Esto permite que Astro las optimice en build time

import mural1 from '../assets/images/sites/isla-soto-comenzamos-paseo-santa-marta-tormes.png';
import mural2 from '../assets/images/sites/isla-soto-origen-islas-rio-tormes.png';
import mural3 from '../assets/images/sites/isla-soto-flora-vegetacion-caracteristica.png';
import mural4 from '../assets/images/sites/isla-soto-fauna-animales-habitat.png';
import mural5 from '../assets/images/sites/isla-soto-avifauna-rio-bosque-ribera.png';
import mural6 from '../assets/images/sites/isla-soto-especies-introducidas-no-autoctonas.png';
import mural7 from '../assets/images/sites/isla-soto-centro-interpretacion-naturaleza.png';
import mural8 from '../assets/images/sites/isla-soto-zonas-usos-actividades.png';
import mural9 from '../assets/images/sites/isla-soto-rutas-senderos-santa-marta-tormes.png';
import mural10 from '../assets/images/sites/isla-soto-final-paseo-despedida.png';

// Mapa de imágenes por ID de mural
export const muralImages = {
  1: mural1,
  2: mural2,
  3: mural3,
  4: mural4,
  5: mural5,
  6: mural6,
  7: mural7,
  8: mural8,
  9: mural9,
  10: mural10
};

// Función helper para obtener la imagen optimizada por ID
export const getMuralImage = (muralId) => {
  const image = muralImages[muralId];
  if (!image) return null;
  
  // Astro optimiza automáticamente y devuelve un objeto con src, width, height, etc.
  return typeof image === 'string' ? image : image.src || image;
};