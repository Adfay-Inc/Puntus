'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiCall } from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Solo verificar autenticación si hay un token guardado
      const token = localStorage.getItem('token')
      console.log('DEBUG checkAuth - Token encontrado:', !!token)
      
      if (!token) {
        console.log('DEBUG checkAuth - No hay token, configurando user como null')
        setUser(null)
        setLoading(false)
        return
      }
      
      // Intentar recuperar usuario del localStorage primero
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('DEBUG checkAuth - Usuario recuperado del localStorage:', parsedUser)
          setUser(parsedUser)
        } catch (e) {
          console.log('DEBUG checkAuth - Error parseando usuario guardado:', e)
        }
      }
      
      console.log('DEBUG checkAuth - Verificando token con servidor...')
      const response = await apiCall('/auth/me')
      console.log('DEBUG checkAuth - Respuesta del servidor:', response)
      setUser(response.user)
      
      // Actualizar localStorage con datos frescos
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
    } catch (error) {
      console.error('DEBUG checkAuth - Error:', error)
      console.log('DEBUG checkAuth - Limpiando tokens inválidos')
      
      // Si hay error, limpiar token inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    console.log('DEBUG login - Iniciando login para:', email)
    
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    console.log('DEBUG login - Respuesta del login:', response)
    
    // Guardar token y usuario en localStorage
    if (response.token) {
      console.log('DEBUG login - Guardando token en localStorage')
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Verificar que se guardó correctamente
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      console.log('DEBUG login - Token guardado verificado:', !!savedToken)
      console.log('DEBUG login - Usuario guardado verificado:', !!savedUser)
    } else {
      console.error('DEBUG login - No se recibió token en la respuesta')
    }
    
    setUser(response.user)
    console.log('DEBUG login - Usuario configurado en estado:', response.user)
    return response
  }

  const register = async (username, email, password, role = 'user') => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    })
    
    // Guardar token y usuario en localStorage
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    setUser(response.user)
    return response
  }

  const logout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignorar errores de logout, limpiar de todas formas
    }
    
    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}