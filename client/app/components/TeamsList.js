'use client'

import { Users, Crown, User, Eye, Edit } from 'lucide-react'

export default function TeamsList({ teams, onUpdate, onEdit }) {
  if (teams.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No hay equipos registrados
        </h3>
        <p className="text-slate-600">
          ¡Crea tu primer equipo!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <div key={team.id} className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {team.name}
              </h3>
              <span className="text-orange-600 font-mono text-lg">
                [{team.tag}]
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {team.captain && (
              <div className="flex items-center text-slate-600">
                <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm">
                  {team.captain.name}
                </span>
              </div>
            )}

            <div className="flex items-center text-slate-600">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {Array.isArray(team.players) ? team.players.length : 0} jugadores
              </span>
            </div>

            {Array.isArray(team.players) && team.players.length > 0 && (
              <div className="space-y-1">
                {team.players.slice(0, 3).map((player, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {typeof player === 'string' ? player : player.name}
                    </span>
                    {typeof player === 'object' && player.role && (
                      <span className="text-orange-600 text-xs font-medium">
                        {player.role}
                      </span>
                    )}
                  </div>
                ))}
                {team.players.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{team.players.length - 3} más...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Creado: {new Date(team.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit && onEdit(team)}
                className="btn-elegant-outline text-sm py-2 px-4 flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button className="btn-elegant text-sm py-2 px-4 flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>Ver</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}