'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(email, password)
    } catch (error) {
      console.error('Error de login:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="icon-container-gradient w-16 h-16 mx-auto mb-4">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 capitalize">
          Iniciar <span className="gradient-text-only">Sesión</span>
        </h2>
        <p className="text-slate-600 mt-2 capitalize">
          Ingresa a tu cuenta para gestionar scrims
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-2 capitalize">
            Email
          </label>
          <div className="relative">
            <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="group w-full btn-gradient flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
          {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="text-center mt-8 pt-8 border-t border-slate-200">
        <span className="text-slate-600">¿No tienes cuenta? </span>
        <a
          href="https://api.whatsapp.com/send?phone=+527714539343&text=Quiero%20una%20demostraci%C3%B3n%20o%20comprar%20el%20sistema%20Puntus.%20%C2%BFC%C3%B3mo%20seguimos%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-text-only font-semibold hover:opacity-80 transition-opacity"
        >
          Solicitar acceso
        </a>
      </div>
    </div>
  )
}