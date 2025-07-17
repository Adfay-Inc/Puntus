'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '../utils/api'
import { X, Users } from 'lucide-react'
import TeamDetailedForm from './TeamDetailedForm'
import toast from 'react-hot-toast'

export default function CreateTeamModal({ onClose, onSuccess, editingTeam = null }) {
  const [teamForm, setTeamForm] = useState({
    name: '',
    tag: '',
    logo: '',
    players: ['', '', '', '']
  })
  const [loading, setLoading] = useState(false)
  
  // Cargar datos del equipo si estamos editando
  useEffect(() => {
    if (editingTeam) {
      setTeamForm({
        name: editingTeam.name || '',
        tag: editingTeam.tag || '',
        logo: editingTeam.logo || '',
        players: Array.isArray(editingTeam.players) ? editingTeam.players : ['', '', '', '']
      })
    }
  }, [editingTeam])

  const handleSubmit = async (teamData) => {
    setLoading(true)
    
    try {
      const method = editingTeam ? 'PUT' : 'POST'
      const url = editingTeam ? `/teams/${editingTeam.id}` : '/teams'
      
      await apiCall(url, {
        method,
        body: JSON.stringify(teamData)
      })
      
      toast.success(editingTeam ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-glass max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-puntus-primary" />
              <h2 className="text-2xl font-bold text-white">
                {editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* TeamDetailedForm */}
          <TeamDetailedForm
            teamForm={teamForm}
            setTeamForm={setTeamForm}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isEditing={!!editingTeam}
          />
        </div>
      </div>
    </div>
  )
}