"use client"

import TeamLogo from "./TeamLogo" // Asegúrate de que la ruta sea correcta

// Mapping de nombres de mapa a URLs de imágenes
const mapBackgrounds = {
    Bermuda: "/images/maps/bermuda.webp",
    "Bermuda Remastered": "/images/maps/bermudaRemastered.webp",
    Kalahari: "/images/maps/kalahari.webp",
    Purgatorio: "/images/maps/purgatorio.webp",
    Alpine: "/images/maps/alpine.webp",
    NeXTerra: "/images/maps/neXTerra.webp",
}

export default function MapWinnersTab({ mapWinners }) {
    if (!mapWinners || mapWinners.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="text-slate-600 text-lg">No hay ganadores por mapa disponibles.</div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white text-slate-900 font-sans">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center capitalize">
                <span className="gradient-text-only">Ganadores por Mapa</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mapWinners.map((winner, index) => (
                    <div
                        key={index}
                        className="relative rounded-lg overflow-hidden shadow-lg border border-orange-100 group hover:shadow-xl transition-all duration-300"
                        style={{ minHeight: "280px" }} // Altura mínima para las tarjetas
                    >
                        {/* Imagen de fondo del mapa */}
                        <img
                            src={mapBackgrounds[winner.mapName] || "/placeholder.svg?height=300&width=400"}
                            alt={`Mapa ${winner.mapName}`}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay oscuro para legibilidad */}
                        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
                        {/* Contenido de la tarjeta */}
                        <div className="relative z-10 p-6 text-white text-center flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2 capitalize">{winner.mapName}</h3>
                                <div className="text-sm text-white/80 mb-4">Mapa {index + 1}</div>
                            </div>

                            <div className="mb-4">
                                <TeamLogo team={winner.team} size="w-20 h-20" align="center" />
                            </div>

                            <div className="mb-4">
                                <h4 className="text-lg font-bold capitalize">{winner.team?.name}</h4>
                                <div className="text-orange-200 font-semibold text-sm capitalize">[{winner.team?.tag}]</div>
                            </div>

                            <div className="flex justify-center space-x-6 text-sm">
                                <div className="text-center">
                                    <div className="text-white font-bold text-lg">{winner.kills}</div>
                                    <div className="text-white/70 capitalize">Kills</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-orange-400 font-bold text-lg">{winner.points}</div>
                                    <div className="text-white/70 capitalize">Puntos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
