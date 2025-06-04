import { useEffect, useRef, useState } from 'react';

const MapComponent = ({ murals, route, currentMural, onMuralSelect, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuración del mapa
  const mapConfig = {
    center: [40.9705, -5.6640], // Santa Marta de Tormes
    zoom: 16,
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
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
          // Crear el mapa
          const map = L.map(mapRef.current).setView(mapConfig.center, mapConfig.zoom);
          
          // Añadir capa de tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: mapConfig.attribution,
            maxZoom: mapConfig.maxZoom
          }).addTo(map);

          // Crear iconos personalizados
          const createCustomIcon = (isActive = false) => {
            return L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold ${
                  isActive 
                    ? 'bg-SM-yellow animate-pulse' 
                    : 'bg-SM-blue hover:bg-blue-700'
                } transition-colors">
                  🎨
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16]
            });
          };

          // Añadir markers para cada mural
          markersRef.current = murals.map((mural, index) => {
            const isActive = currentMural && currentMural.id === mural.id;
            const marker = L.marker(mural.coordinates, {
              icon: createCustomIcon(isActive)
            }).addTo(map);

            // Popup con información del mural
            const popupContent = `
              <div class="p-2 min-w-48">
                <h3 class="font-semibold text-SM-blue mb-2">${mural.title.es}</h3>
                <p class="text-sm text-slate-600 mb-3">${mural.description.es}</p>
                <div class="flex flex-col space-y-2">
                  <button 
                    onclick="window.selectMural(${mural.id})" 
                    class="bg-SM-blue text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    🎧 Escuchar audioguía
                  </button>
                  <a 
                    href="https://maps.google.com/maps?daddr=${mural.coordinates[0]},${mural.coordinates[1]}" 
                    target="_blank"
                    class="bg-SM-yellow text-SM-black px-3 py-1 rounded text-sm text-center hover:bg-yellow-500 transition-colors"
                  >
                    🗺️ Cómo llegar
                  </a>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent, {
              maxWidth: 250,
              className: 'custom-popup'
            });

            // Event listener para seleccionar mural
            marker.on('click', () => {
              if (onMuralSelect) {
                onMuralSelect(mural);
              }
            });

            return { marker, mural };
          });

          // Añadir ruta si está disponible
          if (route && route.waypoints && route.waypoints.length > 0) {
            L.polyline(route.waypoints, {
              color: '#0072c0', // SM-blue
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5'
            }).addTo(map);
          }

          // Ajustar vista para mostrar todos los murales
          if (murals.length > 0) {
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
        setError('Error al cargar el mapa');
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
  }, [murals, route]);

  // Actualizar markers cuando cambia el mural actual
  useEffect(() => {
    if (markersRef.current && mapInstanceRef.current) {
      const L = window.L;
      if (L) {
        markersRef.current.forEach(({ marker, mural }) => {
          const isActive = currentMural && currentMural.id === mural.id;
          const newIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold ${
                isActive 
                  ? 'bg-SM-yellow animate-pulse' 
                  : 'bg-SM-blue hover:bg-blue-700'
              } transition-colors">
                🎨
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
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
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="font-semibold text-lg mb-2">Error al cargar el mapa</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-SM-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header del mapa */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              🗺️ Mapa de la Ruta
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {route?.totalDistance} • {route?.estimatedTime}
            </p>
          </div>
          <a
            href={`https://maps.google.com/maps?daddr=${murals[0]?.coordinates[0]},${murals[0]?.coordinates[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-SM-yellow text-SM-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
          >
            Abrir en Google Maps
          </a>
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-SM-blue border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cargando mapa...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="h-64 md:h-80 w-full"
          style={{ minHeight: '256px' }}
        />
      </div>

      {/* Leyenda */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-SM-blue rounded-full mr-2"></div>
              <span className="text-slate-600 dark:text-slate-400">Mural</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-SM-yellow rounded-full mr-2"></div>
              <span className="text-slate-600 dark:text-slate-400">Reproduciendo</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-SM-blue mr-2"></div>
              <span className="text-slate-600 dark:text-slate-400">Ruta recomendada</span>
            </div>
          </div>
          <span className="text-slate-500 dark:text-slate-400">
            {murals.length} murales
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
