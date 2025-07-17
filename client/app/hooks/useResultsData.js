'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '../utils/api'

export function useResultsData(scrimId) {
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para cada sección
  const [leaderboard, setLeaderboard] = useState([])
  const [mapWinners, setMapWinners] = useState([])
  const [globalMVP, setGlobalMVP] = useState(null)
  const [finalTop3, setFinalTop3] = useState([])

  useEffect(() => {
    if (scrimId) {
      fetchScrimData()
    }
  }, [scrimId])

  const fetchScrimData = async () => {
    try {
      setLoading(true)
      const [scrimData, teamsData, matchesData] = await Promise.all([
        apiCall(`/scrims/${scrimId}`),
        apiCall(`/scrims/${scrimId}/teams`),
        apiCall(`/matches?scrimId=${scrimId}`)
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
      
      // Calcular todos los datos
      calculateAllData(scrimData, teamsData, matchesData, allResults)
      
    } catch (error) {
      console.error('Error al cargar los datos del scrim')
      console.error(error)
    } finally {
      setLoading(false)
    }
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

  const calculateAllData = (scrimData, teamsData, matchesData, allResults) => {
    // 1. Calcular Leaderboard
    const teamStats = {}
    teamsData.forEach(team => {
      teamStats[team.id] = {
        ...team,
        mapResults: {},
        totalKillPoints: 0,
        totalPlacementPoints: 0,
        totalPoints: 0,
        totalKills: 0,
        wins: 0,
        top3Finishes: 0,
        gamesPlayed: 0
      }
      
      scrimData.maps.forEach(mapName => {
        teamStats[team.id].mapResults[mapName] = {
          placement: null,
          kills: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0
        }
      })
    })
    
    allResults.forEach(result => {
      const teamStat = teamStats[result.teamId]
      if (teamStat && result.mapName) {
        const mapResult = teamStat.mapResults[result.mapName]
        if (mapResult) {
          mapResult.placement = result.placement
          mapResult.kills = result.kills || 0
          mapResult.placementPoints = getPlacementPoints(result.placement, scrimData.pointSystem)
          mapResult.killPoints = (result.kills || 0) * (scrimData.pointSystem?.killPoints || 1)
          mapResult.totalPoints = mapResult.placementPoints + mapResult.killPoints
          
          teamStat.totalKillPoints += mapResult.killPoints
          teamStat.totalPlacementPoints += mapResult.placementPoints
          teamStat.totalPoints += mapResult.totalPoints
          teamStat.totalKills += mapResult.kills
          teamStat.gamesPlayed += 1
          
          if (result.placement === 1) teamStat.wins += 1
          if (result.placement <= 3) teamStat.top3Finishes += 1
        }
      }
    })
    
    const sortedTeams = Object.values(teamStats).sort((a, b) => b.totalPoints - a.totalPoints)
    const leaderboardWithPositions = sortedTeams.map((team, index) => ({
      ...team,
      position: index + 1
    }))
    setLeaderboard(leaderboardWithPositions)

    // 2. Calcular Top 3
    setFinalTop3(leaderboardWithPositions.slice(0, 3))

    // 3. Calcular ganadores por mapa
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

    // 4. Calcular MVP Global (solo para scrims detallados)
    if (scrimData.settings?.isDetailed) {
      let globalMVPData = null
      let maxTotalKills = 0

      Object.values(teamStats).forEach(team => {
        if (team.players && Array.isArray(team.players)) {
          team.players.forEach((playerName, playerIndex) => {
            let playerTotalKills = 0
            let playerTotalPoints = 0
            let gamesPlayed = 0
            
            // Sumar kills y puntos de todos los mapas para este jugador
            allResults.forEach(result => {
              if (result.teamId === team.id && result.playerStats) {
                // playerStats se guarda como JSON - necesitamos parsearlo primero
                let parsedStats = result.playerStats
                if (typeof result.playerStats === 'string') {
                  try {
                    parsedStats = JSON.parse(result.playerStats)
                  } catch (e) {
                    parsedStats = {}
                  }
                }
                
                // Ahora accedemos a los datos parseados
                const playerKills = Number(parsedStats[playerIndex.toString()]) || 0
                
                playerTotalKills += playerKills
                playerTotalPoints += playerKills * (scrimData.pointSystem?.killPoints || 1)
                if (playerKills > 0) gamesPlayed++
              }
            })
            
            if (playerTotalKills > maxTotalKills) {
              maxTotalKills = playerTotalKills
              globalMVPData = {
                name: typeof playerName === 'string' ? playerName : `Jugador ${playerIndex + 1}`,
                totalKills: playerTotalKills,
                totalPoints: playerTotalPoints,
                gamesPlayed: gamesPlayed,
                averageKills: gamesPlayed > 0 ? (playerTotalKills / gamesPlayed).toFixed(1) : 0,
                team: {
                  ...team,
                  position: team.position || leaderboardWithPositions.findIndex(t => t.id === team.id) + 1
                },
                playerIndex: playerIndex
              }
            }
          })
        }
      })
      
      setGlobalMVP(globalMVPData)
    }
  }

  return {
    scrim,
    teams,
    matches,
    matchResults,
    loading,
    leaderboard,
    mapWinners,
    globalMVP,
    finalTop3,
    refetch: fetchScrimData
  }
}