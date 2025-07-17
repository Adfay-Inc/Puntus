'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../../utils/api'
import { ArrowLeft, Trophy, Target, Award, Crown, Medal, Star } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function WinnersPage() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapWinners, setMapWinners] = useState([])
  const [mvpData, setMvpData] = useState([])
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
      
      // Calcular ganadores y datos
      calculateWinnersAndMVP(scrimData, teamsData, matchesData, allResults)
      
    } catch (error) {
      toast.error('Error al cargar los datos del scrim')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWinnersAndMVP = (scrimData, teamsData, matchesData, allResults) => {
    // 1. Calcular ganadores por mapa
    const winners = []
    scrimData.maps.forEach(mapName => {
      const mapResults = allResults.filter(result => result.mapName === mapName)
      const winner = mapResults.find(result => result.placement === 1)
      if (winner) {
        const team = teamsData.find(t => t.id === winner.teamId)
        winners.push({
          mapName,
          team,
          placement: winner.placement,
          kills: winner.kills,
          points: winner.points
        })
      }
    })
    setMapWinners(winners)

    // 2. Calcular MVP por partida (solo para scrims detallados)
    const mvps = []
    if (scrimData.settings?.isDetailed) {
      matchesData.forEach(match => {
        const matchResults = allResults.filter(result => result.matchId === match.id)
        let mvpPlayer = null
        let maxKills = 0
        let mvpTeam = null

        matchResults.forEach(result => {
          if (result.playerStats) {
            Object.entries(result.playerStats).forEach(([playerIndex, kills]) => {
              if (kills > maxKills) {
                maxKills = kills
                const team = teamsData.find(t => t.id === result.teamId)
                mvpPlayer = {
                  name: team?.players?.[playerIndex] || `Jugador ${parseInt(playerIndex) + 1}`,
                  kills: kills,
                  playerIndex: parseInt(playerIndex)
                }
                mvpTeam = team
              }
            })
          }
        })

        if (mvpPlayer && mvpTeam) {
          mvps.push({
            mapName: match.mapName,
            player: mvpPlayer,
            team: mvpTeam
          })
        }
      })
    }
    setMvpData(mvps)

    // 3. Calcular Top 3 final
    const teamStats = {}
    teamsData.forEach(team => {
      teamStats[team.id] = {
        ...team,
        totalPoints: 0,
        totalKills: 0,
        wins: 0
      }
    })

    allResults.forEach(result => {
      if (teamStats[result.teamId]) {
        teamStats[result.teamId].totalPoints += result.points || 0
        teamStats[result.teamId].totalKills += result.kills || 0
        if (result.placement === 1) {
          teamStats[result.teamId].wins += 1
        }
      }
    })

    const sortedTeams = Object.values(teamStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3)
      .map((team, index) => ({
        ...team,
        position: index + 1
      }))

    setFinalTop3(sortedTeams)
  }

  const TeamLogo = ({ team, size = "w-12 h-12" }) => {
    const [imageError, setImageError] = useState(false)
    
    if (!team?.logo || imageError) {
      return (
        <div className={`${size} bg-puntus-primary rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {team?.tag || '?'}
        </div>
      )
    }
    
    const logoUrl = team.logo.startsWith('http') ? team.logo : `http://localhost:5000${team.logo}`
    
    return (
      <img 
        src={logoUrl} 
        alt={`Logo ${team.name}`}
        className={`${size} rounded-full object-cover border-2 border-puntus-primary/50`}
        onError={() => setImageError(true)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando resultados...</div>
      </div>
    )
  }

  if (!scrim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Scrim no encontrado</div>
      </div>
    )
  }

  // Solo mostrar si el scrim está completado
  if (scrim.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Resultados No Disponibles</h2>
          <p className="text-white/70">Los resultados solo están disponibles cuando el scrim esté completado.</p>
          <Link href={`/scrim/${id}`} className="inline-block mt-4 btn-puntus">
            Volver al Scrim
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-puntus-dark via-black to-puntus-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/scrim/${id}`} className="inline-flex items-center text-white/70 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Scrim
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
              <Crown className="h-10 w-10 mr-4 text-yellow-500" />
              Resultados Finales
            </h1>
            <div className="text-xl text-white/70">{scrim.name}</div>
          </div>
        </div>

        {/* Top 3 Final */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Medal className="h-8 w-8 mr-3 text-yellow-500" />
            Podio Final
          </h2>
          
          <div className="flex justify-center items-end space-x-8">
            {finalTop3.map((team) => (
              <div key={team.id} className={`text-center ${
                team.position === 1 ? 'order-2' : 
                team.position === 2 ? 'order-1' : 'order-3'
              }`}>
                <div className={`relative ${
                  team.position === 1 ? 'mb-0' : 
                  team.position === 2 ? 'mb-8' : 'mb-12'
                }`}>
                  {/* Corona para el primer lugar */}
                  {team.position === 1 && (
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  )}
                  
                  {/* Logo del equipo */}
                  <div className="mb-4">
                    <TeamLogo team={team} size={team.position === 1 ? "w-20 h-20" : "w-16 h-16"} />
                  </div>
                  
                  {/* Posición */}
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${
                    team.position === 1 ? 'bg-yellow-500 text-black' :
                    team.position === 2 ? 'bg-gray-400 text-black' :
                    'bg-orange-600 text-white'
                  }`}>
                    {team.position}°
                  </div>
                  
                  {/* Información del equipo */}
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                    <div className="text-puntus-primary font-semibold">[{team.tag}]</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-2xl font-bold text-white">{team.totalPoints} pts</div>
                      <div className="text-sm text-white/70">{team.totalKills} kills</div>
                      <div className="text-sm text-white/70">{team.wins} victorias</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ganadores por Mapa */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Trophy className="h-8 w-8 mr-3 text-puntus-primary" />
            Ganadores por Mapa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mapWinners.map((winner, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-puntus-primary/30">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{winner.mapName}</h3>
                  <div className="text-sm text-white/60 mb-4">Mapa {index + 1}</div>
                  
                  {/* Logo y equipo ganador */}
                  <div className="mb-4">
                    <TeamLogo team={winner.team} size="w-16 h-16" />
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white">{winner.team?.name}</h4>
                    <div className="text-puntus-primary font-semibold">[{winner.team?.tag}]</div>
                  </div>
                  
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-bold">{winner.kills}</div>
                      <div className="text-white/60">Kills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-puntus-primary font-bold">{winner.points}</div>
                      <div className="text-white/60">Puntos</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MVP por Partida (Solo scrims detallados) */}
        {scrim.settings?.isDetailed && mvpData.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
              <Star className="h-8 w-8 mr-3 text-yellow-500" />
              MVP por Partida
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mvpData.map((mvp, index) => (
                <div key={index} className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{mvp.mapName}</h3>
                    <div className="text-sm text-white/60 mb-4">MVP del Mapa</div>
                    
                    {/* Logo del equipo */}
                    <div className="mb-4">
                      <TeamLogo team={mvp.team} size="w-14 h-14" />
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-yellow-400">{mvp.player.name}</h4>
                      <div className="text-white/70">{mvp.team.name}</div>
                      <div className="text-puntus-primary text-sm">[{mvp.team.tag}]</div>
                    </div>
                    
                    <div className="flex justify-center items-center space-x-2">
                      <Target className="h-5 w-5 text-red-400" />
                      <span className="text-2xl font-bold text-white">{mvp.player.kills}</span>
                      <span className="text-white/60">kills</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}