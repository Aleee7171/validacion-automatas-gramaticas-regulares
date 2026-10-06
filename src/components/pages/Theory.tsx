import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

type TheorySection =
  | 'afd'
  | 'estados'
  | 'transicion'
  | 'validacion'
  | 'gramatica'
  | 'conversion'
  | ''

function Theory() {
  const [openSection, setOpenSection] =
    useState<TheorySection>('afd')

  const toggleSection = (section: TheorySection) => {
    setOpenSection(
      openSection === section ? '' : section
    )
  }

  return (
    <div className="theory-page">
      <div className="theory-heading">
        <div className="theory-heading-icon">
          <BookOpen size={20} />
        </div>

        <div>
          <h1>Fundamentos teóricos</h1>
          <p>
            Conceptos básicos para trabajar con autómatas
            finitos y gramáticas regulares.
          </p>
        </div>
      </div>

      {/* AFD */}
      <section className="theory-card">
        <button
          className="theory-card-header"
          onClick={() => toggleSection('afd')}
        >
          <span>
            Autómata Finito Determinístico (AFD)
          </span>

          {openSection === 'afd' ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSection === 'afd' && (
          <div className="theory-card-content">
            <p>
              Un Autómata Finito Determinístico se
              representa mediante:
            </p>

            <div className="afd-formula">
              M = (Q, Σ, δ, q₀, F)
            </div>

            <div className="afd-elements">
              <div>
                <strong>Q</strong>
                <span>
                  Conjunto finito de estados.
                </span>
              </div>

              <div>
                <strong>Σ</strong>
                <span>
                  Alfabeto de entrada.
                </span>
              </div>

              <div>
                <strong>δ</strong>
                <span>
                  Función de transición.
                </span>
              </div>

              <div>
                <strong>q₀</strong>
                <span>
                  Estado inicial.
                </span>
              </div>

              <div>
                <strong>F</strong>
                <span>
                  Conjunto de estados de aceptación.
                </span>
              </div>
            </div>

            <p className="theory-note">
              En un AFD, para cada estado y símbolo
              de entrada existe como máximo una
              transición posible.
            </p>
          </div>
        )}
      </section>

      {/* ESTADOS Y ALFABETO */}
      <section className="theory-card">
        <button
          className="theory-card-header"
          onClick={() => toggleSection('estados')}
        >
          <span>Estados y alfabeto</span>

          {openSection === 'estados' ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSection === 'estados' && (
          <div className="theory-card-content">
            <div className="theory-columns">
              <div>
                <h3>Estados</h3>

                <div className="state-item">
                  <strong>
                    Estado inicial (q₀)
                  </strong>

                  <span>
                    Estado desde el cual comienza el
                    procesamiento de una cadena.
                  </span>
                </div>

                <div className="state-item">
                  <strong>
                    Estados de aceptación (F)
                  </strong>

                  <span>
                    Estados que determinan la
                    aceptación de una cadena cuando
                    el procesamiento termina en uno
                    de ellos.
                  </span>
                </div>

                <div className="state-item">
                  <strong>
                    Otros estados
                  </strong>

                  <span>
                    Estados utilizados durante el
                    recorrido del autómata según las
                    transiciones definidas.
                  </span>
                </div>
              </div>

              <div>
                <h3>Alfabeto Σ</h3>

                <p>
                  Es el conjunto finito de símbolos
                  que pueden ser procesados por el
                  autómata.
                </p>

                <div className="alphabet-example">
                  Σ = {'{ a, b }'}
                </div>

                <p className="example-text">
                  Ejemplo: la cadena{' '}
                  <strong>abba</strong> está formada
                  únicamente por símbolos
                  pertenecientes al alfabeto.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FUNCIÓN DE TRANSICIÓN */}
      <section className="theory-card">
        <button
          className="theory-card-header"
          onClick={() =>
            toggleSection('transicion')
          }
        >
          <span>Función de transición</span>

          {openSection === 'transicion' ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSection === 'transicion' && (
          <div className="theory-card-content">
            <p>
              La función de transición determina el
              estado siguiente a partir del estado
              actual y del símbolo leído.
            </p>

            <div className="transition-formula">
              δ(q, a) = q'
            </div>

            <div className="transition-table">
              <div className="transition-row transition-header">
                <span>Estado actual</span>
                <span>Símbolo</span>
                <span>Estado siguiente</span>
              </div>

              <div className="transition-row">
                <span>q₀</span>
                <span>a</span>
                <span>q₁</span>
              </div>

              <div className="transition-row">
                <span>q₁</span>
                <span>b</span>
                <span>q₂</span>
              </div>
            </div>

            <p className="theory-note">
              En un AFD, para un estado y un
              símbolo determinado no pueden existir
              dos estados destino diferentes.
            </p>
          </div>
        )}
      </section>

        {/* VALIDACIÓN DE CADENAS */}
        <section className="theory-card">
        <button
            className="theory-card-header"
            onClick={() => toggleSection('validacion')}
        >
            <span>Validación de cadenas</span>

            {openSection === 'validacion' ? (
            <ChevronUp size={18} />
            ) : (
            <ChevronDown size={18} />
            )}
        </button>

        {openSection === 'validacion' && (
            <div className="theory-card-content">
            <p>
                Para validar una cadena, el autómata comienza en
                el estado inicial y procesa sus símbolos de
                izquierda a derecha aplicando la función de
                transición.
            </p>

            <div className="validation-steps">
                <div className="validation-step">
                <span className="step-number">1</span>
                <div>
                    <strong>Estado inicial</strong>
                    <p>El recorrido comienza en q₀.</p>
                </div>
                </div>

                <div className="validation-step">
                <span className="step-number">2</span>
                <div>
                    <strong>Lectura de símbolos</strong>
                    <p>
                    Cada símbolo determina la transición hacia
                    el siguiente estado.
                    </p>
                </div>
                </div>

                <div className="validation-step">
                <span className="step-number">3</span>
                <div>
                    <strong>Comprobación final</strong>
                    <p>
                    Al terminar la cadena se verifica si el
                    estado alcanzado pertenece a F.
                    </p>
                </div>
                </div>
            </div>

            <div className="validation-example">
                <span>Cadena: ab</span>

                <div className="validation-path">
                <strong>q₀</strong>
                <span>― a →</span>
                <strong>q₁</strong>
                <span>― b →</span>
                <strong>q₂</strong>
                </div>

                <div className="accepted-result">
                Si q₂ ∈ F, la cadena es aceptada.
                </div>
            </div>
            </div>
        )}
        </section>

        {/* GRAMÁTICAS REGULARES */}
        <section className="theory-card">
        <button
            className="theory-card-header"
            onClick={() => toggleSection('gramatica')}
        >
            <span>Gramáticas regulares</span>

            {openSection === 'gramatica' ? (
            <ChevronUp size={18} />
            ) : (
            <ChevronDown size={18} />
            )}
        </button>

        {openSection === 'gramatica' && (
            <div className="theory-card-content">
            <p>
                Una gramática regular permite describir un lenguaje
                mediante un conjunto de reglas de producción.
            </p>

            <div className="grammar-definition">
                <div>
                <strong>A → xB</strong>
                <span>
                    Un símbolo terminal seguido de un no terminal.
                </span>
                </div>

                <div>
                <strong>A → x</strong>
                <span>
                    Una producción formada únicamente por símbolos
                    terminales.
                </span>
                </div>
            </div>

            <div className="grammar-example">
                <span>Ejemplo</span>

                <div className="grammar-rules">
                <strong>S → aA</strong>
                <strong>A → bB</strong>
                <strong>B → a</strong>
                </div>
            </div>

            <p className="theory-note">
                En una gramática regular a derecha, cuando aparece
                un no terminal en una producción, este se encuentra
                al final.
            </p>
            </div>
        )}
        </section>

        {/* CONVERSIÓN DE AFD A GRAMÁTICA */}
        <section className="theory-card">
        <button
            className="theory-card-header"
            onClick={() => toggleSection('conversion')}
        >
            <span>Conversión de AFD a gramática regular</span>

            {openSection === 'conversion' ? (
            <ChevronUp size={18} />
            ) : (
            <ChevronDown size={18} />
            )}
        </button>

        {openSection === 'conversion' && (
            <div className="theory-card-content">
            <p>
                Para obtener una gramática regular equivalente,
                los estados del autómata se asocian con símbolos
                no terminales y las transiciones se transforman
                en reglas de producción.
            </p>

            <div className="conversion-relations">
                <div>
                <span className="relation-label">
                    Estados
                </span>

                <strong>
                    q₀, q₁, q₂
                </strong>

                <span className="relation-arrow">
                    →
                </span>

                <strong>
                    Q₀, Q₁, Q₂
                </strong>

                <p>No terminales</p>
                </div>

                <div>
                <span className="relation-label">
                    Alfabeto
                </span>

                <strong>
                    Σ = {'{ a, b }'}
                </strong>

                <span className="relation-arrow">
                    →
                </span>

                <strong>
                    T = {'{ a, b }'}
                </strong>

                <p>Terminales</p>
                </div>
            </div>

            <div className="conversion-example">
                <span>Ejemplo de conversión</span>

                <div className="conversion-process">

                <div className="automata-example">
                    <span className="initial-arrow">
                    →
                    </span>

                    <div className="automata-state">
                    q₀
                    </div>

                    <span className="transition-label">
                    ― a →
                    </span>

                    <div className="automata-state final-state">
                    <div>
                        q₁
                    </div>
                    </div>
                </div>

                <span className="conversion-arrow">
                    ⇒
                </span>

                <div className="grammar-production">
                    Q₀ → aQ₁
                </div>
                </div>
            </div>

            <div className="final-state-rule">
                <div>
                <strong>
                    Estado de aceptación
                </strong>

                <span>
                Al ser q₁ un estado de aceptación, se agrega 
                la producción con cadena vacía
                </span>
                </div>

                <div className="final-production">
                Q₁ → ε
                </div>
            </div>

            <p className="theory-note">
                Cada transición genera una producción equivalente.
                Además, por cada estado de aceptación se incorpora
                una producción con ε.
            </p>
            </div>
        )}
        </section>
    </div>
  )
}

export default Theory