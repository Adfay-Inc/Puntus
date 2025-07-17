'use client'

import { Trophy } from 'lucide-react'
import Link from 'next/link'

export default function ErrorScreen({ 
  title = "Error", 
  message = "Ha ocurrido un error", 
  backLink = "/",
  backText = "Volver"
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-12 text-center max-w-md">
        <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <Link href={backLink} className="btn-gradient">
          {backText}
        </Link>
      </div>
    </div>
  )
}