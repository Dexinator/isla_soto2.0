import { useState, useEffect, useRef } from 'react';
import MuralImage from './MuralImage.jsx';

const SoundCloudPlayer = ({
  currentMural,
  onNext,
  onPrevious,
  onTrackEnd,
  audioType = 'normal',
  language = 'es',
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const iframeRef = useRef(null);
  const widgetRef = useRef(null);

  // Obtener URL del audio según tipo y idioma
  const getAudioUrl = (mural) => {
    if (!mural || !mural.audio) return null;

    let audioUrl;
    if (audioType === 'normal') {
      audioUrl = mural.audio.normal?.[language] || mural.audio.normal?.es;
    } else {
      audioUrl = mural.audio[audioType];
    }

    return audioUrl;
  };

  // Convertir URL de audio a formato de embed
  const getSoundCloudEmbedUrl = (url) => {
    if (!url) return null;

    // Si ya es una URL de embed, devolverla (pero aplicar nuestros parámetros)
    if (url.includes('w.soundcloud.com/player')) {
      // Extraer la URL del track de los parámetros
      const urlMatch = url.match(/url=([^&]+)/);
      if (urlMatch) {
        const trackUrl = decodeURIComponent(urlMatch[1]);
        // Crear embed con nuestros parámetros personalizados
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%230072c0&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
      }
      return url;
    }
//<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2107850961%3Fsecret_token%3Ds-aPi7bGa9jHU&color=%2378766c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/jorge-badillo-222916125" title="Jorge Badillo" target="_blank" style="color: #cccccc; text-decoration: none;">Jorge Badillo</a> · <a href="https://soundcloud.com/jorge-badillo-222916125/la-tierra-de-la-aventura/s-aPi7bGa9jHU" title="La Tierra de la Aventura" target="_blank" style="color: #cccccc; text-decoration: none;">La Tierra de la Aventura</a></div>
    // Si es una URL de la API de SoundCloud (api.soundcloud.com)
    if (url.includes('api.soundcloud.com/tracks/')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230072c0&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    }

    // Convertir URL pública de SoundCloud a embed
    if (url.includes('soundcloud.com/')) {
      const encodedUrl = encodeURIComponent(url);
      return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%230072c0&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    }

    return url;
  };

  // Formatear tiempo en mm:ss
  const formatTime = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return '0:00';
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cargar Audio Widget API
  useEffect(() => {
    const loadSoundCloudAPI = () => {
      return new Promise((resolve) => {
        if (window.SC && window.SC.Widget) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadSoundCloudAPI();
  }, []);

  // Inicializar widget cuando cambia el mural
  useEffect(() => {
    if (!currentMural) return;

    const audioUrl = getAudioUrl(currentMural);
    const embedUrl = getSoundCloudEmbedUrl(audioUrl);

    if (!embedUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setWidgetReady(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    // Actualizar el src del iframe
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }

    // Función para inicializar el widget
    const initializeWidget = () => {
      if (!window.SC || !window.SC.Widget || !iframeRef.current) {
        // Si no está listo, intentar de nuevo en un momento
        setTimeout(initializeWidget, 500);
        return;
      }

      try {
        // Asegurar que el iframe tenga dimensiones antes de inicializar el widget
        const iframe = iframeRef.current;
        if (iframe.offsetWidth === 0 || iframe.offsetHeight === 0) {
          console.warn('Audio iframe no tiene dimensiones adecuadas');
          setIsLoading(false);
          return;
        }

        widgetRef.current = window.SC.Widget(iframe);

        // Configurar event listeners
        widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
          setWidgetReady(true);
          setIsLoading(false);

          // Obtener duración
          widgetRef.current.getDuration((duration) => {
            setDuration(duration);
          });

          // Configurar volumen inicial
          widgetRef.current.setVolume(volume);
        });

        widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
          setIsPlaying(true);
        });

        widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
          setIsPlaying(false);
        });

        widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
          setIsPlaying(false);
          setProgress(100);
          if (onTrackEnd) {
            onTrackEnd();
          }
        });

        widgetRef.current.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
          setCurrentTime(data.currentPosition);
          setProgress(data.relativePosition * 100);
        });

        widgetRef.current.bind(window.SC.Widget.Events.ERROR, (error) => {
          console.error('Audio Widget Error:', error);
          setIsLoading(false);
        });

        // Timeout de seguridad para detectar si el widget no se inicializa
        setTimeout(() => {
          if (!widgetReady && !error) {
            console.warn('Audio Widget no se inicializó en tiempo esperado');
            setIsLoading(false);
          }
        }, 10000); // 10 segundos de timeout

      } catch (err) {
        console.error('Error initializing audio widget:', err);
        setIsLoading(false);
      }
    };

    // Esperar un poco para que el iframe se cargue y luego inicializar
    setTimeout(initializeWidget, 1500);

  }, [currentMural, audioType, language]);

  // Controles de reproducción
  const handlePlayPause = () => {
    if (!widgetRef.current || !widgetReady) return;

    try {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
      }

      // Analytics tracking
      if (typeof gtag !== 'undefined' && currentMural) {
        gtag('event', isPlaying ? 'audio_pause' : 'audio_play', {
          'mural_id': currentMural.id,
          'audio_type': audioType,
          'language': language,
          'progress': progress,
          'platform': 'soundcloud'
        });
      }
    } catch (err) {
      setError('Error al controlar la reproducción');
      console.error('Error controlling playback:', err);
    }
  };

  const handleSeek = (e) => {
    if (!widgetRef.current || !widgetReady || !duration) return;

    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      const newTime = (newProgress / 100) * duration;

      widgetRef.current.seekTo(newTime);
      setCurrentTime(newTime);
      setProgress(newProgress);
    } catch (err) {
      console.error('Error seeking:', err);
    }
  };

  const handleVolumeChange = (e) => {
    if (!widgetRef.current || !widgetReady) return;

    try {
      const newVolume = parseInt(e.target.value);
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      widgetRef.current.setVolume(newVolume);
    } catch (err) {
      console.error('Error changing volume:', err);
    }
  };

  const toggleMute = () => {
    if (!widgetRef.current || !widgetReady) return;

    try {
      if (isMuted) {
        widgetRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        widgetRef.current.setVolume(0);
        setIsMuted(true);
      }
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  };

  if (!currentMural) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-pulse">🎨</div>
          <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-slate-100">
            ¡Descubre los Murales!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Haz clic en "Comenzar Tour" para explorar el arte urbano de Santa Marta
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <span>👆</span>
            <span>Usa el botón azul de arriba</span>
          </div>
        </div>
      </div>
    );
  }

  const audioUrl = getAudioUrl(currentMural);
  const embedUrl = getSoundCloudEmbedUrl(audioUrl);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Audio iframe oculto para Widget API */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '300px', height: '166px' }}>
        <iframe
          ref={iframeRef}
          width="300"
          height="166"
          style={{ border: 'none', overflow: 'hidden' }}
          allow="autoplay"
          src={embedUrl}
          title={`Audio: ${currentMural.title[language]}`}
        />
      </div>

      {/* Imagen cuadrada arriba */}
      <div className="p-6 pb-4">
        <div className="relative">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br from-SM-blue to-blue-700 flex items-center justify-center">
            <MuralImage 
              imagePath={currentMural?.image}
              alt={currentMural?.alt?.[language] || currentMural?.title[language]}
              className="w-full h-full object-cover"
              fallbackIcon="🎨"
              fallbackIconSize="text-6xl"
            />
          </div>
          
        </div>
      </div>

      {/* Información del mural */}
      <div className="px-6 pb-4">
        {/* Nombre del mural */}
        <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-3 text-center">
          {currentMural.title[language]}
        </h3>
        
        {/* Artista y ubicación */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center text-slate-600 dark:text-slate-400">
            <span className="text-base mr-2">🎨</span>
            <span className="text-sm font-medium">{currentMural.artist || 'Artista desconocido'}</span>
          </div>
          <div className="flex items-center justify-center text-slate-600 dark:text-slate-400">
            <span className="text-base mr-2">📍</span>
            <span className="text-sm">{currentMural.location?.[language] || 'Ubicación no disponible'}</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso con tiempos */}
      <div className="px-6 pb-4">
        {/* Tiempo de reproducción */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div
          className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-SM-blue rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>


      {/* Controles principales */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center space-x-8 mb-6">
          {/* Botón anterior */}
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pista anterior"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
            </svg>
          </button>

          {/* Botón play/pause principal */}
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !widgetReady}
            className="p-4 bg-SM-blue hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-SM-blue focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isLoading || !widgetReady ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                {isPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 9v6m4-6v6"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 18V6l8 6-8 6Z"/>
                )}
              </svg>
            )}
          </button>

          {/* Botón siguiente */}
          <button
            onClick={onNext}
            disabled={!onNext}
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pista siguiente"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
            </svg>
          </button>
        </div>

        {/* Controles de volumen */}
        <div className="flex items-center justify-center space-x-4 bg-slate-50 dark:bg-slate-700 rounded-lg py-3 px-4">
          <button
            onClick={toggleMute}
            disabled={!widgetReady}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            <span className="text-lg">
              {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
            </span>
          </button>
          <div className="flex-1 max-w-32">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!widgetReady}
              className="w-full h-2 bg-slate-300 dark:bg-slate-500 rounded-lg appearance-none cursor-pointer disabled:opacity-50 slider"
            />
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium min-w-[3rem] text-center">
            {Math.round(isMuted ? 0 : volume)}%
          </span>
        </div>
      </div>



      {/* Estado de carga */}
      {isLoading && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-SM-blue border-t-transparent rounded-full"></div>
            <span className="text-sm">Cargando audio...</span>
          </div>
        </div>
      )}


    </div>
  );
};

export default SoundCloudPlayer;
