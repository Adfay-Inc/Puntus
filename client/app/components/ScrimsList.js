'use client'

import { Trophy, Users, Map, Eye, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ScrimsList({ scrims, onUpdate, onEdit, onDelete }) {
  if (scrims.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No hay scrims disponibles
        </h3>
        <p className="text-slate-600">
          ¡Sé el primero en crear una scrim!
        </p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'active': return 'Activa'
      case 'completed': return 'Completada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scrims.map((scrim) => (
        <div key={scrim.id} className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-slate-900 truncate">
              {scrim.name}
            </h3>
            <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(scrim.status)}`}>
              {getStatusText(scrim.status)}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-slate-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {scrim.Teams ? scrim.Teams.length : 0}/{scrim.maxTeams} equipos
              </span>
            </div>

            <div className="flex items-center text-slate-600">
              <Map className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {Array.isArray(scrim.maps) ? scrim.maps.length : 0} mapas
              </span>
            </div>

            {scrim.maps && Array.isArray(scrim.maps) && scrim.maps.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {scrim.maps.slice(0, 3).map((map, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded font-medium"
                  >
                    {typeof map === 'string' ? map : map.name || map}
                  </span>
                ))}
                {scrim.maps.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                    +{scrim.maps.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Creado: {new Date(scrim.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              {scrim.status === 'pending' && onEdit && (
                <button
                  onClick={() => onEdit(scrim)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Editar scrim"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(scrim)}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                  title="Eliminar scrim"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <Link href={`/scrim/${scrim.id}`} className="btn-elegant text-sm py-2 px-4 flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>Ver</span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}