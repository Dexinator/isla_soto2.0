import { useState, useEffect, useRef } from 'react';
import contentEs from '../../data/content-es.json';
import contentEn from '../../data/content-en.json';
import MuralImage from './MuralImageOptimized.jsx';

const VimeoPlayer = ({
  currentMural,
  onNext,
  onPrevious,
  onVideoEnd,
  isPlaying,
  setIsPlaying,
  audioType = 'sign',
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFullscreenPrompt, setShowMobileFullscreenPrompt] = useState(false);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vimeoSDKReady, setVimeoSDKReady] = useState(false);
  
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Detectar cambios en pantalla completa y dispositivo móvil
  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Extraer ID de video de Vimeo de la URL (con soporte para hash de privacidad)
  const getVimeoVideoId = (url) => {
    if (!url) return null;
    
    // Si tiene formato ID?h=hash, devolver tal cual
    if (/^\d+\?h=[\w]+$/.test(url)) {
      return url;
    }
    
    // Si ya es un ID directo (número)
    if (/^\d+$/.test(url)) {
      return url;
    }
    
    // Patrones para URLs de Vimeo con hash al final
    // Formato: https://vimeo.com/1110101964/925233ecd4
    const hashPattern = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
    const hashMatch = url.match(hashPattern);
    if (hashMatch) {
      return `${hashMatch[1]}?h=${hashMatch[2]}`;
    }
    
    // Otros patrones comunes de URLs de Vimeo
    const patterns = [
      /vimeo\.com\/(\d+)(?:\?h=([\w]+))?/,
      /player\.vimeo\.com\/video\/(\d+)(?:\?h=([\w]+))?/,
      /vimeo\.com\/channels\/[\w]+\/(\d+)/,
      /vimeo\.com\/groups\/[\w]+\/videos\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // Si hay hash, incluirlo
        if (match[2]) {
          return `${match[1]}?h=${match[2]}`;
        }
        return match[1];
      }
    }
    
    return null;
  };

  // Cargar Vimeo Player SDK
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Verificar si ya está cargado
    if (window.Vimeo) {
      setVimeoSDKReady(true);
      return;
    }
    
    // Cargar el script de Vimeo Player si no está cargado
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    script.onload = () => {
      setVimeoSDKReady(true);
    };
    script.onerror = () => {
      console.error('Error loading Vimeo SDK');
      setError(true);
      setIsLoading(false);
    };
    document.body.appendChild(script);
  }, []);

  // Crear/actualizar player cuando cambia el mural o cuando el SDK está listo
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Si no hay mural actual, limpiar y salir
    if (!currentMural) {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
      return;
    }
    
    // Esperar a que Vimeo SDK esté cargado
    if (!vimeoSDKReady || !window.Vimeo) {
      return;
    }

    const videoUrl = currentMural.video?.sign || currentMural.video?.vimeo;
    const videoId = getVimeoVideoId(videoUrl);
    
    if (!videoId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setError(false);
    setIsReady(false);
    setIsLoading(true);
    setCurrentTime(0);

    // Destruir player existente
    if (player) {
      player.destroy();
      setPlayer(null);
    }

    // Crear contenedor para el player
    const container = playerRef.current;
    if (!container) return;

    // Limpiar el contenedor
    container.innerHTML = '';

    // Crear iframe de Vimeo
    const iframe = document.createElement('div');
    iframe.id = `vimeo-player-${currentMural.id}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);

    // Crear nuevo player con opciones personalizadas
    try {
      // Separar ID y hash si existe
      let vimeoId = videoId;
      let vimeoHash = null;
      
      if (videoId.includes('?h=')) {
        const parts = videoId.split('?h=');
        vimeoId = parts[0];
        vimeoHash = parts[1];
      }
      
      const options = {
        id: vimeoId,
        h: vimeoHash, // Incluir hash si existe
        width: '100%',
        height: '100%',
        responsive: true, // Hacer el player responsive
        autopause: false,
        autoplay: false,
        background: false,
        byline: false,
        color: '0072c0', // SM-blue
        controls: false, // Desactivar controles nativos
        dnt: true, // Do not track
        keyboard: false,
        loop: false,
        muted: false,
        pip: false, // Picture in picture
        playsinline: true,
        portrait: false,
        quality: 'auto',
        speed: false,
        title: false,
        transparent: false // Cambiado a false para mejor visualización
      };

      const newPlayer = new window.Vimeo.Player(iframe, options);

      // Configurar eventos
      newPlayer.on('loaded', () => {
        setIsLoading(false);
        setIsReady(true);
        
        // Obtener duración
        newPlayer.getDuration().then(d => {
          setDuration(d);
        });
        
        // Configurar volumen inicial
        newPlayer.setVolume(volume / 100);
      });

      newPlayer.on('play', () => {
        // Video comenzó a reproducirse
      });

      newPlayer.on('pause', () => {
        // Video pausado
      });

      newPlayer.on('ended', () => {
        setIsPlaying(false);
        if (onVideoEnd) {
          onVideoEnd();
        }
      });

      newPlayer.on('timeupdate', (data) => {
        setCurrentTime(data.seconds);
      });

      newPlayer.on('error', (error) => {
        console.error('Error en Vimeo Player:', error);
        setError(true);
        setIsLoading(false);
      });

      setPlayer(newPlayer);
    } catch (error) {
      console.error('Error creando Vimeo Player:', error);
      setError(true);
      setIsLoading(false);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentMural, vimeoSDKReady]);

  // Control de reproducción y sugerencia de pantalla completa en móvil
  useEffect(() => {
    if (!player || !isReady) return;

    if (isPlaying) {
      // En móvil, sugerir pantalla completa al empezar a reproducir
      if (isMobile && !isFullscreen && !showMobileFullscreenPrompt) {
        setShowMobileFullscreenPrompt(true);
        setTimeout(() => setShowMobileFullscreenPrompt(false), 5000); // Auto-ocultar después de 5 segundos
      }
      
      player.play().catch(error => {
        console.error('Error al reproducir:', error);
      });
    } else {
      player.pause().catch(error => {
        console.error('Error al pausar:', error);
      });
    }
  }, [isPlaying, player, isReady, isMobile, isFullscreen]);

  // Control de volumen
  useEffect(() => {
    if (player && isReady) {
      if (isMuted) {
        player.setVolume(0);
      } else {
        player.setVolume(volume / 100);
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
    
    player.setCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  const toggleFullscreen = async () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        
        // En dispositivos móviles, intentar forzar orientación landscape
        if ('orientation' in screen && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch (err) {
            // Silenciar - no todos los navegadores soportan esto
          }
        }
      } catch (err) {
        console.error('Error al entrar en pantalla completa:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        
        // Desbloquear la orientación
        if ('orientation' in screen && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch (err) {
            // Silenciar - no todos los navegadores soportan esto
          }
        }
      } catch (err) {
        console.error('Error al salir de pantalla completa:', err);
      }
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
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${className} ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : ''
      }`}
    >
      <div className={`flex ${isFullscreen ? 'h-full' : 'flex-col'}`}>
        {/* Video container optimizado para móvil */}
        <div className={`relative ${
          isFullscreen ? 'w-full h-full bg-black' : 'w-full bg-black'
        }`} style={{ 
          paddingBottom: isFullscreen ? '0' : '56.25%',
          height: isFullscreen ? '100%' : '0'
        }}>
          <div className={`${isFullscreen ? 'h-full w-full' : 'absolute inset-0 w-full h-full'} flex items-center justify-center`}>
            {error ? (
              <div className="flex items-center justify-center h-full bg-slate-900">
                <div className="text-center p-6">
                  <p className="text-white mb-4">Error al cargar el video</p>
                  {currentMural.video?.sign && (
                    <a 
                      href={`https://vimeo.com/${getVimeoVideoId(currentMural.video.sign)?.split('?')[0]}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Ver en Vimeo</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-SM-blue border-t-transparent mb-4"></div>
                      <p className="text-white">Cargando video...</p>
                    </div>
                  </div>
                )}
                <div ref={playerRef} className="vimeo-container w-full h-full relative" />
                
                {/* Botón de salida de pantalla completa (solo en fullscreen) */}
                {isFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110"
                    aria-label="Salir de pantalla completa"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                            d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
                
                {/* Botón flotante de pantalla completa para móvil (cuando NO está en fullscreen) */}
                {isMobile && !isFullscreen && isReady && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute bottom-4 right-4 z-20 bg-black bg-opacity-75 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg transition-all"
                    aria-label="Pantalla completa"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                    </svg>
                  </button>
                )}
                
                {/* Prompt para pantalla completa en móvil */}
                {showMobileFullscreenPrompt && isMobile && !isFullscreen && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 m-4 max-w-sm">
                      <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
                        Mejor experiencia en pantalla completa
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Gira tu dispositivo y toca el botón de pantalla completa para una mejor visualización
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setShowMobileFullscreenPrompt(false);
                            toggleFullscreen();
                          }}
                          className="flex-1 bg-SM-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Pantalla completa
                        </button>
                        <button
                          onClick={() => setShowMobileFullscreenPrompt(false)}
                          className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          Continuar así
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Información del mural y controles (ocultos en pantalla completa) */}
        {!isFullscreen && (
          <div className={`flex-grow p-6 transition-all duration-300`}>
          <div className={`text-center ${isFullscreen ? 'mb-4' : 'mb-6'}`}>
            <h3 className={`${isFullscreen ? 'text-xl text-white' : 'text-2xl text-slate-900 dark:text-slate-100'} font-bold mb-2`}>
              {currentMural.title[audioType][language]}
            </h3>
            <div className={`flex items-center justify-center space-x-4 text-sm ${isFullscreen ? 'text-gray-300' : 'text-slate-600 dark:text-slate-400'}`}>
              <span className="flex items-center">
                <span className="mr-1">🎨</span> {typeof currentMural.artist === 'object' 
                  ? (currentMural.artist[language] || currentMural.artist.es || 'Artista desconocido')
                  : (currentMural.artist || 'Artista desconocido')}
              </span>
              {currentMural.coordinates && currentMural.coordinates[0] !== 0 && (
                <span className="flex items-center">
                  <span className="mr-1">📍</span> {currentMural.location[language]}
                </span>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className={`${isFullscreen ? 'mb-4' : 'mb-6'}`}>
            <div className={`flex items-center justify-between text-sm ${isFullscreen ? 'text-gray-300' : 'text-slate-600 dark:text-slate-400'} mb-2`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div 
              className={`h-2 ${isFullscreen ? 'bg-gray-800' : 'bg-slate-200 dark:bg-slate-700'} rounded-full cursor-pointer relative`}
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-SM-blue to-blue-700 rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controles principales */}
          <div className={`flex items-center justify-center ${isFullscreen ? 'space-x-6 mb-4' : 'space-x-8 mb-6'}`}>
            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-label="Anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!isReady || isLoading}
              className="p-4 bg-gradient-to-r from-SM-blue to-blue-700 hover:from-blue-700 hover:to-SM-blue text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
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
            <div className={`flex items-center space-x-3 rounded-lg px-4 py-2 ${
              isFullscreen ? 'bg-gray-800' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`transition-colors ${
                  isFullscreen 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
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
                className={`w-24 h-1 rounded-lg appearance-none cursor-pointer slider ${
                  isFullscreen ? 'bg-gray-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label="Control de volumen"
              />
              
              <span className={`text-sm w-10 text-right ${
                isFullscreen ? 'text-gray-400' : 'text-slate-600 dark:text-slate-400'
              }`}>
                {isMuted ? '0' : volume}%
              </span>
            </div>

            {/* Botón pantalla completa */
              <button
                onClick={toggleFullscreen}
                className={`p-3 rounded-lg transition-all ${
                  isFullscreen 
                    ? 'bg-red-600 hover:bg-red-700 text-white fixed top-4 right-4 z-[110] shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                title="Pantalla completa"
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
          }</div>
          </div>
        )}
      </div>
      
      {/* Estilos CSS para el slider de volumen y Vimeo iframe */}
      <style dangerouslySetInnerHTML={{ __html: `
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #0072c0, #0099ff);
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #0072c0, #0099ff);
          cursor: pointer;
          border: none;
        }
        
        /* Asegurar que el iframe de Vimeo ocupe todo el espacio */
        .vimeo-container {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
        }
        
        .vimeo-container iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .vimeo-container > div {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}} />
    </div>
  );
};

export default VimeoPlayer;