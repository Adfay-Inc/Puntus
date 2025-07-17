"use client"
import { useState } from "react"

export default function TeamLogo({ team, size = "w-10 h-10", align = "center" }) {
    const [imageError, setImageError] = useState(false)
    const logoUrl = team?.logo?.startsWith("http") ? team.logo : `http://localhost:5000${team?.logo}`

    const alignmentClass = align === "center" ? "mx-auto" : "" // No class needed for left, as it's default or handled by parent flex

    return (
        <div>
            {imageError || !team?.logo ? (
                <div
                    className={`${size} bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm ${alignmentClass}`}
                >
                    {team?.tag || "?"}
                </div>
            ) : (
                <img
                    src={logoUrl || "/placeholder.svg"}
                    alt={`Logo ${team?.name}`}
                    className={`${size} rounded-full object-cover border border-orange-500/50 block ${alignmentClass}`}
                    onError={() => setImageError(true)}
                />
            )}
        </div>
    )
}
