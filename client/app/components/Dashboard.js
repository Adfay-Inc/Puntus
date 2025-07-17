'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiCall } from '../utils/api'
import { Trophy, Gamepad2, Plus } from 'lucide-react'
import ScrimsList from './ScrimsList'
import MatchesList from './MatchesList'
import CreateScrimModal from './CreateScrimModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('scrims')
  const [scrims, setScrims] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateScrim, setShowCreateScrim] = useState(false)
  const [editingScrim, setEditingScrim] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [scrimsData, matchesData] = await Promise.all([
        apiCall('/scrims'),
        apiCall('/matches')
      ])
      
      setScrims(scrimsData)
      setMatches(matchesData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditScrim = (scrim) => {
    setEditingScrim(scrim)
    setShowCreateScrim(true)
  }

  const handleDeleteScrim = async (scrim) => {
    // Mensaje de confirmación según el estado de la scrim
    let confirmMessage = `¿Estás seguro de eliminar la scrim "${scrim.name}"?`
    
    if (scrim.status === 'active') {
      confirmMessage += '\n\n⚠️ ATENCIÓN: Esta scrim está ACTIVA. Se perderán todos los resultados registrados.'
    } else if (scrim.status === 'completed') {
      confirmMessage += '\n\n⚠️ ATENCIÓN: Esta scrim está COMPLETADA. Se perderán todos los resultados finales.'
    } else if (scrim.status === 'pending') {
      confirmMessage += '\n\nEsta acción no se puede deshacer.'
    }
    
    if (!confirm(confirmMessage)) return

    try {
      await apiCall(`/scrims/${scrim.id}`, { method: 'DELETE' })
      console.log(`Scrim "${scrim.name}" eliminada exitosamente`)
      loadDashboardData()
    } catch (error) {
      console.error('Error al eliminar scrim:', error.message || error)
    }
  }

  // Debug: verificar estructura del usuario
  console.log('DEBUG - User object:', user)
  console.log('DEBUG - User role:', user?.role)
  
  const canCreateScrims = !!user  // Cualquier usuario autenticado puede gestionar scrims
  
  console.log('DEBUG - canCreateScrims:', canCreateScrims)

  const tabs = [
    { id: 'scrims', label: 'Scrims', icon: Trophy, count: scrims.length },
    { id: 'matches', label: 'Partidas', icon: Gamepad2, count: matches.length }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 capitalize">
              ¡Bienvenido, <span className="gradient-text-only">{user.username}</span>!
            </h1>
            <p className="text-slate-600 text-lg">
              Gestiona tus scrims de Free Fire desde aquí
            </p>
          </div>
          <div className="hidden md:block">
            <div className="icon-container-gradient w-20 h-20">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-2 mb-8">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all flex-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'scrims' && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900 capitalize">
                Scrims <span className="gradient-text-only">Disponibles</span>
              </h2>
              {canCreateScrims && (
                <button
                  onClick={() => setShowCreateScrim(true)}
                  className="btn-gradient flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Crear Scrim</span>
                </button>
              )}
            </div>
            <ScrimsList 
              scrims={scrims} 
              onUpdate={loadDashboardData}
              onEdit={canCreateScrims ? handleEditScrim : null}
              onDelete={canCreateScrims ? handleDeleteScrim : null}
            />
          </div>
        )}



        {activeTab === 'matches' && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 capitalize">
              Partidas <span className="gradient-text-only">Recientes</span>
            </h2>
            <MatchesList matches={matches} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateScrim && (
        <CreateScrimModal
          onClose={() => {
            setShowCreateScrim(false)
            setEditingScrim(null)
          }}
          onSuccess={() => {
            loadDashboardData()
            setEditingScrim(null)
          }}
          editingScrim={editingScrim}
        />
      )}

    </div>
  )
}