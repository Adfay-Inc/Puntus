'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserPlus, User, Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterForm({ onToggle }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await register(formData.username, formData.email, formData.password, formData.role)
    } catch (error) {
      console.error('Error de registro:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="icon-container-gradient w-16 h-16 mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 capitalize">
          Crear <span className="gradient-text-only">Cuenta</span>
        </h2>
        <p className="text-slate-600 mt-2 capitalize">
          Únete a la comunidad de torneos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-2 capitalize">
            Usuario
          </label>
          <div className="relative">
            <User className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Mi usuario"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-2 capitalize">
            Email
          </label>
          <div className="relative">
            <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-2 capitalize">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-2 capitalize">
            Rol
          </label>
          <div className="relative">
            <Shield className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="user">Usuario</option>
              <option value="creator">Creador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full btn-gradient flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Creando cuenta...' : 'Registrarse'}</span>
          {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="text-center mt-8 pt-8 border-t border-slate-200">
        <span className="text-slate-600">¿Ya tienes cuenta? </span>
        <button
          onClick={onToggle}
          className="gradient-text-only font-semibold hover:opacity-80 transition-opacity"
        >
          Inicia sesión
        </button>
      </div>
    </div>
  )
}