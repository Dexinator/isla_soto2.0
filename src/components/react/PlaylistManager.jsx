import { useState, useEffect } from 'react';

const PlaylistManager = ({ 
  murals, 
  currentMural, 
  onMuralSelect, 
  audioType = 'normal',
  language = 'es',
  className = "" 
}) => {
  const [completedMurals, setCompletedMurals] = useState(new Set());
  const [inProgressMurals, setInProgressMurals] = useState(new Set());

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
      default: return '⭕';
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

  // Marcar mural como completado cuando termine
  const markAsCompleted = (muralId) => {
    setCompletedMurals(prev => new Set([...prev, muralId]));
    setInProgressMurals(prev => {
      const newSet = new Set(prev);
      newSet.delete(muralId);
      return newSet;
    });
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
              🎵 Murales del Tour
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {murals.length} murales • {audioType === 'normal' ? 'Normativa' :
                        audioType === 'descriptive' ? 'Descriptiva' :
                        audioType === 'easy' ? 'Fácil' : 'Signoguía'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {completedMurals.size} de {murals.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {getTotalProgress()}% completado
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
                    🎯 Comenzar aquí
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {getNextRecommended().title[language]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleMuralClick(getNextRecommended())}
                className="bg-SM-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                ▶️ Empezar
              </button>
            </div>
          </div>
        )}

        {/* Progreso actual */}
        {currentMural && (
          <div className="mt-4 p-3 bg-SM-yellow/10 dark:bg-SM-yellow/20 rounded-lg border border-SM-yellow/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-SM-yellow">
                  🎧 Reproduciendo ahora
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {currentMural.title[language]}
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mural {currentMural.order} de {murals.length}
              </div>
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
              <button
                onClick={() => handleMuralClick(mural)}
                className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-SM-blue focus:ring-inset"
              >
                <div className="flex items-center space-x-4">
                  {/* Número de orden */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${statusColor} border border-slate-200 dark:border-slate-600`}>
                      {isActive ? '▶️' : mural.order}
                    </div>
                  </div>

                  {/* Imagen del mural */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-SM-blue to-blue-700 flex items-center justify-center">
                      {mural.image ? (
                        <img 
                          src={mural.image} 
                          alt={mural.alt?.[language] || mural.title[language]}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg">🎨</span>
                      )}
                    </div>
                  </div>

                  {/* Información del mural */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium truncate ${
                        isActive ? 'text-SM-blue' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {mural.title[language]}
                      </h4>
                      <span className="text-lg">{statusIcon}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {mural.description[language]}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {getEstimatedDuration(audioType)}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        Mural {mural.order}
                      </span>
                    </div>
                  </div>

                  {/* Indicador de reproducción */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-SM-blue rounded-full animate-pulse"></div>
                        <div className="w-1 h-4 bg-SM-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-4 bg-SM-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 dark:text-slate-400">
              📊 Progreso: {completedMurals.size}/{murals.length}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              ⏱️ Tiempo total: ~{murals.length * (audioType === 'easy' ? 5 : audioType === 'descriptive' ? 10 : 7)} min
            </span>
          </div>
          {completedMurals.size === murals.length && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              🎉 ¡Completado!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;
