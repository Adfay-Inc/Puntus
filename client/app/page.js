"use client"

import Link from "next/link"
import { Flame, Trophy, Target, Users, Play, ArrowRight, BarChart3, Shield, Zap } from "lucide-react"

export default function Component() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        {/* Header */}
        <nav className="nav-elegant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <div className="absolute inset-0 h-8 w-8 text-orange-500 animate-pulse opacity-50" />
                </div>
                <div>
                  <span className="text-slate-900 text-xl font-bold tracking-tight">Puntus</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">by Adfay</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-6">
                <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Iniciar Sesión
                </Link>
                <Link href="/login" className="btn-elegant">
                  Comenzar
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight capitalize">
                Sistema de <span className="highlight-scrims">Puntos</span>
                <br />
                para <span className="gradient-text-only">Free Fire</span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Plataforma completa para gestionar scrims, equipos, partidas y sistema de puntuación basado en placement +
                kills para <span className="gradient-text-only capitalize">torneos profesionales</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login" className="group btn-gradient flex items-center space-x-2">
                  <span>Ver Partidos</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
                Todo lo que <span className="gradient-text-only">necesitas</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Herramientas profesionales para organizar y gestionar tus torneos de Free Fire
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group card-elegant-orange">
                <div className="icon-container-gradient mb-6">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                  <span className="gradient-text-only">Gestión</span> de Scrims
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Organiza torneos con sistema de puntuación personalizable y múltiples mapas de forma profesional.
                </p>
              </div>

              <div className="group card-elegant-orange">
                <div className="icon-container-gradient mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                  Sistema de <span className="gradient-text-only">Puntuación</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Sistema avanzado de puntuación automática con múltiples configuraciones y estadísticas detalladas en
                  tiempo real.
                </p>
              </div>

              <div className="group card-elegant-orange">
                <div className="icon-container-gradient mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                  Clasificación en <span className="gradient-text-only">Vivo</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Seguimiento en tiempo real de resultados y tabla de clasificación con actualizaciones instantáneas.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-red-50/50 transform -skew-y-2 scale-110"></div>
            <div className="relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
                  Números que <span className="gradient-text-only">hablan</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Miles de organizadores confían en nuestra plataforma
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                    <div className="text-4xl font-bold gradient-text-only mb-2 group-hover:scale-110 transition-transform">
                      500+
                    </div>
                    <div className="text-slate-600 font-medium capitalize">Torneos Activos</div>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                    <div className="text-4xl font-bold gradient-text-only mb-2 group-hover:scale-110 transition-transform">
                      10K+
                    </div>
                    <div className="text-slate-600 font-medium capitalize">Jugadores Registrados</div>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                    <div className="text-4xl font-bold gradient-text-only mb-2 group-hover:scale-110 transition-transform">
                      50K+
                    </div>
                    <div className="text-slate-600 font-medium capitalize">Partidas Jugadas</div>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                    <div className="text-4xl font-bold gradient-text-only mb-2 group-hover:scale-110 transition-transform">
                      99.9%
                    </div>
                    <div className="text-slate-600 font-medium capitalize">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
                Características <span className="gradient-text-only">Avanzadas</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Herramientas profesionales para llevar tus torneos al siguiente nivel
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">
                      Análisis en <span className="gradient-text-only">Tiempo Real</span>
                    </h3>
                    <p className="text-slate-600">
                      Estadísticas detalladas de cada partida con gráficos interactivos y métricas avanzadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">
                      Gestión de <span className="gradient-text-only">Equipos</span>
                    </h3>
                    <p className="text-slate-600">
                      Sistema completo para administrar equipos, jugadores y sus estadísticas históricas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">
                      <span className="gradient-text-only">Streaming</span> Integration
                    </h3>
                    <p className="text-slate-600">
                      Integración directa con plataformas de streaming para mostrar resultados en vivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-8 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-white text-center">
                      <div className="text-6xl font-bold mb-4 text-white">LIVE</div>
                      <div className="text-xl mb-6 capitalize">Puntuaciones en Tiempo Real</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/20 backdrop-blur-sm rounded p-3">
                          <div className="text-white font-bold capitalize">Activos</div>
                          <div className="text-white/90">12 Eventos</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded p-3">
                          <div className="text-white font-bold capitalize">Organizadores</div>
                          <div className="text-white/90">40 Online</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
                  El Futuro de los <span className="gradient-text-only">Esports</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Tecnología de vanguardia para la próxima generación de competencias
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="group perspective-1000">
                  <div className="card-elegant-orange transform group-hover:rotateY-12 transition-all duration-500">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                      <span className="gradient-text-only">Seguridad</span> Avanzada
                    </h3>
                    <p className="text-slate-600">
                      Protección anti-errores con algoritmos de detección en tiempo real y verificación automática.
                    </p>
                  </div>
                </div>

                <div className="group perspective-1000">
                  <div className="card-elegant-orange transform group-hover:rotateY-12 transition-all duration-500">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                      <span className="gradient-text-only">Analytics</span> Pro
                    </h3>
                    <p className="text-slate-600">
                      Análisis profundo de rendimiento con métricas avanzadas y reportes personalizables.
                    </p>
                  </div>
                </div>

                <div className="group perspective-1000">
                  <div className="card-elegant-orange transform group-hover:rotateY-12 transition-all duration-500">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize">
                      <span className="gradient-text-only">Velocidad</span> Extrema
                    </h3>
                    <p className="text-slate-600">
                      Infraestructura de alta velocidad con servidores distribuidos globalmente para latencia mínima.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 capitalize">
                ¿Listo para <span className="gradient-text-only-white">comenzar</span>?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto capitalize">
                Únete a cientos de organizadores que ya confían en Puntus para sus eventps
              </p>
              <Link
                  href="/login"
                  className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-slate-50 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl space-x-2"
              >
                <span className="capitalize">Generar puntuaciones</span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-12 border-t border-slate-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-slate-900 font-bold text-lg capitalize">Puntus by Adfay</span>
              </div>
              <p className="text-slate-500 capitalize">
                &copy; 2024 Puntus by Adfay. Sistema profesional de Scrims para Free Fire.
              </p>
            </div>
          </footer>
        </main>
      </div>
  )
}
