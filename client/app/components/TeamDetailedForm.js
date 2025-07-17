'use client'

import { useState, useEffect } from 'react'

export default function TeamDetailedForm({ teamForm, setTeamForm, onSubmit, onCancel, isEditing = false }) {
  const [numberOfPlayers, setNumberOfPlayers] = useState(4)
  const [players, setPlayers] = useState(['', '', '', ''])
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  
  // Inicializar valores solo una vez cuando el componente se monte
  useEffect(() => {
    if (teamForm?.players?.length > 0) {
      setNumberOfPlayers(teamForm.players.length)
      setPlayers(teamForm.players)
    }
  }, []) // Solo ejecutar una vez al montar
  
  // Props recibidas - debugging removido

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    setLogoError('')
    
    if (!file) {
      setLogoFile(null)
      setLogoPreview(null)
      return
    }

    // Validaciones del lado del cliente
    if (file.size > 1024 * 1024) { // 1MB
      setLogoError('El archivo debe ser menor a 1MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoError('Solo se permiten archivos de imagen')
      return
    }

    setLogoFile(file)
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async () => {
    if (!logoFile) return null
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)
      
      const response = await fetch('http://localhost:5000/api/upload/logo', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al subir el logo')
      }
      
      const data = await response.json()
      // Logo subido exitosamente
      return data.logoUrl || data.logoPath
    } catch (error) {
      console.error('Error subiendo logo:', error)
      setLogoError(error.message || 'Error al subir el logo')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players]
    newPlayers[index] = value
    setPlayers(newPlayers)
  }

  const handleNumberOfPlayersChange = (e) => {
    const num = parseInt(e.target.value) || 1
    setNumberOfPlayers(num)
    // Ajustar array de jugadores
    const newPlayers = Array(num).fill('')
    // Mantener nombres existentes
    for (let i = 0; i < Math.min(num, players.length); i++) {
      newPlayers[i] = players[i]
    }
    setPlayers(newPlayers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que los primeros 4 jugadores no estén vacíos
    for (let i = 0; i < 4; i++) {
      if (!players[i] || players[i].trim() === '') {
        console.error(`El jugador ${i + 1} es obligatorio`)
        return
      }
    }
    
    const filteredPlayers = players.filter(player => player.trim() !== '')
    
    // Subir logo si hay uno seleccionado
    let logoUrl = teamForm.logo || ''
    if (logoFile) {
      console.log('🔄 UPLOAD - Subiendo logo...')
      const uploadedLogoUrl = await uploadLogo()
      if (!uploadedLogoUrl) {
        console.error('❌ UPLOAD - Error al subir logo')
        return
      }
      logoUrl = uploadedLogoUrl
      console.log('✅ UPLOAD - Logo subido:', logoUrl)
    }
    
    // Pasar los datos completos del equipo al onSubmit
    const finalData = {
      ...teamForm,
      logo: logoUrl,
      players: filteredPlayers
    }
    
    console.log('📤 FORM - Enviando datos del equipo:', finalData)
    
    try {
      await onSubmit(finalData)
      console.log('✅ FORM - Equipo enviado exitosamente')
    } catch (error) {
      console.error('❌ FORM - Error al enviar equipo:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del equipo */}
      <div>
        <label className="block text-slate-600 text-sm font-medium mb-2">
          Nombre del Equipo
        </label>
        <input
          type="text"
          placeholder="Nombre del equipo"
          value={teamForm.name}
          onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          required
        />
      </div>

      {/* TAG del equipo */}
      <div>
        <label className="block text-slate-600 text-sm font-medium mb-2">
          TAG
        </label>
        <input
          type="text"
          placeholder="TAG"
          value={teamForm.tag}
          onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value.toUpperCase() })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase text-center font-mono"
          maxLength="4"
          required
        />
      </div>
      
      {/* Logo del equipo */}
      <div>
        <label className="block text-slate-600 text-sm font-medium mb-2">
          Logo del Equipo
        </label>
        
        <div className="space-y-4">
          {/* Preview del logo */}
          {(logoPreview || teamForm.logo) && (
            <div className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200 bg-slate-100">
                <img 
                  src={logoPreview || (teamForm.logo?.startsWith('http') ? teamForm.logo : `http://localhost:5000${teamForm.logo}`)} 
                  alt="Preview logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imageUrl = logoPreview || (teamForm.logo?.startsWith('http') ? teamForm.logo : `http://localhost:5000${teamForm.logo}`)
                    console.log('❌ IMAGE - Error cargando logo:', imageUrl)
                    console.log('❌ IMAGE - teamForm.logo original:', teamForm.logo)
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                  onLoad={(e) => {
                    const imageUrl = logoPreview || (teamForm.logo?.startsWith('http') ? teamForm.logo : `http://localhost:5000${teamForm.logo}`)
                    console.log('✅ IMAGE - Logo cargado exitosamente:', imageUrl)
                  }}
                />
                <div className="w-full h-full hidden items-center justify-center bg-orange-500 text-white text-xs font-bold">
                  {teamForm.tag || '?'}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {logoPreview 
                  ? 'Preview del nuevo logo' 
                  : (isEditing ? 'Logo actual (haz clic en "Cambiar Logo" para modificar)' : 'Logo actual')
                } (se redimensionará a 512x512px)
              </div>
            </div>
          )}

          {/* Input de archivo */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label 
              htmlFor="logo-upload"
              className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg cursor-pointer transition-all font-medium"
            >
              📁 {isEditing ? 'Cambiar Logo' : 'Seleccionar Logo'}
            </label>
          </div>


          {/* Info del logo */}
          <div className="text-slate-500 text-xs space-y-1">
            <p>• Tamaño recomendado: 512x512px</p>
            <p>• Formato: JPG, PNG, GIF</p>
            <p>• Tamaño máximo: 1MB</p>
            <p>• Se redimensionará automáticamente</p>
          </div>

          {logoError && (
            <div className="text-red-600 text-sm font-medium">{logoError}</div>
          )}
        </div>
      </div>

      {/* Cantidad de jugadores */}
      <div>
        <label className="block text-slate-600 text-sm font-medium mb-2">
          Cantidad de Jugadores
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="4"
            max="6"
            value={numberOfPlayers}
            onChange={handleNumberOfPlayersChange}
            className="w-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <span className="text-slate-600 text-sm">jugadores (máximo 6)</span>
        </div>
      </div>

      {/* Nombres de jugadores */}
      <div>
        <label className="block text-slate-600 text-sm font-medium mb-2">
          Nombres de Jugadores
        </label>
        <p className="text-slate-500 text-sm mb-4">
          Los primeros 4 jugadores son obligatorios. Los jugadores 5 y 6 son opcionales.
        </p>
        
        <div className="space-y-3">
          {players.slice(0, numberOfPlayers).map((player, index) => (
            <div key={index}>
              <label className="block text-slate-500 text-xs mb-1">
                Jugador {index + 1} {index < 4 ? '(obligatorio)' : '(opcional)'}
              </label>
              <input
                type="text"
                placeholder={`Nombre del jugador ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required={index < 4}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-elegant-outline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : (isEditing ? 'Actualizar' : 'Agregar')}
        </button>
      </div>
    </form>
  )
}