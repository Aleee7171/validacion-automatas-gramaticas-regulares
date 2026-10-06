import { useState } from 'react'
import { ChevronRight, CircleHelp } from 'lucide-react'

import Sidebar, {
  type Section,
} from './components/layout/Sidebar'

import Home from './components/pages/Home'
import Theory from './components/pages/Theory'
import AutomataBuilder from './components/pages/AutomataBuilder'

import './App.css'

const sectionNames: Record<Section, string> = {
  inicio: 'Inicio',
  teoria: 'Fundamentos teóricos',
  crear: 'Construir autómata',
  validar: 'Probar cadenas',
  convertir: 'Generar gramática',
  resultados: 'Resultados',
  ayuda: 'Ayuda',
}

function App() {
  const [activeSection, setActiveSection] =
    useState<Section>('inicio')

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return <Home onNavigate={setActiveSection} />

      case 'teoria':
        return <Theory />

      case 'crear':
        return <AutomataBuilder />

      default:
        return (
          <section className="temporary-page">
            <h1>{sectionNames[activeSection]}</h1>

            <p>
              Este módulo será implementado posteriormente.
            </p>
          </section>
        )
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <div className="app-content">
        <header className="topbar">
          <strong>{sectionNames[activeSection]}</strong>

          {activeSection !== 'inicio' && (
            <>
              <ChevronRight size={14} />
              <span>AutoGram Lab</span>
            </>
          )}
        </header>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      <button
        className="floating-help"
        onClick={() => setActiveSection('ayuda')}
        aria-label="Ayuda"
      >
        <CircleHelp size={20} />
      </button>
    </div>
  )
}

export default App