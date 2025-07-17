"use client"

import { Target, Award } from "lucide-react"
import TeamLogo from "./TeamLogo" // Asegúrate de que la ruta sea correcta

export default function LeaderboardTab({ scrim, leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="text-slate-600 text-lg">No hay datos de clasificación disponibles.</div>
        </div>
    )
  }

  return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-white text-slate-900 font-sans">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center capitalize">
          <span className="gradient-text-only">Tabla de Clasificación</span>
        </h2>

        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-orange-100">
          <table className="w-full min-w-max">
            <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-slate-600 font-semibold py-3 px-2 w-16 capitalize">Pos</th>
              <th className="text-left text-slate-600 font-semibold py-3 px-4 min-w-48 capitalize">Equipo</th>
              {scrim.maps.map((mapName, index) => (
                  <th key={mapName} className="text-center text-slate-600 font-semibold py-3 px-3 min-w-28 capitalize">
                    <div className="text-sm">{mapName}</div>
                    <div className="text-xs text-slate-500 mt-1">Mapa {index + 1}</div>
                  </th>
              ))}
              <th className="text-center text-slate-600 font-semibold py-3 px-3 min-w-24 capitalize">
                <div className="flex items-center justify-center">
                  <Target className="h-4 w-4 mr-1 text-orange-500" />
                  <div>
                    <div className="text-sm">Kills</div>
                    <div className="text-xs text-slate-500">Puntos</div>
                  </div>
                </div>
              </th>
              <th className="text-center text-slate-600 font-semibold py-3 px-3 min-w-24 capitalize">
                <div className="flex items-center justify-center">
                  <Award className="h-4 w-4 mr-1 text-orange-500" />
                  <div>
                    <div className="text-sm">Total</div>
                    <div className="text-xs text-slate-500">Puntos</div>
                  </div>
                </div>
              </th>
            </tr>
            </thead>
            <tbody>
            {leaderboard.map((team) => (
                <tr key={team.id} className="border-b border-slate-100 hover:bg-orange-50 transition-colors">
                  <td className="py-4 px-2">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            team.position === 1
                                ? "bg-white border-2 border-orange-500 text-orange-500" // 1st place: white background, orange border, orange text
                                : team.position === 2
                                    ? "bg-white border-2 border-slate-400 text-slate-900" // 2nd place: white background, gray border, dark text
                                    : team.position === 3
                                        ? "bg-white border-2 border-slate-300 text-slate-900" // 3rd place: white background, lighter gray border, dark text
                                        : "bg-white border-2 border-slate-100 text-slate-900" // Others: white background, lightest gray border, dark text
                        }`}
                    >
                      {team.position}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <TeamLogo team={team} size="w-10 h-10" />
                      <div>
                        <div className="text-slate-900 font-semibold capitalize">{team.name}</div>
                        <div className="text-slate-500 text-sm capitalize">[{team.tag}]</div> {/* Tag color adjusted */}
                      </div>
                    </div>
                  </td>

                  {scrim.maps.map((mapName) => {
                    const mapResult = team.mapResults[mapName]
                    return (
                        <td key={mapName} className="py-4 px-3 text-center">
                          {mapResult.placement ? (
                              <div>
                                <div className="text-slate-900 font-bold text-lg">{mapResult.totalPoints}</div>
                                <div className="text-xs text-slate-600 capitalize">{mapResult.placement}° lugar</div>
                                <div className="text-xs text-slate-600">
                                  {mapResult.placementPoints}+{mapResult.killPoints}
                                </div>
                              </div>
                          ) : (
                              <div className="text-slate-400 text-sm">-</div>
                          )}
                        </td>
                    )
                  })}

                  <td className="py-4 px-3 text-center">
                    <div className="text-slate-900 font-bold text-lg">{team.totalKillPoints}</div>
                    <div className="text-xs text-slate-600 capitalize">{team.totalKills} kills</div>
                  </td>

                  <td className="py-4 px-3 text-center">
                    <div className="text-orange-500 font-bold text-xl">{team.totalPoints}</div>{" "}
                    {/* Total points color adjusted */}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  )
}
