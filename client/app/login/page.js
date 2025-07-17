'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame, ArrowLeft } from 'lucide-react'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar nada (está redirigiendo)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <nav className="nav-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Flame className="h-8 w-8 text-orange-500" />
                <div className="absolute inset-0 h-8 w-8 text-orange-500 animate-pulse opacity-50" />
              </div>
              <div>
                <span className="text-slate-900 text-xl font-bold tracking-tight">Puntus</span>
                <span className="text-slate-500 text-sm ml-2 font-medium">by Adfay</span>
              </div>
            </Link>

            {/* Back to home */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
            
            {/* Form */}
            <div className="relative z-10">
              <LoginForm />
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600">
              ¿Necesitas ayuda? Contacta a <span className="gradient-text-only font-semibold">soporte@puntus.com</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}