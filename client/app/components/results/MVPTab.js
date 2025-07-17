'use client'

import { Star, Target, Trophy, User, Shield } from 'lucide-react'
import TeamLogo from './TeamLogo'

export default function MVPTab({ globalMVP, scrim }) {
  if (!scrim.settings?.isDetailed) {
    return null
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[600px]">
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center">
        <span className="gradient-text-only">MVP Global del Torneo</span>
      </h2>
      
      {globalMVP ? (
        <div className="max-w-2xl mx-auto">
          {/* Card principal */}
          <div className="relative bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600 p-[2px] rounded-2xl shadow-2xl">
            <div className="bg-white rounded-2xl p-8">
              {/* Header con corona */}
              <div className="relative text-center mb-8">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  <Trophy className="h-12 w-12 text-pink-500 animate-pulse" />
                </div>
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
                  <h3 className="text-5xl font-black mb-1">MVP</h3>
                  <p className="text-lg font-semibold">JUGADOR MÁS VALIOSO</p>
                </div>
              </div>

              {/* Información del jugador */}
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                {/* Logo y equipo */}
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-50"></div>
                    <TeamLogo team={globalMVP.team} size="w-32 h-32" align="center" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-900">{globalMVP.team.name}</h4>
                    <p className="text-pink-600 font-mono font-semibold text-lg">[{globalMVP.team.tag}]</p>
                  </div>
                </div>

                {/* Nombre del jugador */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <User className="h-5 w-5 text-slate-600 mr-2" />
                    <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">Jugador</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{globalMVP.name}</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full">
                    <Shield className="h-4 w-4 text-pink-600 mr-1" />
                    <span className="text-sm font-semibold text-pink-800">Elite Player</span>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kills totales */}
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                      <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-slate-900">{globalMVP.totalKills}</div>
                      <div className="text-sm font-medium text-slate-600">Kills Totales</div>
                    </div>
                  </div>

                  {/* Promedio por mapa */}
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                      <Star className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-slate-900">
                        {globalMVP.averageKills || (scrim.maps ? (globalMVP.totalKills / scrim.maps.length).toFixed(1) : '0')}
                      </div>
                      <div className="text-sm font-medium text-slate-600">Promedio/Mapa</div>
                    </div>
                  </div>

                  {/* Puntos por kills */}
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                      <Trophy className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-slate-900">{globalMVP.totalPoints || globalMVP.totalKills}</div>
                      <div className="text-sm font-medium text-slate-600">Puntos por Kills</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer motivacional */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-lg">
                  <Trophy className="h-5 w-5 text-white mr-2" />
                  <span className="text-white font-bold text-lg">¡Leyenda del Torneo!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-slate-100 rounded-full p-6 mb-4">
            <Trophy className="h-12 w-12 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium">No hay datos de MVP disponibles</p>
          <p className="text-slate-500 text-sm mt-2">Los datos aparecerán cuando se registren resultados</p>
        </div>
      )}
    </div>
  )
}