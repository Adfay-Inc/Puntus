'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../utils/api'
import { Trophy, Target, Award, Wifi, WifiOff, Eye, TrendingUp, TrendingDown } from 'lucide-react'

export default function LiveLeaderboardPage() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [positionChanges, setPositionChanges] = useState({})
  const intervalRef = useRef(null)
  const previousLeaderboardRef = useRef([])

  useEffect(() => {
    fetchScrimData()
    
    // Configurar auto-refresh cada 5 segundos
    intervalRef.current = setInterval(() => {
      fetchScrimData(true) // true = es actualización automática
    }, 5000)
    
    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [id])

  const fetchScrimData = async (isAutoUpdate = false) => {
    try {
      if (!isAutoUpdate) setLoading(true)
      
      const [scrimData, teamsData, matchesData] = await Promise.all([
        apiCall(`/scrims/${id}`),
        apiCall(`/scrims/${id}/teams`),
        apiCall(`/matches?scrimId=${id}`)
      ])
      
      setScrim(scrimData)
      setTeams(teamsData)
      setMatches(matchesData)
      setIsConnected(true)
      setLastUpdate(new Date())
      
      // Obtener resultados de todas las partidas
      const allResults = []
      for (const match of matchesData) {
        try {
          const results = await apiCall(`/match-results/${match.id}`)
          // Usar gameNumber-1 como mapIndex (gameNumber empieza en 1)
          const mapIndex = match.gameNumber ? match.gameNumber - 1 : 0
          allResults.push(...results.map(result => ({ 
            ...result, 
            matchId: match.id, 
            mapName: match.mapName,
            mapIndex: mapIndex
          })))
        } catch (error) {
          // No hay resultados para esta partida aún
        }
      }
      setMatchResults(allResults)
      
      // Calcular leaderboard y detectar cambios
      const newLeaderboard = calculateLeaderboard(teamsData, matchesData, allResults, scrimData)
      
      // Detectar cambios de posición si es una actualización automática
      if (isAutoUpdate && previousLeaderboardRef.current.length > 0) {
        detectPositionChanges(previousLeaderboardRef.current, newLeaderboard)
      }
      
      setLeaderboard(newLeaderboard)
      previousLeaderboardRef.current = newLeaderboard
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setIsConnected(false)
    } finally {
      if (!isAutoUpdate) setLoading(false)
    }
  }

  const detectPositionChanges = (oldLeaderboard, newLeaderboard) => {
    const changes = {}
    
    newLeaderboard.forEach(newTeam => {
      const oldTeam = oldLeaderboard.find(t => t.id === newTeam.id)
      if (oldTeam && oldTeam.position !== newTeam.position) {
        const change = oldTeam.position - newTeam.position // positivo = subió, negativo = bajó
        changes[newTeam.id] = {
          change,
          direction: change > 0 ? 'up' : 'down',
          positions: Math.abs(change)
        }
      }
    })
    
    setPositionChanges(changes)
    
    // Limpiar animaciones después de 3 segundos
    setTimeout(() => {
      setPositionChanges({})
    }, 3000)
  }

  const calculateLeaderboard = (teamsData, matchesData, allResults, scrimData) => {
    const teamStats = {}
    
    // Inicializar estadísticas para cada equipo
    teamsData.forEach(team => {
      teamStats[team.id] = {
        id: team.id,
        name: team.name,
        tag: team.tag,
        mapResults: {},
        totalKillPoints: 0,
        totalPlacementPoints: 0,
        totalPoints: 0
      }
      
      // Inicializar resultados por mapa
      scrimData.maps.forEach((mapName, index) => {
        teamStats[team.id].mapResults[`${mapName}-${index}`] = {
          placement: null,
          kills: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0
        }
      })
    })
    
    // Procesar resultados de cada partida
    allResults.forEach(result => {
      const teamStat = teamStats[result.teamId]
      if (teamStat && result.mapName && result.mapIndex !== undefined) {
        const mapKey = `${result.mapName}-${result.mapIndex}`
        const mapResult = teamStat.mapResults[mapKey]
        if (mapResult) {
          mapResult.placement = result.placement
          mapResult.kills = result.kills || 0
          mapResult.placementPoints = getPlacementPoints(result.placement, scrimData.pointSystem)
          mapResult.killPoints = (result.kills || 0) * (scrimData.pointSystem?.killPoints || 1)
          mapResult.totalPoints = mapResult.placementPoints + mapResult.killPoints
          
          // Sumar a totales del equipo
          teamStat.totalKillPoints += mapResult.killPoints
          teamStat.totalPlacementPoints += mapResult.placementPoints
          teamStat.totalPoints += mapResult.totalPoints
        }
      }
    })
    
    // Convertir a array y ordenar por puntos totales (mayor a menor)
    const sortedTeams = Object.values(teamStats).sort((a, b) => b.totalPoints - a.totalPoints)
    
    // Asignar posiciones
    return sortedTeams.map((team, index) => ({
      ...team,
      position: index + 1
    }))
  }

  const getPlacementPoints = (placement, pointSystem) => {
    if (!placement || !pointSystem?.placement) return 0
    
    const placementMap = {
      1: pointSystem.placement.first || 12,
      2: pointSystem.placement.second || 6,
      3: pointSystem.placement.third || 4,
      4: pointSystem.placement.fourth || 2,
      5: pointSystem.placement.fifth || 1,
      6: pointSystem.placement.sixth || 0,
      7: pointSystem.placement.seventh || 0,
      8: pointSystem.placement.eighth || 0,
      9: pointSystem.placement.ninth || 0,
      10: pointSystem.placement.tenth || 0,
      11: pointSystem.placement.eleventh || 0,
      12: pointSystem.placement.twelfth || 0
    }
    
    return placementMap[placement] || 0
  }

  const TeamLogo = ({ team, size = "w-10 h-10" }) => {
    const [imageError, setImageError] = useState(false)
    
    if (!team?.logo || imageError) {
      return (
        <div className={`${size} bg-puntus-primary rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {team?.tag || '?'}
        </div>
      )
    }
    
    // Construir URL completa para logos locales
    const logoUrl = team.logo.startsWith('http') 
      ? team.logo 
      : `http://localhost:5000${team.logo}`
    
    return (
      <img 
        src={logoUrl} 
        alt={`Logo ${team.name}`}
        className={`${size} rounded-full object-cover border border-puntus-primary/50`}
        onError={() => setImageError(true)}
      />
    )
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-puntus-dark via-black to-puntus-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-puntus-primary mx-auto mb-4"></div>
          <div className="text-white text-xl">Cargando transmisión en vivo...</div>
        </div>
      </div>
    )
  }

  if (!scrim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-puntus-dark via-black to-puntus-dark">
        <div className="text-white text-xl">Scrim no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-puntus-dark via-black to-puntus-dark">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-puntus-primary/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-puntus-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{scrim.name}</h1>
                  <div className="text-sm text-white/60">Clasificación en Vivo</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
                <span className="text-xs text-white/60 ml-1">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white/60 text-sm">Última actualización</div>
              <div className="text-white font-mono text-sm">{formatTime(lastUpdate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de clasificación */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-puntus-primary/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-puntus-primary/10">
                <tr>
                  <th className="text-left text-white font-semibold py-4 px-4 w-20">Pos</th>
                  <th className="text-left text-white font-semibold py-4 px-6 min-w-56">Equipo</th>
                  {scrim.maps.map((mapName, index) => (
                    <th key={`${mapName}-${index}`} className="text-center text-white font-semibold py-4 px-4 min-w-32">
                      <div className="text-base">{mapName}</div>
                      <div className="text-xs text-white/60 mt-1">Mapa {index + 1}</div>
                    </th>
                  ))}
                  <th className="text-center text-white font-semibold py-4 px-4 min-w-28">
                    <div className="flex items-center justify-center">
                      <Target className="h-5 w-5 mr-2" />
                      <div>
                        <div className="text-base">Kills</div>
                        <div className="text-xs text-white/60">Puntos</div>
                      </div>
                    </div>
                  </th>
                  <th className="text-center text-white font-semibold py-4 px-4 min-w-28">
                    <div className="flex items-center justify-center">
                      <Award className="h-5 w-5 mr-2" />
                      <div>
                        <div className="text-base">Total</div>
                        <div className="text-xs text-white/60">Puntos</div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((team) => {
                  const positionChange = positionChanges[team.id]
                  return (
                    <tr 
                      key={team.id} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-all duration-500 ${
                        positionChange ? 'bg-puntus-primary/20' : ''
                      }`}
                    >
                      {/* Posición con animaciones */}
                      <td className="py-6 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 ${
                            team.position === 1 ? 'bg-yellow-500 text-black' :
                            team.position === 2 ? 'bg-gray-400 text-black' :
                            team.position === 3 ? 'bg-orange-600 text-white' :
                            'bg-white/20 text-white'
                          } ${positionChange ? 'scale-110' : ''}`}>
                            {team.position}
                          </div>
                          
                          {/* Indicador de cambio */}
                          {positionChange && (
                            <div className={`flex items-center text-sm font-bold animate-bounce ${
                              positionChange.direction === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {positionChange.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="ml-1">+{positionChange.positions}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Equipo */}
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-4">
                          <TeamLogo team={team} size="w-12 h-12" />
                          <div>
                            <div className="text-white font-bold text-lg">{team.name}</div>
                            <div className="text-puntus-primary font-semibold">[{team.tag}]</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Puntos por mapa */}
                      {scrim.maps.map((mapName, index) => {
                        const mapResult = team.mapResults[`${mapName}-${index}`]
                        return (
                          <td key={`${mapName}-${index}`} className="py-6 px-4 text-center">
                            {mapResult.placement ? (
                              <div>
                                <div className="text-white font-bold text-xl">{mapResult.totalPoints}</div>
                                <div className="text-sm text-white/70 mt-1">
                                  {mapResult.placement}° lugar
                                </div>
                                <div className="text-xs text-white/50">
                                  {mapResult.placementPoints}+{mapResult.killPoints}
                                </div>
                              </div>
                            ) : (
                              <div className="text-white/40 text-lg">-</div>
                            )}
                          </td>
                        )
                      })}
                      
                      {/* Puntos por kills totales */}
                      <td className="py-6 px-4 text-center">
                        <div className="text-white font-bold text-xl">{team.totalKillPoints}</div>
                        <div className="text-sm text-white/70 mt-1">
                          {Object.values(team.mapResults).reduce((sum, map) => sum + map.kills, 0)} kills
                        </div>
                      </td>
                      
                      {/* Puntos totales */}
                      <td className="py-6 px-4 text-center">
                        <div className="text-puntus-primary font-bold text-2xl">{team.totalPoints}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <p className="text-white/70 text-lg">Esperando resultados...</p>
              <p className="text-white/50 text-sm mt-2">La tabla se actualizará automáticamente cuando se registren partidas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}