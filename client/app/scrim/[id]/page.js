'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiCall } from '../../utils/api'
import { ArrowLeft, Plus, Edit2, Trash2, Users, Trophy, Map, Play, Eye, Crown, Medal, X } from 'lucide-react'
import Link from 'next/link'
// Removed toast imports
import TeamDetailedForm from '../../components/TeamDetailedForm'
import AddTeamModal from '../../components/AddTeamModal'

export default function ScrimDetailPage() {
  const { id } = useParams()
  const [scrim, setScrim] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTeamForm, setEditTeamForm] = useState({ name: '', tag: '', logo: '', players: [] })

  useEffect(() => {
    fetchScrimDetails()
  }, [id])

  const fetchScrimDetails = async () => {
    try {
      const scrimData = await apiCall(`/scrims/${id}`)
      setScrim(scrimData)
      setTeams(scrimData.Teams || [])
    } catch (error) {
      console.error('Error al cargar la scrim:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeam = async (teamData) => {
    try {
      console.log('🚀 API - Creando equipo:', teamData.name, teamData.tag)
      
      // Asegurar que el tag esté en mayúsculas
      const finalTeamData = {
        ...teamData,
        tag: teamData.tag.toUpperCase(),
        players: teamData.players || []
      }
      
      console.log('📡 API - Enviando POST a /teams')
      const newTeam = await apiCall('/teams', {
        method: 'POST',
        body: JSON.stringify(finalTeamData)
      })

      console.log('✅ API - Equipo creado con ID:', newTeam.id)
      console.log('🔗 API - Asociando equipo con scrim')

      // Luego agregarlo a la scrim
      await apiCall(`/scrims/${id}/teams`, {
        method: 'POST',
        body: JSON.stringify({ teamId: newTeam.id })
      })

      console.log('✅ API - Equipo asociado exitosamente')
      
      setShowAddTeam(false)
      await fetchScrimDetails()
      
      console.log('🎉 SUCCESS - Equipo agregado completamente')
    } catch (error) {
      console.error('❌ API - Error al crear equipo:', error.message)
    }
  }

  const handleOpenEditModal = (team) => {
    setEditTeamForm({
      name: team.name || '',
      tag: team.tag || '',
      logo: team.logo || '',
      players: Array.isArray(team.players) ? team.players : []
    })
    setEditingTeam(team)
    setShowEditModal(true)
  }

  const handleUpdateTeamModal = async (teamData) => {
    try {
      await apiCall(`/teams/${editingTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify(teamData)
      })

      console.log('Equipo actualizado exitosamente')
      setShowEditModal(false)
      setEditingTeam(null)
      fetchScrimDetails()
    } catch (error) {
      console.error('Error al actualizar equipo:', error.message || error)
    }
  }

  const handleUpdateTeam = async (teamId) => {
    try {
      const updateData = {
        name: editingTeam.name,
        tag: editingTeam.tag.toUpperCase()
      }
      
      // Si es scrim detallada, incluir jugadores
      if (scrim.settings?.isDetailed) {
        const players = editingTeam.players || []
        
        // Validar que los primeros 4 jugadores no estén vacíos
        for (let i = 0; i < 4; i++) {
          if (!players[i] || players[i].trim() === '') {
            console.error(`El jugador ${i + 1} es obligatorio`)
            return
          }
        }
        
        updateData.players = players.filter(p => p && p.trim() !== '')
      }
      
      await apiCall(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      console.log('Equipo actualizado')
      setEditingTeam(null)
      fetchScrimDetails()
    } catch (error) {
      console.error('Error al actualizar equipo:', error.message || error)
    }
  }

  const handleRemoveTeam = async (teamId) => {
    if (!confirm('¿Estás seguro de eliminar este equipo de la scrim?')) return

    try {
      await apiCall(`/scrims/${id}/teams/${teamId}`, {
        method: 'DELETE'
      })

      console.log('Equipo eliminado de la scrim')
      fetchScrimDetails()
    } catch (error) {
      console.error('Error al eliminar equipo:', error.message || error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <div className="text-slate-600 font-medium">Cargando scrim...</div>
      </div>
    </div>
  }

  if (!scrim) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="text-slate-900 font-semibold">Scrim no encontrada</div>
      </div>
    </div>
  }

  const handleStartScrim = async () => {
    try {
      // Cambiar estado del scrim a activo
      await apiCall(`/scrims/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'active' })
      })
      
      console.log('¡Scrim iniciado! Ahora puedes registrar los resultados.')
      
      // Redirigir a la página de registro de resultados
      window.location.href = `/scrim/${id}/matches`
    } catch (error) {
      console.error('Error al iniciar el scrim:', error.message || error)
    }
  }

  const canEdit = scrim.status === 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
          
          <div className="card-elegant-orange">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
                  {scrim.name}
                </h1>
                <div className="flex items-center space-x-4 text-slate-600">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {teams.length}/{scrim.maxTeams} equipos
                  </span>
                  <span className="flex items-center">
                    <Map className="h-4 w-4 mr-1" />
                    {Array.isArray(scrim.maps) ? scrim.maps.length : 0} mapas
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    scrim.status === 'pending' ? 'bg-yellow-500' :
                    scrim.status === 'active' ? 'bg-green-500' :
                    scrim.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                  } text-white`}>
                    {scrim.status === 'pending' ? 'Pendiente' :
                     scrim.status === 'active' ? 'Activa' :
                     scrim.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {canEdit && teams.length >= scrim.minTeams && scrim.status === 'pending' && (
                  <button
                    onClick={() => handleStartScrim()}
                    className="btn-gradient flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Iniciar Scrim</span>
                  </button>
                )}
                
                {scrim.status === 'active' && (
                  <>
                    <button
                      onClick={() => window.location.href = `/scrim/${id}/matches`}
                      className="btn-gradient flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Registrar Resultados</span>
                    </button>
                    <button
                      onClick={() => window.location.href = `/scrim/${id}/leaderboard`}
                      className="btn-gradient flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Ver Clasificación</span>
                    </button>
                    <button
                      onClick={() => window.open(`/live/${id}`, '_blank')}
                      className="btn-gradient flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Vista en Vivo</span>
                    </button>
                  </>
                )}
                
                {scrim.status === 'completed' && (
                  <>
                    <button
                      onClick={() => window.location.href = `/scrim/${id}/results`}
                      className="btn-gradient flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Ver Resultados Completos</span>
                    </button>
                    <button
                      onClick={() => window.open(`/live/${id}`, '_blank')}
                      className="btn-gradient flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Vista en Vivo</span>
                    </button>
                  </>
                )}
                
                {canEdit && teams.length < scrim.maxTeams && scrim.status === 'pending' && (
                  <button
                    onClick={() => setShowAddTeam(true)}
                    className="btn-gradient flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Equipo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Teams List */}
        <div className="card-elegant-orange">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
            Equipos <span className="gradient-text-only">Registrados</span>
          </h2>
          
          {teams.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No hay equipos registrados aún</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {teams.map((team, index) => (
                <div key={team.id} className="card-elegant-orange">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="icon-container-gradient w-12 h-12">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
                        <span className="gradient-text-only text-sm font-mono">[{team.tag}]</span>
                      </div>
                    </div>
                  
                  {canEdit && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(team)}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveTeam(team.id)}
                        className="p-2 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  </div>
                  
                  {/* Mostrar jugadores si es scrim detallada */}
                  {scrim.settings?.isDetailed && Array.isArray(team.players) && team.players.length > 0 && (
                    <div className="mt-4">
                      <p className="text-slate-600 text-sm font-medium mb-3">Jugadores:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.players.slice(0, 3).map((player, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">
                            {typeof player === 'string' ? player : player.name}
                          </span>
                        ))}
                        {team.players.length > 3 && (
                          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-sm rounded-lg">
                            +{team.players.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maps Info */}
        {Array.isArray(scrim.maps) && scrim.maps.length > 0 && (
          <div className="card-elegant-orange">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
              <span className="gradient-text-only">Mapas</span>
            </h2>
            <div className={`grid gap-6 ${
              scrim.maps.length === 1 ? 'grid-cols-1' :
              scrim.maps.length === 2 ? 'grid-cols-2' :
              scrim.maps.length === 3 ? 'grid-cols-3' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {scrim.maps.map((map, index) => (
                <div key={index} className="group card-elegant-orange">
                  <div className="icon-container-gradient mb-4">
                    <Map className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Mapa {index + 1}
                  </h3>
                  <p className="text-slate-600">{typeof map === 'string' ? map : map.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && editingTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-elegant-orange max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="icon-container-gradient">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 capitalize">
                    Editar <span className="gradient-text-only">Equipo</span>
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingTeam(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* TeamDetailedForm */}
              <TeamDetailedForm
                teamForm={editTeamForm}
                setTeamForm={setEditTeamForm}
                onSubmit={handleUpdateTeamModal}
                onCancel={() => {
                  setShowEditModal(false)
                  setEditingTeam(null)
                }}
                isEditing={true}
              />
            </div>
          </div>
        )}

        {/* Add Team Modal */}
        {showAddTeam && (
          <AddTeamModal
            onClose={() => setShowAddTeam(false)}
            onSubmit={handleAddTeam}
            scrim={scrim}
          />
        )}
      </div>
    </div>
  )
}