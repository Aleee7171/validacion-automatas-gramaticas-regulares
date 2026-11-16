
import { useMemo } from 'react'
import {
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react'

import { useAutomataStore } from '../../store/automataStore'
import { convertToGrammar } from '../../features/grammar-converter/logic/convertToGrammar'

interface GrammarConverterProps {
  onEditAutomata: () => void
}

function GrammarConverter({
  onEditAutomata,
}: GrammarConverterProps) {
  const states = useAutomataStore(
    (state) => state.states
  )

  const alphabet = useAutomataStore(
    (state) => state.alphabet
  )

  const initialState = useAutomataStore(
    (state) => state.initialState
  )

  const finalStates = useAutomataStore(
    (state) => state.finalStates
  )

  const transitions = useAutomataStore(
    (state) => state.transitions
  )

  // Generar la gramática a partir del autómata.
  const result = useMemo(() => {
    try {
      const grammar = convertToGrammar({
        states,
        alphabet,
        initialState,
        finalStates,
        transitions,
      })

      return {
        grammar,
        error: '',
      }
    } catch (error) {
      return {
        grammar: null,
        error:
          error instanceof Error
            ? error.message
            : 'No fue posible generar la gramática.',
      }
    }
  }, [
    states,
    alphabet,
    initialState,
    finalStates,
    transitions,
  ])

  const grammar = result.grammar

  // Recuperar el estado de origen de cada no terminal.
  const stateByNonTerminal: Record<string, string> = grammar
    ? Object.fromEntries(
        Object.entries(grammar.stateNames).map(
          ([state, variable]) => [variable, state]
        )
      )
    : {}

  // Explicar las producciones existentes sin repetir el algoritmo.
  // Cada transición genera una fila y cada estado final una fila con ε.
  const conversionSteps = grammar
    ? grammar.productions.map((production, index) => {
        const isFinalState = production.terminal === null
        const originalState =
          stateByNonTerminal[production.from] ?? production.from
        const destinationState = production.to
          ? stateByNonTerminal[production.to] ?? production.to
          : '—'

        return {
          number: index + 1,
          origin: isFinalState
            ? `${originalState} ∈ F`
            : originalState,
          symbol: production.terminal ?? 'ε',
          destination: destinationState,
          generated: `${production.from} → ${production.expression}`,
          rule: isFinalState
            ? 'Regla 2: estado final'
            : 'Regla 1: transición normal',
        }
      })
    : []

  // Agrupar producciones por símbolo no terminal.
  const grouped = grammar
    ? grammar.nonTerminals.map((variable) => ({
        variable,
        rules: grammar.productions.filter(
          (production) =>
            production.from === variable
        ),
      }))
    : []

  return (
    <div className="grammar-converter">
      <header className="grammar-heading">
        <div className="grammar-heading-icon">
          <ArrowRightLeft size={24} />
        </div>

        <div>
          <h1>Generar gramática</h1>
          <p>
            Obtén una gramática regular equivalente
            al autómata construido.
          </p>
        </div>
      </header>

      {result.error ? (
        <section className="grammar-card">
          <p className="grammar-error">
            <AlertTriangle size={18} />
            {result.error}
          </p>

          <button
            type="button"
            className="grammar-button"
            onClick={onEditAutomata}
          >
            Ir a construir autómata
          </button>
        </section>
      ) : (
        grammar && (
          <>
            {/* AUTÓMATA DE ORIGEN */}
            <section className="grammar-card">
              <div className="grammar-title-row">
                <div>
                  <h2>1. Autómata de origen</h2>
                  <p>
                    Configuración utilizada para
                    la conversión.
                  </p>
                </div>

                <button
                  type="button"
                  className="grammar-button grammar-button-outline"
                  onClick={onEditAutomata}
                >
                  Editar autómata
                </button>
              </div>

              <div className="grammar-grid">
                <div>
                  <span>Estados Q</span>
                  <strong>
                    {`{ ${states.join(', ')} }`}
                  </strong>
                </div>

                <div>
                  <span>Alfabeto Σ</span>
                  <strong>
                    {`{ ${alphabet.join(', ')} }`}
                  </strong>
                </div>

                <div>
                  <span>Estado inicial</span>
                  <strong>{initialState}</strong>
                </div>

                <div>
                  <span>
                    Estados de aceptación F
                  </span>
                  <strong>
                    {`{ ${finalStates.join(', ')} }`}
                  </strong>
                </div>
              </div>
            </section>

            {/* CORRESPONDENCIA DE ESTADOS */}
            <section className="grammar-card">
              <div className="grammar-title-row">
                <div>
                  <h2>
                    2. Correspondencia entre estados
                    y no terminales
                  </h2>
                  <p>
                    Cada estado se representa mediante
                    un símbolo no terminal.
                  </p>
                </div>
              </div>

              <div className="grammar-map">
                {states.map((state) => (
                  <div key={state}>
                    <span>{state}</span>
                    <span>→</span>
                    <strong>
                      {grammar.stateNames[state]}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* REGLAS DE CONVERSIÓN */}
            <section className="grammar-card">
              <div className="grammar-title-row">
                <div>
                  <h2>3. Reglas de conversión</h2>
                  <p>
                    Cada transición genera una producción; cada estado
                    final permite terminar una derivación.
                  </p>
                </div>
              </div>

              <div className="grammar-method-grid">
                <div className="grammar-method-card">
                  <strong>Regla 1 · Transición normal</strong>
                  <p>
                    Si el autómata pasa del estado q al estado p al leer
                    el símbolo a, se crea una producción con el terminal
                    y el no terminal de destino.
                  </p>
                  <code>δ(q, a) = p ⇒ Q → aP</code>
                </div>
                <div className="grammar-method-card grammar-method-final">
                  <strong>Regla 2 · Estado final</strong>
                  <p>
                    Si un estado pertenece al conjunto de aceptación,
                    su no terminal incorpora la producción vacía.
                  </p>
                  <code>q ∈ F ⇒ Q → ε</code>
                </div>
              </div>
            </section>

            {/* CONVERSIÓN PASO A PASO */}
            <section className="grammar-card">
              <div className="grammar-title-row">
                <div>
                  <h2>4. Conversión paso a paso</h2>
                  <p>
                    Relación directa entre el autómata y cada producción
                    de la gramática resultante.
                  </p>
                </div>
              </div>

              {conversionSteps.length > 0 ? (
                <div
                  className="grammar-table-scroll"
                  role="region"
                  aria-label="Tabla de conversión paso a paso"
                  tabIndex={0}
                >
                  <table className="grammar-steps-table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Estado origen</th>
                        <th scope="col">Símbolo</th>
                        <th scope="col">Estado destino</th>
                        <th scope="col">Producción generada</th>
                        <th scope="col">Regla aplicada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversionSteps.map((step) => (
                        <tr key={step.number}>
                          <td>{step.number}</td>
                          <td>{step.origin}</td>
                          <td>{step.symbol}</td>
                          <td>{step.destination}</td>
                          <td className="grammar-generated-production">
                            {step.generated}
                          </td>
                          <td>{step.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="grammar-empty-steps">
                  No existen transiciones ni estados finales que
                  generen producciones.
                </p>
              )}

              <p className="grammar-note">
                Las filas se obtienen directamente del algoritmo de
                conversión. El número total debe coincidir con las
                producciones de la gramática resultante.
              </p>
            </section>

            {/* GRAMÁTICA GENERADA */}
            <section className="grammar-card">
              <div className="grammar-title-row">
                <div>
                  <h2>
                    5. Gramática regular resultante
                  </h2>
                  <p>
                    Producciones lineales por
                    la derecha.
                  </p>
                </div>
              </div>

              <div className="grammar-grid">
                <div>
                  <span>No terminales N</span>
                  <strong>
                    {`{ ${grammar.nonTerminals.join(', ')} }`}
                  </strong>
                </div>

                <div>
                  <span>Terminales Σ</span>
                  <strong>
                    {`{ ${grammar.terminals.join(', ')} }`}
                  </strong>
                </div>

                <div>
                  <span>Símbolo inicial S</span>
                  <strong>
                    {grammar.startSymbol}
                  </strong>
                </div>

                <div>
                  <span>Producciones</span>
                  <strong>
                    {grammar.productions.length}
                  </strong>
                </div>
              </div>

              <div className="grammar-rules">
                {grouped.map(
                  ({ variable, rules }) => (
                    <div
                      key={variable}
                      className="grammar-rule"
                    >
                      <strong>{variable}</strong>
                      <span>→</span>

                      <span>
                        {rules.length
                          ? rules
                              .map(
                                (rule) =>
                                  rule.expression
                              )
                              .join(' | ')
                          : '∅ (sin producciones)'}
                      </span>
                    </div>
                  )
                )}
              </div>

              <p className="grammar-note">
                Cada transición del autómata genera
                una producción equivalente. Los estados
                de aceptación incorporan una
                producción con ε.
              </p>
            </section>
          </>
        )
      )}
    </div>
  )
}

export default GrammarConverter
