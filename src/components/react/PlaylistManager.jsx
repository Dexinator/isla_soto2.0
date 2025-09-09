import { useState, useEffect } from 'react';
import MuralImage from './MuralImageOptimized.jsx';
import contentEs from '../../data/content-es.json';
import contentEn from '../../data/content-en.json';

const PlaylistManager = ({ 
  murals, 
  currentMural, 
  onMuralSelect, 
  audioType = 'normal',
  language = 'es',
  completedMurals = new Set(),
  className = "",
  isPlaying = false,
  onPlayPause = null,
  onNext = null,
  onPrevious = null
}) => {
  const [inProgressMurals, setInProgressMurals] = useState(new Set());
  
  // Obtener el contenido según el idioma
  const content = language === 'es' ? contentEs : contentEn;

  // Ordenar murales por orden recomendado
  const sortedMurals = [...murals].sort((a, b) => a.order - b.order);

  // Obtener estado del mural
  const getMuralStatus = (mural) => {
    if (completedMurals.has(mural.id)) return 'completed';
    if (inProgressMurals.has(mural.id)) return 'inProgress';
    return 'notStarted';
  };

  // Obtener icono según estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'inProgress': return '▶️';
      default: return '▶️'; // Icono de play para las que faltan escuchar
    }
  };

  // Obtener color según estado
  const getStatusColor = (status, isActive) => {
    if (isActive) return 'bg-SM-yellow text-SM-black';
    
    switch (status) {
      case 'completed': return 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'inProgress': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      default: return 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100';
    }
  };

  // Formatear duración estimada
  const getEstimatedDuration = (audioType) => {
    switch (audioType) {
      case 'easy': return '5 min';
      case 'descriptive': return '10 min';
      case 'normal': return '7 min';
      default: return '7 min';
    }
  };

  // Manejar selección de mural
  const handleMuralClick = (mural) => {
    // Marcar como en progreso si no estaba completado
    if (!completedMurals.has(mural.id)) {
      setInProgressMurals(prev => new Set([...prev, mural.id]));
    }
    
    if (onMuralSelect) {
      onMuralSelect(mural);
    }

    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'playlist_track_select', {
        'mural_id': mural.id,
        'audio_type': audioType,
        'language': language,
        'position': mural.order
      });
    }
  };


  // Obtener progreso total
  const getTotalProgress = () => {
    const total = murals.length;
    const completed = completedMurals.size;
    return Math.round((completed / total) * 100);
  };

  // Obtener siguiente mural recomendado
  const getNextRecommended = () => {
    return sortedMurals.find(mural => !completedMurals.has(mural.id));
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header de la playlist */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              🏷️ {content.audioguidePages?.[audioType]?.title || 
                    content.audioguide_types?.[audioType]?.title || 
                    content.playlist?.header?.types?.[audioType] ||
                    content.audioguidePages?.normal?.title || 
                    content.audioguide_types?.normal?.title ||
                    content.playlist?.header?.types?.normal ||
                    'Audio Guide'}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {completedMurals.size} {content.playlist.header.counter} {murals.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {getTotalProgress()}{content.playlist.header.progress}
            </div>
          </div>
        </div>

        {/* Barra de progreso total */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full">
          <div 
            className="h-full bg-SM-blue rounded-full transition-all duration-500"
            style={{ width: `${getTotalProgress()}%` }}
          />
        </div>

        {/* Siguiente recomendado - más prominente */}
        {getNextRecommended() && !currentMural && (
          <div className="mt-4 p-4 bg-gradient-to-r from-SM-blue/10 to-SM-yellow/10 dark:from-SM-blue/20 dark:to-SM-yellow/20 rounded-lg border border-SM-blue/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-SM-blue flex items-center justify-center text-white font-bold animate-pulse">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-SM-blue">
                    {content.playlist.item.startHere}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {getNextRecommended().title[audioType][language]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleMuralClick(getNextRecommended())}
                className="bg-SM-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                {content.playlist.item.start}
              </button>
            </div>
          </div>
        )}

        {/* Recuadro amarillo: Reproduciendo ahora */}
        {currentMural && (
          <div className="mt-4 p-4 bg-SM-yellow text-SM-black rounded-lg shadow-md">
            <div className="text-center">
              <p className="font-bold text-lg">
                {content.playlist.item.playingNow}
              </p>
              <p className="text-base mt-1 font-medium">
                {currentMural.title[audioType][language]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de murales */}
      <div className="max-h-96 overflow-y-auto">
        {sortedMurals.map((mural, index) => {
          const isActive = currentMural && currentMural.id === mural.id;
          const status = getMuralStatus(mural);
          const statusIcon = getStatusIcon(status);
          const statusColor = getStatusColor(status, isActive);

          return (
            <div
              key={mural.id}
              className={`border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all duration-200 ${
                isActive ? 'bg-SM-yellow/10 dark:bg-SM-yellow/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div
                onClick={() => handleMuralClick(mural)}
                className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-SM-blue focus:ring-inset cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMuralClick(mural);
                  }
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Imagen del mural con número superpuesto */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-SM-blue to-blue-700 flex items-center justify-center">
                      <MuralImage 
                        muralId={mural.id}
                        imagePath={mural.image}
                        alt={mural.alt?.[language] || mural.title[audioType][language]}
                        className="w-full h-full object-cover"
                        fallbackIcon="🎨"
                        fallbackIconSize="text-2xl"
                        showLoading={false}
                      />
                    </div>
                    {/* Número superpuesto en el centro de la imagen */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${statusColor} border-2 border-slate-200 dark:border-slate-600 shadow-lg ${status === 'completed' ? 'opacity-30' : ''}`}>
                      {mural.order}
                    </div>
                  </div>

                  {/* Información del mural */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium text-base truncate ${
                        isActive ? 'text-SM-blue' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {mural.title[audioType][language]}
                      </h4>
                    </div>
                    
                    {/* Solo tiempo de duración */}
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <svg fill="#000000" width="16px" height="16px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-7.59V4h2v5.59l3.95 3.95-1.41 1.41L9 10.41z"/></svg>
                        <span className="ml-1">{mural.duration?.[audioType] || getEstimatedDuration(audioType)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Icono de estado y controles */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {/* Mini controles solo para la pista activa */}
                    {isActive && onPlayPause && (
                      <div className="flex items-center space-x-1">
                        {/* Botón anterior */}
                        {onPrevious && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrevious();
                            }}
                            className="p-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                            aria-label="Pista anterior"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
                            </svg>
                          </button>
                        )}
                        
                        {/* Botón play/pause */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayPause();
                          }}
                          className="p-2 bg-SM-blue hover:bg-blue-700 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-SM-blue"
                          aria-label={isPlaying ? "Pausar" : "Reproducir"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isPlaying ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M10 9v6m4-6v6"/>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 18V6l8 6-8 6Z"/>
                            )}
                          </svg>
                        </button>
                        
                        {/* Botón siguiente */}
                        {onNext && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNext();
                            }}
                            className="p-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                            aria-label="Pista siguiente"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Icono de estado */}
                    <span className="text-2xl">
                      {status === 'completed' ? '✅' : '▶️'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con tiempo total */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <span className="text-slate-600 dark:text-slate-400 text-sm">
            {content.playlist.footer.totalTime}{(() => {
              switch(audioType) {
                case 'normal': return language === 'en' ? '39:23' : '40:25';
                case 'easy': return '34:22';
                case 'descriptive': return '50:22';
                case 'sign': return '40:28';
                default: return '40:25';
              }
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;
