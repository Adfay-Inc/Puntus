'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Crown, Medal, BarChart3, Trophy, Star } from 'lucide-react'
import Link from 'next/link'

// Hooks personalizados
import { useResultsData } from '../../../hooks/useResultsData'

// Componentes modulares
import LoadingScreen from '../../../components/results/LoadingScreen'
import ErrorScreen from '../../../components/results/ErrorScreen'
import WinnerTab from '../../../components/results/WinnerTab'
import LeaderboardTab from '../../../components/results/LeaderboardTab'
import Top3Tab from '../../../components/results/Top3Tab'
import MapWinnersTab from '../../../components/results/MapWinnersTab'
import MVPTab from '../../../components/results/MVPTab'

export default function ResultsPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('winner')
  
  const {
    scrim,
    loading,
    leaderboard,
    mapWinners,
    globalMVP,
    finalTop3
  } = useResultsData(id)

  // Loading state
  if (loading) {
    return <LoadingScreen message="Cargando resultados..." />
  }

  // Error states
  if (!scrim) {
    return (
      <ErrorScreen
        title="Scrim no encontrado"
        message="No se pudo encontrar la información del scrim."
        backLink="/"
        backText="Volver al inicio"
      />
    )
  }

  if (scrim.status !== 'completed') {
    return (
      <ErrorScreen
        title="Resultados No Disponibles"
        message="Los resultados solo están disponibles cuando el scrim esté completado."
        backLink={`/scrim/${id}`}
        backText="Volver al Scrim"
      />
    )
  }

  // Configuración de tabs
  const tabs = [
    { id: 'winner', name: 'Campeón', icon: Crown },
    { id: 'top3', name: 'Top 3', icon: Medal },
    { id: 'leaderboard', name: 'Tabla', icon: BarChart3 },
    { id: 'winners', name: 'Ganadores de Mapa', icon: Trophy },
    ...(scrim.settings?.isDetailed ? [{ id: 'mvp', name: 'MVP Global', icon: Star }] : [])
  ]

  // Render del contenido por tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'winner':
        return <WinnerTab scrim={scrim} leaderboard={leaderboard} />
      case 'leaderboard':
        return <LeaderboardTab scrim={scrim} leaderboard={leaderboard} />
      case 'top3':
        return <Top3Tab finalTop3={finalTop3} />
      case 'winners':
        return <MapWinnersTab mapWinners={mapWinners} />
      case 'mvp':
        return <MVPTab globalMVP={globalMVP} scrim={scrim} />
      default:
        return <WinnerTab scrim={scrim} leaderboard={leaderboard} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/scrim/${id}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Scrim
          </Link>
          
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center capitalize">
                <Crown className="h-10 w-10 mr-3 text-yellow-500" />
                Resultados <span className="gradient-text-only"> Finales</span>
              </h1>
              <div className="text-xl text-slate-600">{scrim.name}</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}