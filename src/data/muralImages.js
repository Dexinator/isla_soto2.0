// Importar todas las imágenes de murales estáticamente
// Esto permite que Astro las optimice en build time

import mural1 from '../assets/images/murals/1- Empieza La Ruta de los Murales. Audioguía. Santa Marta de Tormes.png';
import mural2 from '../assets/images/murals/2- Mural Paseo Fluvial. Audioguía. Santa Marta de Tormes.png';
import mural3 from '../assets/images/murals/3- Mural Centro de Interpretación. Isla del Soto. Audioguía. Santa Marta de Tormes.png';
import mural4 from '../assets/images/murals/4- Mural La Llegada del Color. Audioguía. Santa Marta de Tormes.png';
import mural5 from '../assets/images/murals/5- Mural La Bosque. Audioguía. Santa Marta de Tormes.png';
import mural6 from '../assets/images/murals/6- Mural Mujer, historia y pueblo. Audioguía. Santa Marta de Tormes.jpg';
import mural7 from '../assets/images/murals/7- Mural Doctor Torres Villarroel. Audioguía. Santa Marta de Tormes.jpg';
import mural8 from '../assets/images/murals/8- Mural El Rincón de Sandra y Gustavo. Audioguía. Santa Marta de Tormes.png';
import mural9 from '../assets/images/murals/9- Murales Festival de Arte Urbano. Ediciones 1 y 2. Audioguía. Santa Marta de Tormes.jpg';
import mural10 from '../assets/images/murals/10- Mural Generación Millennial. Audioguía. Santa Marta de Tormes.png';
import mural11 from '../assets/images/murals/11- Mural Paseo Alcalde José Sánchez. Audioguía. Santa Marta de Tormes.jpg';
import mural12 from '../assets/images/murals/12- Mural Respira. Audioguía. Santa Marta de Tormes.jpg';
import mural13 from '../assets/images/murals/13- Mural La Llegada de las Llaves. Audioguía. Santa Marta de Tormes.png';
import mural14 from '../assets/images/murals/14- Mural Sueña. Audioguía. Santa Marta de Tormes.jpg';
import mural15 from '../assets/images/murals/15- Mural Océano. Audioguía. Santa Marta de Tormes.jpg';
import mural16 from '../assets/images/murals/16- Mural Carretera Madrid. Audioguía. Santa Marta de Tormes.jpg';
import mural17 from '../assets/images/murals/17- Daniel Martín. Artista. Audioguía. Santa Marta de Tormes.jpg';
import mural18 from '../assets/images/murals/18- Caín Ferreras. Artista. Audioguía. Santa Marta de Tormes.jpg';
import mural19 from '../assets/images/murals/19- Rober Bece. Artista. Audioguía. Santa Marta de Tormes.jpg';
import mural20 from '../assets/images/murals/20- Llegamos al Final. Audioguía. Santa Marta de Tormes.png';

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
  10: mural10,
  11: mural11,
  12: mural12,
  13: mural13,
  14: mural14,
  15: mural15,
  16: mural16,
  17: mural17,
  18: mural18,
  19: mural19,
  20: mural20
};

// Función helper para obtener la imagen optimizada por ID
export const getMuralImage = (muralId) => {
  const image = muralImages[muralId];
  if (!image) return null;
  
  // Astro optimiza automáticamente y devuelve un objeto con src, width, height, etc.
  return typeof image === 'string' ? image : image.src || image;
};