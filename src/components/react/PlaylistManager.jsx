import { useState, useEffect } from 'react';
import MuralImage from './MuralImageOptimized.jsx';

const PlaylistManager = ({ 
  murals, 
  currentMural, 
  onMuralSelect, 
  audioType = 'normal',
  language = 'es',
  completedMurals = new Set(),
  className = "" 
}) => {
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
              🏷️ {audioType === 'normal' ? 'Audioguía Normativa' :
                    audioType === 'descriptive' ? 'Audioguía Descriptiva' :
                    audioType === 'easy' ? 'Audioguía Fácil' : 'Signoguía'}
            </h3>
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

        {/* Recuadro amarillo: Reproduciendo ahora */}
        {currentMural && (
          <div className="mt-4 p-4 bg-SM-yellow text-SM-black rounded-lg shadow-md">
            <div className="text-center">
              <p className="font-bold text-lg">
                Reproduciendo ahora
              </p>
              <p className="text-base mt-1 font-medium">
                {currentMural.title[language]}
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
              <button
                onClick={() => handleMuralClick(mural)}
                className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-SM-blue focus:ring-inset"
              >
                <div className="flex items-center space-x-4">
                  {/* Imagen del mural con número superpuesto */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-SM-blue to-blue-700 flex items-center justify-center">
                      <MuralImage 
                        muralId={mural.id}
                        imagePath={mural.image}
                        alt={mural.alt?.[language] || mural.title[language]}
                        className="w-full h-full object-cover"
                        fallbackIcon="🎨"
                        fallbackIconSize="text-2xl"
                        showLoading={false}
                      />
                    </div>
                    {/* Número superpuesto en el centro de la imagen */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${statusColor} border-2 border-slate-200 dark:border-slate-600 shadow-lg`}>
                      {mural.order}
                    </div>
                  </div>

                  {/* Información del mural */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium text-base truncate ${
                        isActive ? 'text-SM-blue' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {mural.title[language]}
                      </h4>
                    </div>
                    
                    {/* Artista y ubicación */}
                    <div className="space-y-1">
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="text-xs mr-1">🎨</span>
                        <span className="text-sm">{mural.artist || 'Artista desconocido'}</span>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="text-xs mr-1">📍</span>
                        <span className="text-sm">{mural.location?.[language] || 'Ubicación no disponible'}</span>
                      </div>
                    </div>
                    
                    {/* Solo tiempo de duración */}
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <svg fill="#000000" width="16px" height="16px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-7.59V4h2v5.59l3.95 3.95-1.41 1.41L9 10.41z"/></svg>
                        <span className="ml-1">{mural.duration?.[audioType] || getEstimatedDuration(audioType)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Icono de estado */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {status === 'completed' ? '✅' : '▶️'}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer con tiempo total */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <span className="text-slate-600 dark:text-slate-400 text-sm">
            ⏱️ Tiempo total de la audioguía: ~{murals.length * (audioType === 'easy' ? 5 : audioType === 'descriptive' ? 10 : 7)} min
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;
