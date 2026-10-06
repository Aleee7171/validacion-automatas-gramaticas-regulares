import {
  BookOpen,
  CirclePlus,
  CheckCircle2,
  GitBranch,
  BarChart3,
  Cpu,
  GraduationCap,
} from 'lucide-react'

import type { Section } from '../layout/Sidebar'

interface HomeProps {
  onNavigate: (section: Section) => void
}

const modules = [
  {
    number: '01',
    section: 'teoria' as Section,
    title: 'Fundamentos teóricos',
    description:
      'Conceptos de AFD, transiciones, validación de cadenas y gramáticas regulares.',
    icon: BookOpen,
  },
  {
    number: '02',
    section: 'crear' as Section,
    title: 'Construir autómata',
    description:
      'Define los estados, alfabeto y transiciones de un autómata finito.',
    icon: CirclePlus,
  },
  {
    number: '03',
    section: 'validar' as Section,
    title: 'Probar cadenas',
    description:
      'Ingresa una cadena y simula su recorrido paso a paso sobre el autómata.',
    icon: CheckCircle2,
  },
  {
    number: '04',
    section: 'convertir' as Section,
    title: 'Genearar gramática',
    description:
      'Genera la gramática regular equivalente a partir del autómata creado.',
    icon: GitBranch,
  },
  {
    number: '05',
    section: 'resultados' as Section,
    title: 'Ver resultados',
    description:
      'Resumen del autómata, cadenas evaluadas y gramática generada.',
    icon: BarChart3,
  },
]

function Home({ onNavigate }: HomeProps) {
  return (
    <div className="home-container">
      <section className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-small-icon">
            <GraduationCap size={17} />
            <span>–</span>
          </div>

            <h1>
            Construye, valida y convierte autómatas finitos
            </h1>

          <p>
            Crea autómatas finitos determinísticos, prueba cadenas paso a paso y obtén su gramática regular equivalente.
          </p>
        </div>

        <div className="welcome-decoration">
          <Cpu size={92} strokeWidth={1.5} />
        </div>
      </section>

      <section className="modules-section">
        <div className="section-heading">
          <span className="section-line" />
          <h2>MÓDULOS DEL SISTEMA</h2>
        </div>

        <div className="modules-grid">
          {modules.map((module) => {
            const Icon = module.icon

            return (
              <button
                key={module.number}
                className="module-card"
                onClick={() => onNavigate(module.section)}
              >
                <div className="module-card-top">
                  <div className="module-icon">
                    <Icon size={20} />
                  </div>

                  <span className="module-number">
                    {module.number}
                  </span>
                </div>

                <strong>{module.title}</strong>

                <p>{module.description}</p>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Home