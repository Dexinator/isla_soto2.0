import { useState, useEffect, useRef } from 'react';

const AudioPlayer = ({
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

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

  // Determinar si es una URL directa de MP3 o un embed
  const getDirectAudioUrl = (url) => {
    if (!url) return null;

    // Si ya es una URL directa de MP3, devolverla
    if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      return url;
    }

    // Si es una URL de Audio.com, intentar convertir a URL directa
    if (url.includes('audio.com/embed/audio/')) {
      // Extraer el ID del audio
      const match = url.match(/audio\.com\/embed\/audio\/(\d+)/);
      if (match) {
        const audioId = match[1];
        // Intentar URL directa (esto puede variar según Audio.com)
        return `https://audio.com/api/audio/${audioId}/stream`;
      }
    }

    // Si no podemos convertir, devolver la URL original para el embed
    return url;
  };

  // Formatear tiempo en mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cargar audio cuando cambia el mural
  useEffect(() => {
    if (currentMural) {
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);

      const audioUrl = getAudioUrl(currentMural);
      const directUrl = getDirectAudioUrl(audioUrl);

      if (audioRef.current) {
        audioRef.current.src = directUrl;
        audioRef.current.load();
      }

      setIsLoading(false);
    }
  }, [currentMural, audioType]);

  // Event listeners para el audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      if (onTrackEnd) {
        onTrackEnd();
      }
    };

    const handleError = () => {
      setError('Error al cargar el audio');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTrackEnd]);

  // Controles de reproducción
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError('Error al reproducir el audio');
        console.error('Error playing audio:', err);
      });
    }
    setIsPlaying(!isPlaying);

    // Analytics tracking
    if (typeof gtag !== 'undefined' && currentMural) {
      gtag('event', isPlaying ? 'audio_pause' : 'audio_play', {
        'mural_id': currentMural.id,
        'audio_type': audioType,
        'language': language,
        'progress': progress
      });
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newProgress);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
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
  const directAudioUrl = getDirectAudioUrl(audioUrl);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Header con información del mural */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Cover del mural */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-SM-blue to-blue-700 flex items-center justify-center">
              {currentMural.image ? (
                <img
                  src={currentMural.image}
                  alt={currentMural.alt?.[language] || currentMural.title[language]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl">🎨</span>
              )}
            </div>
          </div>

          {/* Información del mural */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">
              {currentMural.title[language]}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
              Audioguía {audioType === 'normal' ? 'Normativa' :
                        audioType === 'descriptive' ? 'Descriptiva' :
                        audioType === 'easy' ? 'Fácil' : 'Signoguía'}
            </p>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-2">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles de volumen */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              <span className="text-lg">
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="px-6 pb-4">
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
        <div className="flex items-center justify-center space-x-6">
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
            disabled={isLoading}
            className="p-4 bg-SM-blue hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-SM-blue focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                {isPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 9v6m4-6v6"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 0h10"/>
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
      </div>

      {/* Información del reproductor */}
      {audioUrl && (
        <div className="px-6 pb-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">🎵</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Audio cargado y listo
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {directAudioUrl?.endsWith('.mp3') ? 'Reproductor nativo' : 'Audio.com embed'}
              </div>
            </div>

            {/* Fallback: mostrar embed si no funciona la URL directa */}
            {error && (
              <div className="mt-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 text-center">
                  Fallback: Reproductor de Audio.com
                </p>
                <div style={{ height: '228px', width: '204px', margin: '0 auto' }}>
                  <iframe
                    id={`audio-iframe-${currentMural.id}`}
                    src={audioUrl}
                    style={{
                      display: 'block',
                      borderRadius: '1px',
                      border: 'none',
                      height: '204px',
                      width: '204px'
                    }}
                    allow="autoplay"
                    title={`Audio: ${currentMural.title[language]}`}
                  />
                  <a
                    href="https://audio.com/jorge-badillo"
                    style={{
                      textAlign: 'center',
                      display: 'block',
                      color: '#A4ABB6',
                      fontSize: '12px',
                      fontFamily: 'sans-serif',
                      lineHeight: '16px',
                      marginTop: '8px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @jorge-badillo
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-SM-blue border-t-transparent rounded-full"></div>
            <span className="text-sm">Cargando audio...</span>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="px-6 pb-6">
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg p-3 text-sm">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
