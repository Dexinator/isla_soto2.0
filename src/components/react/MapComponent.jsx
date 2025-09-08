import { useEffect, useRef, useState } from 'react';
import contentEs from '../../data/content-es.json';
import contentEn from '../../data/content-en.json';

const MapComponent = ({ murals, route, currentMural, onMuralSelect, audioType = 'normal', language = 'es', className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollZoomEnabled, setScrollZoomEnabled] = useState(false);

  // Seleccionar el contenido según el idioma
  const content = language === 'en' ? contentEn : contentEs;

  // Filtrar murales que tienen coordenadas válidas
  const muralsWithCoordinates = murals.filter(mural => {
    if (!mural.coordinates || !Array.isArray(mural.coordinates)) return false;
    if (mural.coordinates.length === 0) return false;
    
    // Verificar el tipo de estructura de coordenadas
    const firstItem = mural.coordinates[0];
    
    // Si es un objeto con nombre y puntos (nueva estructura)
    if (firstItem && typeof firstItem === 'object' && 'points' in firstItem) {
      return mural.coordinates.some(loc => 
        loc.points && loc.points.length > 0
      );
    }
    
    // Si es array de arrays (múltiples coordenadas)
    if (Array.isArray(firstItem)) {
      return mural.coordinates.some(coord => 
        coord[0] !== 0 || coord[1] !== 0
      );
    }
    
    // Si es array simple (coordenada única legacy)
    return !(mural.coordinates[0] === 0 && mural.coordinates[1] === 0);
  });

  // Configuración del mapa
  const mapConfig = {
    center: [40.9505, -5.6300], // Centro aproximado de Santa Marta de Tormes
    zoom: 15,
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  };

  // Función para alternar el scroll zoom y paneo del mapa
  const toggleScrollZoom = () => {
    if (mapInstanceRef.current) {
      if (scrollZoomEnabled) {
        // Deshabilitar scroll zoom y paneo/arrastre
        mapInstanceRef.current.scrollWheelZoom.disable();
        mapInstanceRef.current.dragging.disable();
        mapInstanceRef.current.touchZoom.disable();
      } else {
        // Habilitar scroll zoom y paneo/arrastre
        mapInstanceRef.current.scrollWheelZoom.enable();
        mapInstanceRef.current.dragging.enable();
        mapInstanceRef.current.touchZoom.enable();
      }
      setScrollZoomEnabled(!scrollZoomEnabled);
    }
  };

  useEffect(() => {
    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      try {
        // Importar Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Importar Leaflet JS
        const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
        
        if (mapRef.current && !mapInstanceRef.current) {
          // Crear el mapa con scroll deshabilitado y controles simplificados
          const map = L.map(mapRef.current, {
            scrollWheelZoom: false, // Deshabilitar zoom con scroll
            dragging: false,        // Deshabilitar paneo/arrastre por defecto
            touchZoom: false,       // Deshabilitar zoom con touch en móvil
            doubleClickZoom: true,  // Mantener zoom con doble click
            boxZoom: false,         // Deshabilitar zoom con selección de área
            keyboard: false,        // Deshabilitar controles de teclado
            zoomControl: false,     // Ocultar controles de zoom para simplificar
            attributionControl: false // Ocultar atribución para simplificar
          }).setView(mapConfig.center, mapConfig.zoom);
          
          // Añadir capa de tiles con estilo simplificado y colores reducidos
          L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '© CartoDB, © OpenStreetMap',
            maxZoom: mapConfig.maxZoom,
            className: 'map-tiles-muted' // Clase para aplicar filtros CSS
          }).addTo(map);

          // Crear iconos personalizados más grandes y prominentes
          const createCustomIcon = (isActive = false, muralTitle = '') => {
            return L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white text-lg font-bold ${
                  isActive 
                    ? 'bg-SM-yellow animate-pulse shadow-yellow-400/50' 
                    : 'bg-SM-blue hover:bg-blue-700 shadow-blue-500/50'
                } transition-all duration-300 transform hover:scale-110"
                role="button"
                aria-label="${language === 'es' ? 'Ubicación ' : 'Location '}${muralTitle}. ${language === 'es' ? 'Haz clic para ver opciones' : 'Click to see options'}">
                  <span aria-hidden="true">🎨</span>
                </div>
              `,
              iconSize: [48, 48],
              iconAnchor: [24, 24],
              popupAnchor: [0, -24]
            });
          };

          // Añadir markers solo para murales con coordenadas válidas
          markersRef.current = muralsWithCoordinates.flatMap((mural, index) => {
            const isActive = currentMural && currentMural.id === mural.id;
            const muralTitle = mural.title[audioType][language];
            
            // Determinar el tipo de estructura de coordenadas
            const firstItem = mural.coordinates[0];
            let markersList = [];
            
            // Si es estructura con nombres de ubicación
            if (firstItem && typeof firstItem === 'object' && 'points' in firstItem) {
              mural.coordinates.forEach(location => {
                const locationName = location.name[language] || location.name.es;
                location.points.forEach((coords, pointIndex) => {
                  const marker = L.marker(coords, {
                    icon: createCustomIcon(isActive, muralTitle),
                    alt: `${muralTitle} - ${locationName}`
                  }).addTo(map);

                  const popupContent = `
                    <div class="p-2 min-w-48">
                      <h3 class="font-semibold text-SM-blue mb-1">${mural.title[audioType][language]}</h3>
                      <p class="text-sm font-medium text-slate-700 mb-2">${locationName}</p>
                      ${location.points.length > 1 ? `<p class="text-xs text-slate-500 mb-1">Punto ${pointIndex + 1} de ${location.points.length}</p>` : ''}
                      <p class="text-sm text-slate-600 mb-3">${mural.description[language]}</p>
                      <div class="flex flex-col space-y-2">
                        <button 
                          onclick="window.selectMural(${mural.id})" 
                          class="bg-SM-blue text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          ${content.map.listenAudioguide}
                        </button>
                        <a 
                          href="https://maps.google.com/maps?daddr=${coords[0]},${coords[1]}" 
                          target="_blank"
                          class="bg-SM-yellow text-SM-black px-3 py-1 rounded text-sm text-center hover:bg-yellow-500 transition-colors"
                        >
                          ${content.map.getDirections}
                        </a>
                      </div>
                    </div>
                  `;

                  marker.bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-popup'
                  });

                  markersList.push({ marker, mural });
                });
              });
            } 
            // Si es array de arrays (múltiples coordenadas sin nombre)
            else if (Array.isArray(firstItem)) {
              mural.coordinates.forEach((coords, coordIndex) => {
                const marker = L.marker(coords, {
                  icon: createCustomIcon(isActive, muralTitle),
                  alt: muralTitle
                }).addTo(map);

                const popupContent = `
                  <div class="p-2 min-w-48">
                    <h3 class="font-semibold text-SM-blue mb-2">${mural.title[audioType][language]}</h3>
                    ${mural.coordinates.length > 1 ? `<p class="text-xs text-slate-500 mb-1">Punto ${coordIndex + 1} de ${mural.coordinates.length}</p>` : ''}
                    <p class="text-sm text-slate-600 mb-3">${mural.description[language]}</p>
                    <div class="flex flex-col space-y-2">
                      <button 
                        onclick="window.selectMural(${mural.id})" 
                        class="bg-SM-blue text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        ${content.map.listenAudioguide}
                      </button>
                      <a 
                        href="https://maps.google.com/maps?daddr=${coords[0]},${coords[1]}" 
                        target="_blank"
                        class="bg-SM-yellow text-SM-black px-3 py-1 rounded text-sm text-center hover:bg-yellow-500 transition-colors"
                      >
                        ${content.map.getDirections}
                      </a>
                    </div>
                  </div>
                `;

                marker.bindPopup(popupContent, {
                  maxWidth: 250,
                  className: 'custom-popup'
                });

                markersList.push({ marker, mural });
              });
            }
            // Si es coordenada simple (legacy)
            else {
              const coords = mural.coordinates;
              const marker = L.marker(coords, {
                icon: createCustomIcon(isActive, muralTitle),
                alt: muralTitle
              }).addTo(map);

              const popupContent = `
                <div class="p-2 min-w-48">
                  <h3 class="font-semibold text-SM-blue mb-2">${mural.title[audioType][language]}</h3>
                  <p class="text-sm text-slate-600 mb-3">${mural.description[language]}</p>
                  <div class="flex flex-col space-y-2">
                    <button 
                      onclick="window.selectMural(${mural.id})" 
                      class="bg-SM-blue text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      ${content.map.listenAudioguide}
                    </button>
                    <a 
                      href="https://maps.google.com/maps?daddr=${coords[0]},${coords[1]}" 
                      target="_blank"
                      class="bg-SM-yellow text-SM-black px-3 py-1 rounded text-sm text-center hover:bg-yellow-500 transition-colors"
                    >
                      ${content.map.getDirections}
                    </a>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent, {
                maxWidth: 250,
                className: 'custom-popup'
              });

              markersList.push({ marker, mural });
            }
            
            return markersList;
          });

          // Añadir ruta si está disponible (filtrando waypoints [0,0])
          if (route && route.waypoints && route.waypoints.length > 0) {
            const validWaypoints = route.waypoints.filter(
              waypoint => !(waypoint[0] === 0 && waypoint[1] === 0)
            );
            if (validWaypoints.length > 1) {
              L.polyline(validWaypoints, {
                color: '#0072c0', // SM-blue
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
              }).addTo(map);
            }
          }

          // Ajustar vista para mostrar todos los murales con coordenadas
          if (muralsWithCoordinates.length > 0) {
            const group = new L.featureGroup(markersRef.current.map(m => m.marker));
            map.fitBounds(group.getBounds().pad(0.1));
          }

          mapInstanceRef.current = map;
          setIsLoading(false);

          // Función global para seleccionar mural desde popup
          window.selectMural = (muralId) => {
            const mural = murals.find(m => m.id === muralId);
            if (mural && onMuralSelect) {
              onMuralSelect(mural);
            }
          };
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError(content.map.error);
        setIsLoading(false);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (window.selectMural) {
        delete window.selectMural;
      }
    };
  }, [murals, route, language, content]);

  // Actualizar markers cuando cambia el mural actual
  useEffect(() => {
    if (markersRef.current && mapInstanceRef.current) {
      const L = window.L;
      if (L) {
        markersRef.current.forEach(({ marker, mural }) => {
          const isActive = currentMural && currentMural.id === mural.id;
          const muralTitle = mural.title[audioType][language];
          const newIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white text-lg font-bold ${
                isActive 
                  ? 'bg-SM-yellow animate-pulse shadow-yellow-400/50' 
                  : 'bg-SM-blue hover:bg-blue-700 shadow-blue-500/50'
              } transition-all duration-300 transform hover:scale-110"
              role="button"
              aria-label="${language === 'es' ? 'Mural: ' : 'Mural: '}${muralTitle}. ${language === 'es' ? 'Haz clic para ver opciones' : 'Click to see options'}">
                <span aria-hidden="true">🎨</span>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
          });
          marker.setIcon(newIcon);
        });
      }
    }
  }, [currentMural]);

  if (error) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h3 className="font-semibold text-lg mb-2">{content.map.error}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-SM-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {content.map.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // Añadir estilos CSS dinámicamente
  useEffect(() => {
    const styleId = 'map-component-styles';
    
    // Verificar si ya existen los estilos
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .map-container .leaflet-container {
          position: relative !important;
          z-index: 1 !important;
        }
        .map-container .leaflet-control-container {
          display: none !important;
        }
        .map-container .leaflet-tile {
          filter: grayscale(0.3) contrast(0.8) brightness(1.1) !important;
        }
        .map-tiles-muted {
          opacity: 0.7 !important;
        }
        .custom-marker {
          z-index: 10 !important;
        }
        .custom-marker div {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }
        .map-container .leaflet-pane {
          z-index: auto !important;
        }
        .map-container .leaflet-map-pane {
          z-index: 1 !important;
        }
        .map-container .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .map-container .leaflet-overlay-pane {
          z-index: 2 !important;
        }
        .map-container .leaflet-marker-pane {
          z-index: 3 !important;
        }
        .map-container .leaflet-tooltip-pane {
          z-index: 4 !important;
        }
        .map-container .leaflet-popup-pane {
          z-index: 5 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
      
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`} style={{ position: 'relative', zIndex: 1 }}>
      {/* Header del mapa */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              {content.map.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'en' ? "Total Route: " : "Recorrido Total: "} {route?.[audioType]?.totalDistance} • {language === 'en' ? "Total Duration: " : "Duración total: "} {route?.[audioType]?.estimatedTime}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleScrollZoom}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrollZoomEnabled
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  : 'bg-SM-blue text-white hover:bg-blue-700'
              }`}
              title={scrollZoomEnabled ? content.map.mapUnlockedTitle : content.map.mapLockedTitle}
            >
              {scrollZoomEnabled ? content.map.lockMap : content.map.unlockMap}
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-SM-blue border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{content.map.loading}</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="h-64 md:h-80 w-full map-container"
          style={{ 
            minHeight: '256px',
            position: 'relative',
            zIndex: 1
          }}
          role="application"
          aria-label={language === 'es' ? `Mapa interactivo con ${muralsWithCoordinates.length} murales. Usa el botón de desbloquear para interactuar con el mapa` : `Interactive map with ${muralsWithCoordinates.length} murals. Use the unlock button to interact with the map`}
        />
        {/* Botón central de desbloquear mapa */}
        {!scrollZoomEnabled && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <button
              onClick={toggleScrollZoom}
              className="pointer-events-auto bg-white dark:bg-slate-800 border-2 border-SM-blue px-6 py-3 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span className="text-2xl" aria-hidden="true">🔓</span>
              <span className="font-semibold text-SM-blue dark:text-SM-yellow">
                {content.map.unlockMap.replace('🔓 ', '')}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50" role="region" aria-label={language === 'es' ? 'Leyenda del mapa' : 'Map legend'}>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-SM-blue rounded-full mr-2 flex-shrink-0" aria-hidden="true"></div>
              <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{content.map.legend.currentMural}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-SM-yellow rounded-full mr-2 flex-shrink-0" aria-hidden="true"></div>
              <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{content.map.legend.playing}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-SM-blue mr-2 flex-shrink-0" aria-hidden="true"></div>
              <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{content.map.legend.recommendedRoute}</span>
            </div>
          </div>
          {!scrollZoomEnabled && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center" role="status" aria-live="polite">
              <span>{content.map.scrollLockMessage}</span>
            </div>
          )}
        </div>
      </div>
      </div>
  );
};

export default MapComponent;
