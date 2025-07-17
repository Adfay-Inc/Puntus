"use client"

import { Crown } from "lucide-react"
import TeamLogo from "./TeamLogo" // Asegúrate de que la ruta sea correcta

export default function Top3Tab({ finalTop3 }) {
    if (!finalTop3 || finalTop3.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="text-slate-600 text-lg">No hay datos del Top 3 disponibles.</div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white text-slate-900 font-sans">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center capitalize">
                <span className="gradient-text-only">Podio Final</span>
            </h2>

            <div className="flex justify-center items-end space-x-4 md:space-x-8">
                {finalTop3.map((team) => (
                    <div
                        key={team.id}
                        className={`text-center ${team.position === 1 ? "order-2" : team.position === 2 ? "order-1" : "order-3"}`}
                    >
                        <div className={`relative ${team.position === 1 ? "mb-0" : team.position === 2 ? "mb-8" : "mb-12"}`}>
                            {team.position === 1 && <Crown className="h-8 w-8 text-orange-500 mx-auto mb-2" />}

                            <div className="mb-4">
                                <TeamLogo team={team} size={team.position === 1 ? "w-20 h-20" : "w-16 h-16"} />
                            </div>

                            {/* Position Number Circle */}
                            <div
                                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border-2 ${
                                    team.position === 1
                                        ? "bg-white border-orange-500"
                                        : team.position === 2
                                            ? "bg-white border-slate-300"
                                            : "bg-white border-slate-200"
                                }`}
                            >
                                <span className={team.position === 1 ? "gradient-text-only" : "text-slate-900"}>{team.position}°</span>
                            </div>

                            {/* Team Info Card */}
                            <div className="card-elegant-orange p-4">
                                <h3 className="text-xl font-bold text-slate-900 capitalize">{team.name}</h3>
                                <div className="text-slate-600 font-semibold capitalize">[{team.tag}]</div>
                                <div className="mt-2 space-y-1">
                                    <div className="text-2xl font-bold text-slate-900">{team.totalPoints} pts</div>
                                    <div className="text-sm text-slate-600 capitalize">{team.totalKills} kills</div>
                                    <div className="text-sm text-slate-600 capitalize">{team.wins} victorias</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
