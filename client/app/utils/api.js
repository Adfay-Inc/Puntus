// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Función para hacer peticiones API
export async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log('DEBUG API - Haciendo request a:', url)
    
    // Obtener token del localStorage si existe
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Añadir token de autorización si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url, {
      headers,
      credentials: 'include',
      ...options
    })
    
    console.log('DEBUG API - Response status:', response.status)
    console.log('DEBUG API - Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('DEBUG API - Response no es JSON:', text.substring(0, 200))
      throw new Error('Respuesta del servidor no es JSON válido')
    }
    
    const data = await response.json()
    console.log('DEBUG API - Response data:', data)
    
    if (!response.ok) {
      throw new Error(data.msg || data.message || 'Error en la petición')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}