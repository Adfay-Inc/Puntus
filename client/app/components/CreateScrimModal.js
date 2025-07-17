'use client'

import { useState } from 'react'
import { apiCall } from '../utils/api'
import { X, Trophy } from 'lucide-react'

export default function CreateScrimModal({ onClose, onSuccess, editingScrim }) {
  const [formData, setFormData] = useState({
    name: editingScrim?.name || '',
    numberOfTeams: editingScrim?.maxTeams || '',
    killPoints: editingScrim?.pointSystem?.killPoints || 1,
    numberOfMaps: editingScrim?.maps?.length || 1,
    isDetailed: editingScrim?.settings?.isDetailed || false
  })
  const currentTeamsCount = editingScrim?.Teams?.length || 0
  const [selectedMaps, setSelectedMaps] = useState(
    editingScrim?.maps && Array.isArray(editingScrim.maps) 
      ? editingScrim.maps 
      : [null]
  )
  const [placementPoints, setPlacementPoints] = useState({
    1: editingScrim?.pointSystem?.placement?.first || 12,
    2: editingScrim?.pointSystem?.placement?.second || 9,
    3: editingScrim?.pointSystem?.placement?.third || 8,
    4: editingScrim?.pointSystem?.placement?.fourth || 7,
    5: editingScrim?.pointSystem?.placement?.fifth || 6,
    6: editingScrim?.pointSystem?.placement?.sixth || 5,
    7: editingScrim?.pointSystem?.placement?.seventh || 4,
    8: editingScrim?.pointSystem?.placement?.eighth || 3,
    9: editingScrim?.pointSystem?.placement?.ninth || 2,
    10: editingScrim?.pointSystem?.placement?.tenth || 1,
    11: editingScrim?.pointSystem?.placement?.eleventh || 0,
    12: editingScrim?.pointSystem?.placement?.twelfth || 0
  })
  const [loading, setLoading] = useState(false)

  const availableMaps = [
    { value: 'Bermuda', label: 'Bermuda', description: 'el mapa clásico, urbano-rural, ideal para combates equilibrados' },
    { value: 'Bermuda Remastered', label: 'Bermuda Remastered', description: 'versión modernizada del original, con mejoras en diseño y loot' },
    { value: 'Kalahari', label: 'Kalahari', description: 'un desierto pequeño con terreno elevado y tiroteos intensos' },
    { value: 'Purgatorio', label: 'Purgatorio', description: 'zonas rurales, colinas y combates a media-larga distancia' },
    { value: 'Alpine', label: 'Alpine', description: 'terreno nevado montañoso con áreas como Snowfall, Ski Resort y Dock' },
    { value: 'NeXTerra', label: 'NeXTerra', description: 'distópico/futurista, con combate vertical y zonas de gravedad cero' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleMapSelect = (index, map) => {
    const newMaps = [...selectedMaps]
    newMaps[index] = map
    setSelectedMaps(newMaps)
  }

  const handleNumberOfMapsChange = (e) => {
    const num = parseInt(e.target.value) || 1
    setFormData({ ...formData, numberOfMaps: num })
    
    // Ajustar array de mapas seleccionados
    const newMaps = Array(num).fill(null)
    // Mantener mapas previamente seleccionados
    for (let i = 0; i < Math.min(num, selectedMaps.length); i++) {
      newMaps[i] = selectedMaps[i]
    }
    setSelectedMaps(newMaps)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validMaps = selectedMaps.filter(map => map !== null && map !== '')
    console.log('Validación mapas:')
    console.log('validMaps:', validMaps)
    console.log('validMaps.length:', validMaps.length)
    console.log('formData.numberOfMaps:', formData.numberOfMaps)
    
    if (validMaps.length !== parseInt(formData.numberOfMaps)) {
      console.error(`Debes seleccionar ${formData.numberOfMaps} mapas. Tienes ${validMaps.length} seleccionados.`)
      return
    }

    setLoading(true)
    
    try {
      const numTeams = parseInt(formData.numberOfTeams)
      if (!numTeams || numTeams < 2 || numTeams > 12) {
        console.error('El número de equipos debe estar entre 2 y 12')
        return
      }
      
      // Si estamos editando, verificar que no se reduzca por debajo de equipos registrados
      if (editingScrim && currentTeamsCount > 0 && numTeams < currentTeamsCount) {
        console.error(`No puedes reducir el límite a ${numTeams} equipos. Ya hay ${currentTeamsCount} equipos registrados.`)
        return
      }

      const filteredMaps = selectedMaps.filter(map => map !== null && map !== '')
      
      console.log('DEBUG Frontend:')
      console.log('selectedMaps:', selectedMaps)
      console.log('filteredMaps:', filteredMaps)
      console.log('numberOfMaps:', formData.numberOfMaps)
      
      const scrimData = {
        name: formData.name,
        minTeams: numTeams,
        maxTeams: numTeams,
        maps: filteredMaps,
        pointSystem: {
          placement: {
            first: placementPoints[1],
            second: placementPoints[2],
            third: placementPoints[3],
            fourth: placementPoints[4],
            fifth: placementPoints[5],
            sixth: placementPoints[6],
            seventh: placementPoints[7],
            eighth: placementPoints[8],
            ninth: placementPoints[9],
            tenth: placementPoints[10],
            eleventh: placementPoints[11],
            twelfth: placementPoints[12]
          },
          killPoints: parseInt(formData.killPoints)
        },
        settings: {
          isDetailed: formData.isDetailed,
          password: null,
          isPrivate: false,
          discordChannel: null,
          rules: null,
          maxPlayersPerTeam: 4,
          allowSubstitutes: true
        }
      }
      
      console.log('Enviando scrimData:', scrimData)
      
      if (editingScrim) {
        await apiCall(`/scrims/${editingScrim.id}`, {
          method: 'PUT',
          body: JSON.stringify(scrimData)
        })
        console.log('Scrim actualizada exitosamente')
      } else {
        await apiCall('/scrims', {
          method: 'POST',
          body: JSON.stringify(scrimData)
        })
        console.log('Scrim creada exitosamente')
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-elegant-orange max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="icon-container-gradient w-12 h-12">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize">
              {editingScrim ? 'Editar' : 'Crear Nueva'} <span className="gradient-text-only">Scrim</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Nombre de la Scrim
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Scrim de Práctica"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Número de Equipos
            </label>
            <input
              type="number"
              name="numberOfTeams"
              value={formData.numberOfTeams}
              onChange={handleChange}
              min="2"
              max="12"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Ingresa un número entre 2 y 12"
              required
            />
            {editingScrim && currentTeamsCount > 0 && (
              <p className="text-orange-600 text-sm mt-1 font-medium">
                ⚠️ Ya hay {currentTeamsCount} equipos registrados. No puedes reducir el límite por debajo de este número.
              </p>
            )}
            {!editingScrim && (
              <p className="text-slate-500 text-sm mt-1">
                Solo podrás continuar si ingresas un número válido entre 2 y 12
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Número de Mapas
            </label>
            <input
              type="number"
              name="numberOfMaps"
              value={formData.numberOfMaps}
              onChange={handleNumberOfMapsChange}
              min="1"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="¿Cuántos mapas se jugarán?"
              required
            />
          </div>

          {formData.numberOfMaps > 0 && (
            <div className="space-y-3">
              <label className="block text-slate-600 text-sm font-medium">
                Selecciona los mapas a jugar
              </label>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {selectedMaps.map((selectedMap, index) => (
                  <div key={index}>
                    <label className="block text-slate-500 text-sm mb-1">
                      Mapa {index + 1}
                    </label>
                    <select
                      value={selectedMap || ''}
                      onChange={(e) => handleMapSelect(index, e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Selecciona un mapa</option>
                      {availableMaps.map(map => (
                        <option 
                          key={map.value} 
                          value={map.value}
                        >
                          {map.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de Scrim */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-slate-600 text-sm font-medium mb-3">
              Tipo de Scrim
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors">
                <input
                  type="radio"
                  name="scrimType"
                  checked={!formData.isDetailed}
                  onChange={() => setFormData({ ...formData, isDetailed: false })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="text-slate-900 font-medium">Simple</span>
                  <p className="text-slate-500 text-xs">Solo nombre y tag de equipos</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors">
                <input
                  type="radio"
                  name="scrimType"
                  checked={formData.isDetailed}
                  onChange={() => setFormData({ ...formData, isDetailed: true })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="text-slate-900 font-medium">Detallada</span>
                  <p className="text-slate-500 text-xs">Con nombres de jugadores</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Puntos por Kill
            </label>
            <input
              type="number"
              name="killPoints"
              value={formData.killPoints}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Puntos por Posición
            </label>
            <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(position => (
                <div key={position} className="flex items-center space-x-2">
                  <label className="text-slate-600 text-sm w-8 font-medium">
                    {position}°:
                  </label>
                  <input
                    type="number"
                    value={placementPoints[position]}
                    onChange={(e) => setPlacementPoints({
                      ...placementPoints,
                      [position]: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Sistema por defecto: 1°=12, 2°=9, 3°=8, 4°=7, 5°=6, 6°=5, 7°=4, 8°=3, 9°=2, 10°=1, 11°-12°=0
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-elegant-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.numberOfTeams || parseInt(formData.numberOfTeams) < 2 || parseInt(formData.numberOfTeams) > 12}
              className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editingScrim ? 'Actualizando...' : 'Creando...') : (editingScrim ? 'Actualizar Scrim' : 'Crear Scrim')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}