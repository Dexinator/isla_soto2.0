import { useState, useEffect, useRef } from 'react';
import contentEs from '../../data/content-es.json';
import contentEn from '../../data/content-en.json';
import MuralImage from './MuralImageOptimized.jsx';

const YouTubePlayer = ({
  currentMural,
  onNext,
  onPrevious,
  onVideoEnd,
  isPlaying,
  setIsPlaying,
  language = 'es',
  className = ''
}) => {
  const content = language === 'es' ? contentEs : contentEn;
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Detectar cambios en pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Extraer ID de video de YouTube de la URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Patrones comunes de URLs de YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID directo
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // No se pudo extraer ID
    return null;
  };

  // Cargar YouTube IFrame API
  useEffect(() => {
    // Si ya existe YT, marcar como listo
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        delete window.onYouTubeIframeAPIReady;
      }
    };
  }, []);

  // Crear/actualizar player cuando cambia el mural o API está lista
  useEffect(() => {
    if (!currentMural || !apiReady) return;

    const videoUrl = currentMural.video?.sign;
    const videoId = getYouTubeVideoId(videoUrl);
    
    // Verificar que tenemos un ID válido
    
    if (!videoId) {
      setError(true);
      return;
    }

    setError(false);
    setIsReady(false);
    setCurrentTime(0);

    // Destruir player existente
    if (player) {
      player.destroy();
      setPlayer(null);
    }

    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      const elementId = `youtube-player-${currentMural.id}`;
      const element = document.getElementById(elementId);
      
      if (!element) {
        // Elemento no encontrado
        setError(true);
        return;
      }

      // Crear nuevo player
      
      try {
        const newPlayer = new window.YT.Player(elementId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          cc_lang_pref: 'es',
          cc_load_policy: 1, // Mostrar subtítulos por defecto
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            // Player listo
            setIsReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onVideoEnd();
            }
          },
          onError: (error) => {
            // Error en YouTube Player
            setError(true);
          }
        }
      });

        setPlayer(newPlayer);
      } catch (error) {
        // Error creando YouTube Player
        setError(true);
      }
    }, 100); // Delay de 100ms para asegurar que el DOM esté listo

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentMural, apiReady]);

  // Control de reproducción
  useEffect(() => {
    if (!player || !isReady) return;

    if (isPlaying) {
      player.playVideo();
      // Actualizar progreso cada 100ms
      progressIntervalRef.current = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentTime(time);
      }, 100);
    } else {
      player.pauseVideo();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, player, isReady]);

  // Control de volumen
  useEffect(() => {
    if (player && isReady) {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(volume);
      }
    }
  }, [volume, isMuted, player, isReady]);

  // Funciones de control
  const handleSeek = (e) => {
    if (!player || !isReady) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error al entrar en pantalla completa:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error al salir de pantalla completa:', err);
      });
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Si no hay mural, mostrar mensaje de bienvenida
  if (!currentMural) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-SM-black to-gray-700 rounded-full flex items-center justify-center">
            <span className="text-3xl">🤟</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {content.player.welcome.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {content.player.welcome.subtitle}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {content.player.welcome.hint}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Video container con aspect ratio 16:9 */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            {error ? (
              <div className="flex items-center justify-center h-full bg-slate-900">
                <div className="text-center p-6">
                  <p className="text-white mb-4">Error al cargar el video</p>
                  <a 
                    href={currentMural.video?.sign} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span>Ver en YouTube</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div id={`youtube-player-${currentMural?.id || 'default'}`} ref={playerRef} className="w-full h-full" />
                {/* Capa transparente para bloquear clics en el video */}
                <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />
              </>
            )}
          </div>
        </div>

        {/* Información del mural */}
        <div className="p-6 flex-grow">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {currentMural.title[language]}
            </h3>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center">
                <span className="mr-1">🎨</span> {currentMural.artist}
              </span>
              <span className="flex items-center">
                <span className="mr-1">📍</span> {currentMural.location[language]}
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div 
              className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer relative"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-SM-black to-gray-700 rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!isReady}
              className="p-4 bg-gradient-to-r from-SM-black to-gray-700 hover:from-gray-700 hover:to-SM-black text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 9v6m4-6v6"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                )}
              </svg>
            </button>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
              </svg>
            </button>
          </div>

          {/* Controles de volumen y pantalla completa */}
          <div className="flex items-center justify-between">
            {/* Control de volumen */}
            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                          clipRule="evenodd"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  )}
                </svg>
              </button>
              
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-24 h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Control de volumen"
              />
              
              <span className="text-sm text-slate-600 dark:text-slate-400 w-10 text-right">
                {isMuted ? '0' : volume}%
              </span>
            </div>

            {/* Botón pantalla completa */}
            <button
              onClick={toggleFullscreen}
              className={`p-3 rounded-lg transition-all ${
                isFullscreen 
                  ? 'bg-red-600 hover:bg-red-700 text-white fixed top-4 right-4 z-[110] shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;