import {
  Home,
  BookOpen,
  CirclePlus,
  CheckCircle2,
  GitBranch,
  BarChart3,
  CircleHelp,
  Cpu,
  ChevronRight,
} from 'lucide-react'

export type Section =
  | 'inicio'
  | 'teoria'
  | 'crear'
  | 'validar'
  | 'convertir'
  | 'resultados'
  | 'ayuda'

interface SidebarProps {
  activeSection: Section
  onNavigate: (section: Section) => void
}

const menuItems = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'teoria', label: 'Fundamentos teóricos', icon: BookOpen },
  { id: 'crear', label: 'Construir autómata', icon: CirclePlus },
  { id: 'validar', label: 'Probar cadenas', icon: CheckCircle2 },
  { id: 'convertir', label: 'Generar gramática', icon: GitBranch },
  { id: 'resultados', label: 'Resultados', icon: BarChart3 },
  { id: 'ayuda', label: 'Ayuda', icon: CircleHelp },
] as const

function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Cpu size={20} />
        </div>

        <div>
          <h2>AutoGram Lab</h2>
          <p>Autómatas y gramáticas</p>
        </div>
      </div>

      <div className="sidebar-divider" />

      <p className="sidebar-title">MÓDULOS</p>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              className={`sidebar-item ${
                activeSection === item.id ? 'active' : ''
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="sidebar-item-left">
                <Icon size={16} />
                <span>{item.label}</span>
              </div>

              {activeSection === item.id && (
                <ChevronRight size={14} />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar