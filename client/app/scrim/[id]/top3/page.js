'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../../utils/api'
import { ArrowLeft, Trophy, Target, Award, Crown, Medal, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Top3Page() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [finalTop3, setFinalTop3] = useState([])

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
          allResults.push(...results.map(result => ({ 
            ...result, 
            matchId: match.id, 
            mapName: match.mapName,
            match: match
          })))
        } catch (error) {
          // No hay resultados para esta partida aún
        }
      }
      setMatchResults(allResults)
      
      // Calcular Top 3
      calculateTop3(scrimData, teamsData, allResults)
      
    } catch (error) {
      toast.error('Error al cargar los datos del scrim')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTop3 = (scrimData, teamsData, allResults) => {
    const teamStats = {}
    
    // Inicializar estadísticas para cada equipo
    teamsData.forEach(team => {
      teamStats[team.id] = {
        ...team,
        totalPoints: 0,
        totalKills: 0,
        totalPlacementPoints: 0,
        totalKillPoints: 0,
        wins: 0,
        top3Finishes: 0,
        averagePosition: 0,
        mapResults: [],
        gamesPlayed: 0
      }
    })

    // Procesar resultados por mapa
    const mapGroups = {}
    allResults.forEach(result => {
      if (!mapGroups[result.mapName]) {
        mapGroups[result.mapName] = []
      }
      mapGroups[result.mapName].push(result)
    })

    Object.entries(mapGroups).forEach(([mapName, mapResults]) => {
      mapResults.forEach(result => {
        const teamStat = teamStats[result.teamId]
        if (teamStat) {
          const placementPoints = getPlacementPoints(result.placement, scrimData.pointSystem)
          const killPoints = (result.kills || 0) * (scrimData.pointSystem?.killPoints || 1)
          
          teamStat.totalPoints += result.points || (placementPoints + killPoints)
          teamStat.totalKills += result.kills || 0
          teamStat.totalPlacementPoints += placementPoints
          teamStat.totalKillPoints += killPoints
          teamStat.gamesPlayed += 1
          
          if (result.placement === 1) {
            teamStat.wins += 1
          }
          if (result.placement <= 3) {
            teamStat.top3Finishes += 1
          }
          
          teamStat.mapResults.push({
            mapName,
            placement: result.placement,
            kills: result.kills || 0,
            points: result.points || (placementPoints + killPoints)
          })
        }
      })
    })

    // Calcular posición promedio
    Object.values(teamStats).forEach(team => {
      if (team.gamesPlayed > 0) {
        const totalPlacement = team.mapResults.reduce((sum, map) => sum + map.placement, 0)
        team.averagePosition = (totalPlacement / team.gamesPlayed).toFixed(1)
      }
    })

    // Ordenar y obtener Top 3
    const sortedTeams = Object.values(teamStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3)
      .map((team, index) => ({
        ...team,
        position: index + 1
      }))

    setFinalTop3(sortedTeams)
  }

  const getPlacementPoints = (placement, pointSystem) => {
    if (!placement || !pointSystem?.placement) return 0
    
    const placementMap = {
      1: pointSystem.placement.first || 12,
      2: pointSystem.placement.second || 9,
      3: pointSystem.placement.third || 8,
      4: pointSystem.placement.fourth || 7,
      5: pointSystem.placement.fifth || 6,
      6: pointSystem.placement.sixth || 5,
      7: pointSystem.placement.seventh || 4,
      8: pointSystem.placement.eighth || 3,
      9: pointSystem.placement.ninth || 2,
      10: pointSystem.placement.tenth || 1,
      11: pointSystem.placement.eleventh || 0,
      12: pointSystem.placement.twelfth || 0
    }
    
    return placementMap[placement] || 0
  }

  const TeamLogo = ({ team, size = "w-20 h-20" }) => {
    const [imageError, setImageError] = useState(false)
    
    if (!team?.logo || imageError) {
      return (
        <div className={`${size} bg-puntus-primary rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-white/20`}>
          {team?.tag || '?'}
        </div>
      )
    }
    
    const logoUrl = team.logo.startsWith('http') ? team.logo : `http://localhost:5000${team.logo}`
    
    return (
      <img 
        src={logoUrl} 
        alt={`Logo ${team.name}`}
        className={`${size} rounded-full object-cover border-4 border-white/20`}
        onError={() => setImageError(true)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Cargando podio...</div>
        </div>
      </div>
    )
  }

  if (!scrim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
        <div className="text-white text-xl">Scrim no encontrado</div>
      </div>
    )
  }

  // Solo mostrar si el scrim está completado
  if (scrim.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
        <div className="text-center">
          <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Podio No Disponible</h2>
          <p className="text-white/80 text-lg">El podio solo está disponible cuando el scrim esté completado.</p>
          <Link href={`/scrim/${id}`} className="inline-block mt-6 btn-puntus bg-yellow-600 hover:bg-yellow-700">
            Volver al Scrim
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <Link href={`/scrim/${id}`} className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Scrim
          </Link>
        </div>

        {/* Título principal */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-16 w-16 text-yellow-500 mr-4" />
            <h1 className="text-6xl font-black text-white">
              TOP 3
            </h1>
            <Crown className="h-16 w-16 text-yellow-500 ml-4" />
          </div>
          <div className="text-2xl text-yellow-200 font-semibold">{scrim.name}</div>
          <div className="text-lg text-white/70 mt-2">Podio Final</div>
        </div>

        {/* Podio */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex items-end justify-center space-x-12 max-w-6xl w-full">
            {finalTop3.map((team) => {
              const heights = { 1: 'h-96', 2: 'h-80', 3: 'h-72' }
              const backgrounds = { 
                1: 'from-yellow-500 to-yellow-600', 
                2: 'from-gray-400 to-gray-500', 
                3: 'from-orange-500 to-orange-600' 
              }
              const positions = { 1: 'order-2', 2: 'order-1', 3: 'order-3' }
              
              return (
                <div key={team.id} className={`${positions[team.position]} text-center relative`}>
                  {/* Plataforma del podio */}
                  <div className={`bg-gradient-to-t ${backgrounds[team.position]} ${heights[team.position]} w-64 rounded-t-3xl shadow-2xl relative overflow-hidden border-4 border-white/20`}>
                    {/* Efectos de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
                    
                    {/* Contenido de la plataforma */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-center p-6">
                      {/* Corona para el primer lugar */}
                      {team.position === 1 && (
                        <Crown className="h-12 w-12 text-yellow-200 mb-4 animate-pulse" />
                      )}
                      
                      {/* Logo del equipo */}
                      <div className="mb-6">
                        <TeamLogo team={team} size={team.position === 1 ? "w-24 h-24" : "w-20 h-20"} />
                      </div>
                      
                      {/* Información del equipo */}
                      <div className="text-center">
                        <h3 className={`font-black text-white mb-2 ${team.position === 1 ? 'text-2xl' : 'text-xl'}`}>
                          {team.name}
                        </h3>
                        <div className="text-white/90 font-bold text-lg mb-4">[{team.tag}]</div>
                        
                        {/* Estadísticas principales */}
                        <div className="space-y-2">
                          <div className={`font-black text-white ${team.position === 1 ? 'text-3xl' : 'text-2xl'}`}>
                            {team.totalPoints}
                          </div>
                          <div className="text-white/80 text-sm font-semibold">PUNTOS TOTALES</div>
                          
                          <div className="flex justify-center space-x-4 mt-4">
                            <div className="text-center">
                              <div className="text-white font-bold">{team.totalKills}</div>
                              <div className="text-white/70 text-xs">Kills</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-bold">{team.wins}</div>
                              <div className="text-white/70 text-xs">Victorias</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-bold">{team.averagePosition}</div>
                              <div className="text-white/70 text-xs">Pos. Prom.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Número de posición */}
                  <div className={`w-20 h-20 rounded-full mx-auto -mt-10 relative z-20 flex items-center justify-center text-4xl font-black border-4 border-white shadow-2xl ${
                    team.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                    team.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                    'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  }`}>
                    {team.position}°
                  </div>
                  
                  {/* Detalles adicionales */}
                  <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-white font-bold">{team.top3Finishes}</div>
                        <div className="text-white/60">Top 3</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{team.gamesPlayed}</div>
                        <div className="text-white/60">Partidas</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Efectos de celebración */}
        <div className="absolute top-20 left-1/4 animate-bounce">
          <Star className="h-8 w-8 text-yellow-400" />
        </div>
        <div className="absolute top-32 right-1/4 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Star className="h-6 w-6 text-orange-400" />
        </div>
        <div className="absolute top-40 left-1/3 animate-bounce" style={{ animationDelay: '1s' }}>
          <Star className="h-7 w-7 text-yellow-300" />
        </div>

        {/* Footer */}
        <div className="text-center p-8">
          <div className="text-white/60 text-sm">
            ¡Felicitaciones a todos los participantes!
          </div>
        </div>
      </div>
    </div>
  )
}