'use client'

import ThemeToggle from '@/components/ThemeToggle'

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      <nav className="nav-glass p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-puntus-primary to-puntus-secondary bg-clip-text text-transparent">
            Puntus by Adfay
          </h1>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-6">Sistema de Temas</h2>
          <p className="text-text-secondary mb-4">
            Este proyecto ahora soporta temas claro y oscuro. El tema claro es el predeterminado.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card-glass p-6">
            <div className="w-full h-24 bg-puntus-primary rounded-lg mb-4"></div>
            <h3 className="font-semibold text-text-primary">Primario</h3>
            <p className="text-text-secondary">#E10052</p>
          </div>
          <div className="card-glass p-6">
            <div className="w-full h-24 bg-puntus-secondary rounded-lg mb-4"></div>
            <h3 className="font-semibold text-text-primary">Secundario</h3>
            <p className="text-text-secondary">#C10C4F</p>
          </div>
          <div className="card-glass p-6">
            <div className="w-full h-24 bg-puntus-tertiary rounded-lg mb-4"></div>
            <h3 className="font-semibold text-text-primary">Terciario</h3>
            <p className="text-text-secondary">#A5034C</p>
          </div>
          <div className="card-glass p-6">
            <div className="w-full h-24 bg-puntus-black rounded-lg mb-4"></div>
            <h3 className="font-semibold text-text-primary">Negro</h3>
            <p className="text-text-secondary">#0F0F0F</p>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Componentes</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Botones</h4>
              <div className="flex flex-wrap gap-4">
                <button className="btn-puntus">Botón Primario</button>
                <button className="btn-elegant">Botón Elegante</button>
                <button className="btn-elegant-outline">Botón Outline</button>
                <button className="btn-gradient">Botón Gradiente</button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Formularios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Input de texto" 
                  className="input-puntus"
                />
                <select className="select-puntus">
                  <option>Opción 1</option>
                  <option>Opción 2</option>
                  <option>Opción 3</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Tarjetas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-elegant-orange">
                  <h5 className="text-xl font-semibold text-text-primary mb-2">Tarjeta Elegante</h5>
                  <p className="text-text-secondary">
                    Esta es una tarjeta con estilo elegante que se adapta al tema actual.
                  </p>
                </div>
                <div className="card-glass p-6">
                  <h5 className="text-xl font-semibold text-text-primary mb-2">Tarjeta Glass</h5>
                  <p className="text-text-secondary">
                    Efecto glassmorphism que funciona en ambos temas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Gradientes</h3>
          <div className="space-y-4">
            <div className="h-24 bg-gradient-to-r from-puntus-primary to-puntus-secondary rounded-lg"></div>
            <div className="h-24 bg-puntus-gradient rounded-lg"></div>
            <div className="h-24 bg-gradient-to-r from-puntus-primary via-puntus-secondary to-puntus-tertiary rounded-lg"></div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Texto</h3>
          <div className="space-y-4">
            <p className="text-text-primary">Texto primario - usado para contenido principal</p>
            <p className="text-text-secondary">Texto secundario - usado para descripciones</p>
            <p className="text-text-tertiary">Texto terciario - usado para información menos importante</p>
            <p className="gradient-text text-2xl font-bold">Texto con gradiente</p>
          </div>
        </section>
      </main>
    </div>
  )
}