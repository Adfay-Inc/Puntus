'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../../utils/api'
import { ArrowLeft, Save, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function MatchesPage() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMapIndex, setCurrentMapIndex] = useState(0)
  const [matchResults, setMatchResults] = useState({})
  const [completedRounds, setCompletedRounds] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    fetchScrimDetails()
  }, [id])

  const fetchScrimDetails = async () => {
    try {
      setLoading(true)
      const [scrimData, teamsData] = await Promise.all([
        apiCall(`/scrims/${id}`),
        apiCall(`/scrims/${id}/teams`)
      ])
      
      setScrim(scrimData)
      setTeams(teamsData)
      
      // Inicializar estructura de resultados para cada mapa
      const initialResults = {}
      scrimData.maps.forEach((map, mapIndex) => {
        initialResults[mapIndex] = {}
        teamsData.forEach(team => {
          initialResults[mapIndex][team.id] = {
            placement: '',
            players: {}
          }
          // Inicializar kills para cada jugador
          if (team.players && Array.isArray(team.players)) {
            team.players.forEach((player, playerIndex) => {
              initialResults[mapIndex][team.id].players[playerIndex] = 0
            })
          }
        })
      })
      setMatchResults(initialResults)
    } catch (error) {
      console.error('Error al cargar los detalles del scrim:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlacementChange = (teamId, placement) => {
    const placementNum = parseInt(placement) || ''
    
    // Verificar si la posición ya está ocupada por otro equipo
    if (placementNum && placementNum !== '') {
      const currentResults = matchResults[currentMapIndex] || {}
      const isPositionTaken = Object.entries(currentResults).some(([otherTeamId, result]) => 
        otherTeamId !== teamId.toString() && result.placement === placementNum
      )
      
      if (isPositionTaken) {
        // La posición ya está ocupada por otro equipo
        return
      }
    }
    
    setMatchResults(prev => ({
      ...prev,
      [currentMapIndex]: {
        ...prev[currentMapIndex],
        [teamId]: {
          ...prev[currentMapIndex][teamId],
          placement: placementNum
        }
      }
    }))
  }

  const handleKillsChange = (teamId, playerIndex, kills) => {
    setMatchResults(prev => ({
      ...prev,
      [currentMapIndex]: {
        ...prev[currentMapIndex],
        [teamId]: {
          ...prev[currentMapIndex][teamId],
          players: {
            ...prev[currentMapIndex][teamId].players,
            [playerIndex]: parseInt(kills) || 0
          }
        }
      }
    }))
  }

  const isCurrentRoundComplete = () => {
    const results = matchResults[currentMapIndex] || {}
    
    // Verificar que todos los equipos tengan posición
    for (const team of teams) {
      if (!results[team.id]?.placement) {
        return false
      }
    }
    
    return true
  }

  const calculatePoints = (placement, totalKills) => {
    const placementPoints = {
      1: scrim.pointSystem?.placement?.first || 12,
      2: scrim.pointSystem?.placement?.second || 6,
      3: scrim.pointSystem?.placement?.third || 4,
      4: scrim.pointSystem?.placement?.fourth || 2,
      5: scrim.pointSystem?.placement?.fifth || 1,
      6: scrim.pointSystem?.placement?.sixth || 0,
      7: scrim.pointSystem?.placement?.seventh || 0,
      8: scrim.pointSystem?.placement?.eighth || 0,
      9: scrim.pointSystem?.placement?.ninth || 0,
      10: scrim.pointSystem?.placement?.tenth || 0,
      11: scrim.pointSystem?.placement?.eleventh || 0,
      12: scrim.pointSystem?.placement?.twelfth || 0
    }
    
    const placePoints = placementPoints[placement] || 0
    const killPoints = totalKills * (scrim.pointSystem?.killPoints || 1)
    
    return placePoints + killPoints
  }

  const handleConfirmNextRound = () => {
    setShowConfirmModal(true)
  }

  const handleSaveAndNextRound = async () => {
    setShowConfirmModal(false)
    await handleSaveMatch()
  }

  const handleSaveMatch = async () => {
    try {
      const currentMap = scrim.maps[currentMapIndex]
      const results = matchResults[currentMapIndex]
      
      // Validar que todos los equipos tengan posición
      for (const team of teams) {
        if (!results[team.id]?.placement) {
          console.warn(`Por favor ingresa la posición del equipo ${team.name}`)
          return
        }
      }
      
      // Crear la partida
      const matchData = {
        scrimId: id,
        mapName: currentMap,
        matchNumber: currentMapIndex + 1
      }
      
      const match = await apiCall('/matches', {
        method: 'POST',
        body: JSON.stringify(matchData)
      })
      
      // Guardar resultados de cada equipo
      for (const team of teams) {
        const teamResult = results[team.id]
        const totalKills = Object.values(teamResult.players).reduce((sum, kills) => sum + kills, 0)
        const points = calculatePoints(teamResult.placement, totalKills)
        
        const resultData = {
          matchId: match.id,
          teamId: team.id,
          placement: teamResult.placement,
          kills: totalKills,
          points: points,
          playerKills: teamResult.players
        }
        
        await apiCall('/match-results', {
          method: 'POST',
          body: JSON.stringify(resultData)
        })
      }
      
      console.log(`Resultados del ${currentMap} guardados`)
      
      // Marcar la ronda actual como completada
      setCompletedRounds(prev => [...prev, currentMapIndex])
      
      // Si hay más mapas, avanzar al siguiente
      if (currentMapIndex < scrim.maps.length - 1) {
        setCurrentMapIndex(currentMapIndex + 1)
      } else {
        // Si es el último mapa, completar el scrim
        await apiCall(`/scrims/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'completed' })
        })
        console.log('¡Scrim completado!')
        window.location.href = `/scrim/${id}`
      }
    } catch (error) {
      console.error('Error al guardar los resultados:', error.message || error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex justify-center items-center">
        <div className="card-elegant-orange text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-slate-600 font-medium">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!scrim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex justify-center items-center">
        <div className="card-elegant-orange text-center">
          <div className="text-slate-900 font-semibold">Scrim no encontrado</div>
        </div>
      </div>
    )
  }

  const currentMap = scrim.maps[currentMapIndex]
  const results = matchResults[currentMapIndex] || {}
  const isRoundCompleted = completedRounds.includes(currentMapIndex)
  const isFormComplete = isCurrentRoundComplete()
  const isLastRound = currentMapIndex === scrim.maps.length - 1
  
  // Obtener posiciones ya ocupadas
  const getOccupiedPositions = () => {
    const occupied = new Set()
    Object.values(results).forEach(result => {
      if (result.placement) {
        occupied.add(result.placement)
      }
    })
    return occupied
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/scrim/${id}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Scrim
          </Link>
          
          <div className="card-elegant-orange">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
              <span className="gradient-text-only">Registrar</span> Resultados
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-slate-600">
                <span>{scrim.name}</span>
                <span>•</span>
                <span>Mapa {currentMapIndex + 1} de {scrim.maps.length}</span>
                <span>•</span>
                <span className="gradient-text-only font-semibold">{currentMap}</span>
              </div>
              
              {/* Navegación entre rondas */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentMapIndex(Math.max(0, currentMapIndex - 1))}
                  disabled={currentMapIndex === 0}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-slate-400">|</span>
                <button
                  onClick={() => setCurrentMapIndex(Math.min(scrim.maps.length - 1, currentMapIndex + 1))}
                  disabled={currentMapIndex === scrim.maps.length - 1 || !completedRounds.includes(currentMapIndex)}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de resultados */}
        <div className="card-elegant-orange">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 capitalize">
            Resultados - <span className="gradient-text-only">{currentMap}</span>
          </h2>
          
          <div className="space-y-6">
            {teams.map((team) => {
              const teamResult = results[team.id] || { placement: '', players: {} }
              const totalKills = Object.values(teamResult.players).reduce((sum, kills) => sum + kills, 0)
              const points = teamResult.placement ? calculatePoints(teamResult.placement, totalKills) : 0
              const occupiedPositions = getOccupiedPositions()
              
              return (
                <div key={team.id} className="card-elegant-orange">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-slate-900 font-semibold text-lg">{team.name}</h3>
                      <span className="gradient-text-only text-sm font-mono">[{team.tag}]</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-slate-600 text-sm mb-1">Posición</label>
                        <select
                          value={teamResult.placement}
                          onChange={(e) => handlePlacementChange(team.id, e.target.value)}
                          className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          disabled={isRoundCompleted}
                          required
                        >
                          <option value="">-</option>
                          {[...Array(12)].map((_, i) => {
                            const position = i + 1
                            const isOccupied = occupiedPositions.has(position) && teamResult.placement !== position
                            return (
                              <option 
                                key={position} 
                                value={position}
                                disabled={isOccupied}
                                style={{ color: isOccupied ? '#666' : 'inherit' }}
                              >
                                {position}° {isOccupied ? '(ocupado)' : ''}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-600 text-sm">Kills totales</div>
                        <div className="text-slate-900 font-bold text-xl">{totalKills}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-600 text-sm">Puntos</div>
                        <div className="gradient-text-only font-bold text-xl">{points}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kills por jugador */}
                  {scrim.settings?.isDetailed && team.players && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-slate-600 text-sm mb-2 font-medium">Kills por jugador:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {team.players.map((player, idx) => {
                          const playerName = typeof player === 'string' ? player : player.name
                          return (
                            <div key={idx} className="text-center">
                              <label className="block text-slate-500 text-xs mb-1 truncate">
                                {playerName}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={teamResult.players[idx] || 0}
                                onChange={(e) => handleKillsChange(team.id, idx, e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center transition-all"
                                disabled={isRoundCompleted}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            {!isRoundCompleted && (
              <button
                onClick={handleConfirmNextRound}
                disabled={!isFormComplete}
                className={`${!isFormComplete ? 'btn-elegant-outline opacity-50 cursor-not-allowed' : 'btn-gradient'} flex items-center space-x-2`}
              >
                <Save className="h-4 w-4" />
                <span>
                  {isLastRound ? 'Finalizar Scrim' : 'Siguiente Ronda'}
                </span>
              </button>
            )}
            
            {isRoundCompleted && !isLastRound && (
              <div className="gradient-text-only flex items-center space-x-2 font-medium">
                <span>✓ Ronda completada</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-elegant-orange max-w-md w-full">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 capitalize">
                Confirmar <span className="gradient-text-only">{isLastRound ? 'Finalización' : 'Siguiente Ronda'}</span>
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {isLastRound 
                  ? '¿Estás seguro que quieres finalizar el scrim? No podrás cambiar los datos después.'
                  : '¿Estás seguro que quieres continuar a la siguiente ronda? No podrás cambiar los datos de esta ronda después.'
                }
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveAndNextRound}
                  className="btn-gradient flex-1"
                >
                  Sí, continuar
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-elegant-outline flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}