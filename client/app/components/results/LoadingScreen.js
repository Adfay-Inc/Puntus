'use client'

export default function LoadingScreen({ message = "Cargando resultados..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <div className="text-slate-600 font-medium">{message}</div>
      </div>
    </div>
  )
}