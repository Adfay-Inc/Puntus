'use client'

import { useState } from 'react'
import { X, Users } from 'lucide-react'
import TeamDetailedForm from './TeamDetailedForm'

export default function AddTeamModal({ onClose, onSubmit, scrim }) {
  const [teamForm, setTeamForm] = useState({ 
    name: '', 
    tag: '', 
    logo: '', 
    players: [] 
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)
    
    try {
      if (!teamForm.name.trim() || !teamForm.tag.trim()) {
        setSubmitError('Nombre y TAG son requeridos')
        return
      }

      // Subir logo si hay uno seleccionado
      let logoUrl = ''
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo()
        if (!uploadedLogoUrl) {
          setSubmitError('Error al subir el logo. Inténtalo sin logo o con otro archivo.')
          return
        }
        logoUrl = uploadedLogoUrl
      }

      const finalTeamData = {
        ...teamForm,
        logo: logoUrl
      }
      
      await onSubmit(finalTeamData)
      
    } catch (error) {
      setSubmitError('Error al crear el equipo: ' + (error.message || 'Error desconocido'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDetailedSubmit = async (teamData) => {
    console.log('🔄 MODAL - Recibido equipo detallado:', teamData.name, teamData.tag)
    
    setSubmitError('')
    setIsSubmitting(true)
    
    try {
      await onSubmit(teamData)
      console.log('✅ MODAL - Equipo procesado exitosamente')
    } catch (error) {
      console.error('❌ MODAL - Error al procesar equipo:', error)
      setSubmitError('Error al crear el equipo: ' + (error.message || 'Error desconocido'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTeamForm({ name: '', tag: '', logo: '', players: [] })
    setLogoFile(null)
    setLogoPreview(null)
    setLogoError('')
    setSubmitError('')
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-elegant-orange max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="icon-container-gradient w-12 h-12">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize">
              Agregar <span className="gradient-text-only">Equipo</span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {scrim?.settings?.isDetailed ? (
          // Formulario detallado
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 capitalize">
                Registro <span className="gradient-text-only">Detallado</span>
              </h3>
              <p className="text-slate-600 text-sm">
                Completa la información del equipo y todos los jugadores
              </p>
            </div>
            
            <TeamDetailedForm 
              teamForm={teamForm}
              setTeamForm={setTeamForm}
              onSubmit={handleDetailedSubmit}
              onCancel={handleClose}
            />
          </div>
        ) : (
          // Formulario simple
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 capitalize">
                Registro <span className="gradient-text-only">Rápido</span>
              </h3>
              <p className="text-slate-600 text-sm">
                Solo necesitas el nombre y TAG del equipo
              </p>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Team Phoenix"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">
                  TAG del Equipo
                </label>
                <input
                  type="text"
                  placeholder="PHX"
                  value={teamForm.tag}
                  onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase text-center font-mono"
                  maxLength="4"
                  required
                />
                <p className="text-slate-500 text-xs mt-1">
                  Máximo 4 caracteres - Se convertirá a mayúsculas automáticamente
                </p>
              </div>

              {/* Logo del equipo */}
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">
                  Logo del Equipo (opcional)
                </label>
                
                <div className="space-y-4">
                  {/* Preview del logo */}
                  {logoPreview && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200 bg-slate-100">
                        <img 
                          src={logoPreview} 
                          alt="Preview logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm text-slate-600">
                        Preview del logo (se redimensionará a 512x512px)
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
                      id="logo-upload-simple"
                    />
                    <label 
                      htmlFor="logo-upload-simple"
                      className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg cursor-pointer transition-all font-medium"
                    >
                      📁 Seleccionar Logo
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

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 text-sm font-medium">{submitError}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-elegant-outline"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Agregando...' : 'Agregar Equipo'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}