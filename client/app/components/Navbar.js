'use client'

import { useAuth } from '../context/AuthContext'
import { Flame, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '../../components/ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="nav-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Flame className="h-8 w-8 text-puntus-primary" />
              <div className="absolute inset-0 h-8 w-8 text-puntus-primary animate-pulse opacity-50" />
            </div>
            <div>
              <span className="text-text-primary text-xl font-bold tracking-tight">Puntus</span>
              <span className="text-text-secondary text-sm ml-2 font-medium">by Adfay</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-text-secondary">
                  Hola, <span className="font-semibold text-text-primary">{user.username}</span>
                </span>
                <span className="px-3 py-1 text-xs bg-gradient-to-r from-puntus-primary to-puntus-secondary text-white rounded-full font-medium capitalize">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <div className="text-text-secondary">
                Cargando...
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}