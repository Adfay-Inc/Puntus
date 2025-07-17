'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../../utils/api'
import { ArrowLeft, Trophy, Target, Award } from 'lucide-react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    fetchScrimData()
  }, [id])

  const fetchScrimData = async () => {
    try {
      setLoading(true)
      const [scrimData, teamsData, matchesData] = await Promise.all([
        apiCall(`/scrims/${id}`),
        apiCall(`/scrims/${id}/teams`),
        apiCall(`/matches?scrimId=${id}`)
      ])
      
      setScrim(scrimData)
      setTeams(teamsData)
      setMatches(matchesData)
      
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
          console.log(`No hay resultados para la partida ${match.id}`)
        }
      }
      setMatchResults(allResults)
      
      // Calcular leaderboard
      calculateLeaderboard(teamsData, matchesData, allResults, scrimData)
      
    } catch (error) {
      console.error('Error al cargar los datos del scrim:', error)
      console.error(error)
    } finally {
      setLoading(false)
    }
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
    const leaderboardWithPositions = sortedTeams.map((team, index) => ({
      ...team,
      position: index + 1
    }))
    
    setLeaderboard(leaderboardWithPositions)
  }

  const TeamLogo = ({ team, size = "w-8 h-8" }) => {
    const [imageError, setImageError] = useState(false)
    
    // Debug: ver qué datos llegan
    console.log('TeamLogo - team:', team?.name, 'logo:', team?.logo)
    
    if (!team?.logo || imageError) {
      console.log('TeamLogo - No logo o error, mostrando fallback para:', team?.name)
      return (
        <div className={`${size} bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          {team?.tag || '?'}
        </div>
      )
    }
    
    // Construir URL completa para logos locales
    const logoUrl = team.logo.startsWith('http') 
      ? team.logo 
      : `http://localhost:5000${team.logo}`
    
    console.log('TeamLogo - URL construida:', logoUrl)
    
    return (
      <img 
        src={logoUrl} 
        alt={`Logo ${team.name}`}
        className={`${size} rounded-full object-cover border border-orange-300`}
        onError={(e) => {
          console.log('TeamLogo - Error cargando imagen:', logoUrl, e)
          setImageError(true)
        }}
      />
    )
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-800">Cargando tabla de clasificación...</div>
      </div>
    )
  }

  if (!scrim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-800">Scrim no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/scrim/${id}`} className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Scrim
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <Trophy className="h-8 w-8 mr-3 text-orange-600" />
                  Tabla de Clasificación
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{scrim.name}</span>
                  <span>•</span>
                  <span>{scrim.maps.length} mapas</span>
                  <span>•</span>
                  <span className="text-orange-600 font-semibold">{teams.length} equipos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de clasificación */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-gray-800 font-semibold py-3 px-2 w-16">Pos</th>
                <th className="text-left text-gray-800 font-semibold py-3 px-4 min-w-48">Equipo</th>
                {scrim.maps.map((mapName, index) => (
                  <th key={`${mapName}-${index}`} className="text-center text-gray-800 font-semibold py-3 px-3 min-w-28">
                    <div className="text-sm">{mapName}</div>
                    <div className="text-xs text-gray-500 mt-1">Mapa {index + 1}</div>
                  </th>
                ))}
                <th className="text-center text-gray-800 font-semibold py-3 px-3 min-w-24">
                  <div className="flex items-center justify-center">
                    <Target className="h-4 w-4 mr-1" />
                    <div>
                      <div className="text-sm">Kills</div>
                      <div className="text-xs text-gray-500">Puntos</div>
                    </div>
                  </div>
                </th>
                <th className="text-center text-gray-800 font-semibold py-3 px-3 min-w-24">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-1" />
                    <div>
                      <div className="text-sm">Total</div>
                      <div className="text-xs text-gray-500">Puntos</div>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team) => (
                <tr key={team.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                  {/* Posición */}
                  <td className="py-4 px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      team.position === 1 ? 'bg-yellow-500 text-black' :
                      team.position === 2 ? 'bg-gray-400 text-black' :
                      team.position === 3 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {team.position}
                    </div>
                  </td>
                  
                  {/* Equipo */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <TeamLogo team={team} size="w-10 h-10" />
                      <div>
                        <div className="text-gray-800 font-semibold">{team.name}</div>
                        <div className="text-orange-600 text-sm">[{team.tag}]</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Puntos por mapa */}
                  {scrim.maps.map((mapName, index) => {
                    const mapResult = team.mapResults[`${mapName}-${index}`]
                    return (
                      <td key={`${mapName}-${index}`} className="py-4 px-3 text-center">
                        {mapResult.placement ? (
                          <div>
                            <div className="text-gray-800 font-bold text-lg">{mapResult.totalPoints}</div>
                            <div className="text-xs text-gray-500">
                              {mapResult.placement}° lugar
                            </div>
                            <div className="text-xs text-gray-500">
                              {mapResult.placementPoints}+{mapResult.killPoints}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">-</div>
                        )}
                      </td>
                    )
                  })}
                  
                  {/* Puntos por kills totales */}
                  <td className="py-4 px-3 text-center">
                    <div className="text-gray-800 font-bold text-lg">{team.totalKillPoints}</div>
                    <div className="text-xs text-white/60">
                      {Object.values(team.mapResults).reduce((sum, map) => sum + map.kills, 0)} kills
                    </div>
                  </td>
                  
                  {/* Puntos totales */}
                  <td className="py-4 px-3 text-center">
                    <div className="text-orange-600 font-bold text-xl">{team.totalPoints}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay resultados disponibles aún</p>
              <p className="text-gray-500 text-sm">Los resultados aparecerán aquí cuando se registren las partidas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}