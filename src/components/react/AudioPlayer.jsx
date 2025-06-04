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
  const progressIntervalRef = useRef(null);

  // Obtener URL del audio según tipo y idioma
  const getAudioUrl = (mural) => {
    if (!mural || !mural.audio) return null;
    
    if (audioType === 'normal') {
      return mural.audio.normal?.[language] || mural.audio.normal?.es;
    }
    
    return mural.audio[audioType];
  };

  // Formatear tiempo en mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simular reproductor de audio (ya que usamos embeds de Audio.com)
  useEffect(() => {
    if (currentMural) {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      setCurrentTime(0);
      
      // Simular carga del audio
      const loadTimeout = setTimeout(() => {
        setIsLoading(false);
        // Duración simulada basada en el tipo de audioguía
        const simulatedDuration = audioType === 'easy' ? 300 : audioType === 'descriptive' ? 600 : 450; // 5, 10, 7.5 min
        setDuration(simulatedDuration);
      }, 1000);

      return () => clearTimeout(loadTimeout);
    }
  }, [currentMural, audioType]);

  // Simular progreso del audio
  useEffect(() => {
    if (isPlaying && !isLoading) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newProgress = (newTime / duration) * 100;
          setProgress(newProgress);
          
          // Auto-avanzar al siguiente track cuando termine
          if (newTime >= duration) {
            setIsPlaying(false);
            setProgress(100);
            if (onTrackEnd) {
              onTrackEnd();
            }
            return duration;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isLoading, duration, onTrackEnd]);

  const handlePlayPause = () => {
    if (isLoading) return;
    
    if (error) {
      setError(null);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
      return;
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
    if (isLoading || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;
    
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
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

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
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

          {/* Información del track */}
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

      {/* Embed real de Audio.com (oculto, solo para analytics) */}
      {audioUrl && (
        <div className="hidden">
          <iframe 
            src={audioUrl}
            width="100%" 
            height="166" 
            frameBorder="no"
            allow="autoplay"
            title={`Audio: ${currentMural.title[language]}`}
          />
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="px-6 pb-4">
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
