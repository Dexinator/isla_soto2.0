import { useState, useEffect } from 'react';
import MapComponent from './MapComponent.jsx';
import YouTubePlayer from './YouTubePlayer.jsx';
import PlaylistManager from './PlaylistManager.jsx';
import MuralImage from './MuralImageOptimized.jsx';

const SignoguideContainer = ({ 
  muralsData, 
  routeData, 
  audioType = 'sign', 
  language = 'es' 
}) => {
  const [currentMural, setCurrentMural] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // Ordenar murales por orden recomendado
  const sortedMurals = [...muralsData].sort((a, b) => a.order - b.order);

  // Inicializar automáticamente con el primer mural para experiencia intuitiva
  useEffect(() => {
    if (sortedMurals.length > 0 && !currentMural) {
      setCurrentMural(sortedMurals[0]);
    }
  }, [sortedMurals, currentMural]);

  // Función para seleccionar un mural
  const handleMuralSelect = (mural) => {
    setCurrentMural(mural);
    setIsPlaying(false); // Pausar el video actual al cambiar
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'mural_select', {
        'mural_id': mural.id,
        'audio_type': audioType,
        'language': language,
        'source': 'manual_selection'
      });
    }
  };

  // Función para ir al siguiente mural
  const handleNext = () => {
    if (currentMural && sortedMurals.length > 0) {
      const currentIndex = sortedMurals.findIndex(m => m.id === currentMural.id);
      const nextIndex = (currentIndex + 1) % sortedMurals.length;
      const nextMural = sortedMurals[nextIndex];
      
      setCurrentMural(nextMural);
      setIsPlaying(false);
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'mural_next', {
          'from_mural_id': currentMural.id,
          'to_mural_id': nextMural.id,
          'audio_type': audioType,
          'language': language
        });
      }
    }
  };

  // Función para ir al mural anterior
  const handlePrevious = () => {
    if (currentMural && sortedMurals.length > 0) {
      const currentIndex = sortedMurals.findIndex(m => m.id === currentMural.id);
      const prevIndex = currentIndex === 0 ? sortedMurals.length - 1 : currentIndex - 1;
      const prevMural = sortedMurals[prevIndex];
      
      setCurrentMural(prevMural);
      setIsPlaying(false);
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'mural_previous', {
          'from_mural_id': currentMural.id,
          'to_mural_id': prevMural.id,
          'audio_type': audioType,
          'language': language
        });
      }
    }
  };

  // Función para marcar como completado
  const [completedMurals, setCompletedMurals] = useState(new Set());
  
  const handleTrackComplete = (muralId) => {
    setCompletedMurals(prev => new Set([...prev, muralId]));
  };

  // Función cuando termina un video
  const handleVideoEnd = () => {
    setIsPlaying(false);
    
    // Marcar el mural actual como completado
    if (currentMural) {
      handleTrackComplete(currentMural.id);
    }
    
    // Auto-avanzar al siguiente mural si no es el último
    if (currentMural && sortedMurals.length > 0) {
      const currentIndex = sortedMurals.findIndex(m => m.id === currentMural.id);
      if (currentIndex < sortedMurals.length - 1) {
        setTimeout(() => {
          handleNext();
          // Si autoPlay está activo, reproducir automáticamente el siguiente
          if (autoPlay) {
            setTimeout(() => setIsPlaying(true), 500);
          }
        }, 2000); // Esperar 2 segundos antes de avanzar
      }
    }
    
    // Analytics tracking
    if (typeof gtag !== 'undefined' && currentMural) {
      gtag('event', 'video_complete', {
        'mural_id': currentMural.id,
        'audio_type': audioType,
        'language': language
      });
    }
  };

  // Función para iniciar el tour - más directa e intuitiva
  const startTour = () => {
    if (sortedMurals.length > 0) {
      // Si ya hay un mural seleccionado, simplemente iniciar reproducción
      if (currentMural) {
        setIsPlaying(true);
      } else {
        // Si no hay mural, seleccionar el primero
        setCurrentMural(sortedMurals[0]);
        setIsPlaying(true);
      }

      setAutoPlay(true);

      // Scroll suave al reproductor
      setTimeout(() => {
        const playerSection = document.querySelector('[aria-labelledby="player-title"]');
        if (playerSection) {
          playerSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);

      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'tour_start', {
          'audio_type': audioType,
          'language': language,
          'total_murals': sortedMurals.length,
          'mural_id': currentMural?.id || sortedMurals[0]?.id
        });
      }
    }
  };

  // Exponer función startTour globalmente para el botón de inicio
  useEffect(() => {
    window.startAudioguide = startTour;
    
    return () => {
      if (window.startAudioguide) {
        delete window.startAudioguide;
      }
    };
  }, [sortedMurals, currentMural]);

  return (
    <div className="space-y-8">
      {/* Mapa interactivo (tarjeta ancha superior) */}
      <section id="mapa" aria-labelledby="map-title">
        <h2 id="map-title" className="sr-only">Mapa interactivo de la ruta</h2>
        <MapComponent 
          murals={sortedMurals}
          route={routeData}
          currentMural={currentMural}
          onMuralSelect={handleMuralSelect}
          language={language}
          className="w-full"
        />
      </section>

      {/* Layout de dos columnas para reproductor y playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reproductor de video (columna izquierda) */}
        <section aria-labelledby="player-title">
          <h2 id="player-title" className="sr-only">Reproductor de video</h2>
          <YouTubePlayer
            currentMural={currentMural}
            onNext={sortedMurals.length > 1 ? handleNext : null}
            onPrevious={sortedMurals.length > 1 ? handlePrevious : null}
            onVideoEnd={handleVideoEnd}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            language={language}
            className="h-fit"
          />
        </section>

        {/* Playlist completa (columna derecha) */}
        <section aria-labelledby="playlist-title">
          <h2 id="playlist-title" className="sr-only">Lista de reproducción</h2>
          <PlaylistManager 
            murals={sortedMurals}
            currentMural={currentMural}
            onMuralSelect={handleMuralSelect}
            audioType={audioType}
            language={language}
            completedMurals={completedMurals}
            className="h-fit"
          />
        </section>
      </div>

      {/* Controles flotantes para móvil */}
      {currentMural && (
        <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-SM-black to-gray-700 flex items-center justify-center flex-shrink-0">
                  <MuralImage 
                    muralId={currentMural?.id}
                    imagePath={currentMural?.image}
                    alt={currentMural?.alt?.[language] || currentMural?.title[language]}
                    className="w-full h-full object-cover"
                    fallbackIcon="🤟"
                    fallbackIconSize="text-sm"
                    showLoading={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                    {currentMural.title[language]}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Mural {currentMural.order} de {sortedMurals.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handlePrevious}
                  disabled={!handlePrevious}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  aria-label="Anterior"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
                  </svg>
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-SM-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 9v6m4-6v6"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 18V6l8 6-8 6Z"/>
                    )}
                  </svg>
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!handleNext}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  aria-label="Siguiente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignoguideContainer;