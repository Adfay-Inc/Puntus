"use client"

import { Crown } from "lucide-react"
import TeamLogo from "./TeamLogo" // Asegúrate de que la ruta sea correcta según tu estructura de carpetas

export default function WinnerTab({ scrim, leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="text-slate-600 text-lg">No hay datos de ganador disponibles.</div>
        </div>
    )
  }

  const winner = leaderboard[0]

  return (
      <div className="p-8 from-slate-50 to-white text-slate-900 font-sans">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 flex items-center justify-center capitalize">
            <Crown className="h-8 w-8 mr-3 text-orange-500" />
            <span className="gradient-text-only">Campeón del Torneo</span>
            <Crown className="h-8 w-8 ml-3 text-orange-500" />
          </h2>
        </div>

        {/* Ganador destacado */}
        <div className="max-w-2xl mx-auto">
          <div className="relative card-elegant-orange p-8 md:p-12">
            {/* Corona y posición */}
            <div className="flex flex-col items-center">
              <Crown className="h-16 w-16 text-orange-500 mx-auto" />
            </div>

            {/* Logo del equipo ganador */}
            <div>
              <TeamLogo team={winner} size="w-32 h-32" />
            </div>

            {/* Información del ganador */}
            <div>
              <h3 className="text-center text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 capitalize">
                {winner.name}
                <span className="text-xl gradient-text-only font-bold"> {winner.tag}</span>
              </h3>

              {/* Estadísticas principales */}
              <div className="mb-8 mt-8 bg-orange-50/50 rounded-2xl p-6 mb-6 text-center">
                <div className="text-4xl font-extrabold gradient-text-only mb-2">{winner.totalPoints}</div>
                <div className="text-slate-600 text-lg font-semibold capitalize">Puntos Totales</div>
              </div>

              {/* Estadísticas detalladas */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-orange-50/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900">{winner.totalKills}</div>
                  <div className="text-slate-600 text-sm capitalize">Kills</div>
                </div>
                <div className="bg-orange-50/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900">{winner.wins}</div>
                  <div className="text-slate-600 text-sm capitalize">Victorias</div>
                </div>
                <div className="bg-orange-50/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900">{winner.top3Finishes}</div>
                  <div className="text-slate-600 text-sm capitalize">Top 3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
