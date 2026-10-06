import { useState } from 'react'
import {
  Network,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'

import { useAutomataStore } from '../../store/automataStore'
import AutomataPreview from '../../features/automata-editor/components/AutomataPreview'

function AutomataBuilder() {
  const [stateInput, setStateInput] = useState('')
  const [symbolInput, setSymbolInput] = useState('')

  const [transitionFrom, setTransitionFrom] = useState('')
  const [transitionSymbol, setTransitionSymbol] = useState('')
  const [transitionTo, setTransitionTo] = useState('')
  const [transitionError, setTransitionError] = useState('')

  const {
    states,
    alphabet,
    initialState,
    finalStates,
    transitions,

    addState,
    removeState,

    addSymbol,
    removeSymbol,

    setInitialState,
    toggleFinalState,

    addTransition,
    removeTransition,

    resetAutomata,
  } = useAutomataStore()

  const handleAddState = () => {
    const value = stateInput.trim()

    if (!value || states.includes(value)) {
      return
    }

    addState(value)
    setStateInput('')
  }

  const handleAddSymbol = () => {
    const value = symbolInput.trim()

    if (
      !value ||
      value.length !== 1 ||
      alphabet.includes(value)
    ) {
      return
    }

    addSymbol(value)
    setSymbolInput('')
  }

  const handleAddTransition = () => {
    setTransitionError('')

    if (
      !transitionFrom ||
      !transitionSymbol ||
      !transitionTo
    ) {
      setTransitionError(
        'Selecciona el estado origen, símbolo y estado destino.'
      )
      return
    }

    const added = addTransition({
      from: transitionFrom,
      symbol: transitionSymbol,
      to: transitionTo,
    })

    if (!added) {
      setTransitionError(
        `Ya existe una transición para δ(${transitionFrom}, ${transitionSymbol}).`
      )
      return
    }

    setTransitionFrom('')
    setTransitionSymbol('')
    setTransitionTo('')
  }

  const handleReset = () => {
    resetAutomata()

    setStateInput('')
    setSymbolInput('')

    setTransitionFrom('')
    setTransitionSymbol('')
    setTransitionTo('')
    setTransitionError('')
  }

  return (
    <section className="automata-builder">
      <div className="automata-builder-heading">
        <div className="automata-builder-icon">
          <Network size={23} />
        </div>

        <div>
          <h1>Construir autómata</h1>
          <p>
            Define los elementos principales de un Autómata
            Finito Determinístico.
          </p>
        </div>
      </div>

      {/* DEFINICIÓN DEL AUTÓMATA */}
      <div className="automata-builder-card">
        <div className="automata-builder-card-title">
          <span>1</span>

          <div>
            <h2>Definición del autómata</h2>
            <p>
              Configura los estados, el alfabeto y los estados
              especiales del AFD.
            </p>
          </div>

          <button
            className="automata-reset"
            onClick={handleReset}
            type="button"
          >
            <RotateCcw size={14} />
            Limpiar
          </button>
        </div>

        <div className="automata-definition-grid">
          {/* ESTADOS */}
          <div className="automata-field">
            <label>Estados Q</label>

            <div className="automata-input-row">
              <input
                type="text"
                value={stateInput}
                placeholder="Ejemplo: q0"
                onChange={(event) =>
                  setStateInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddState()
                  }
                }}
              />

              <button
                type="button"
                onClick={handleAddState}
              >
                <Plus size={15} />
                Agregar
              </button>
            </div>

            <div className="automata-tags">
              {states.length === 0 ? (
                <span className="automata-placeholder">
                  Aún no se agregaron estados.
                </span>
              ) : (
                states.map((state) => (
                  <div
                    className="automata-tag"
                    key={state}
                  >
                    <span>{state}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeState(state)
                      }
                      aria-label={`Eliminar ${state}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ALFABETO */}
          <div className="automata-field">
            <label>Alfabeto Σ</label>

            <div className="automata-input-row">
              <input
                type="text"
                maxLength={1}
                value={symbolInput}
                placeholder="Ejemplo: a"
                onChange={(event) =>
                  setSymbolInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddSymbol()
                  }
                }}
              />

              <button
                type="button"
                onClick={handleAddSymbol}
              >
                <Plus size={15} />
                Agregar
              </button>
            </div>

            <div className="automata-tags">
              {alphabet.length === 0 ? (
                <span className="automata-placeholder">
                  Aún no se agregaron símbolos.
                </span>
              ) : (
                alphabet.map((symbol) => (
                  <div
                    className="automata-tag"
                    key={symbol}
                  >
                    <span>{symbol}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSymbol(symbol)
                      }
                      aria-label={`Eliminar ${symbol}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ESTADO INICIAL */}
          <div className="automata-field">
            <label>Estado inicial q₀</label>

            <select
              value={initialState}
              disabled={states.length === 0}
              onChange={(event) =>
                setInitialState(event.target.value)
              }
            >
              <option value="">
                Seleccionar estado
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>

            <p className="automata-field-help">
              Define el estado desde donde comenzará el
              procesamiento.
            </p>
          </div>

          {/* ESTADOS DE ACEPTACIÓN */}
          <div className="automata-field">
            <label>Estados de aceptación F</label>

            <div className="automata-state-options">
              {states.length === 0 ? (
                <span className="automata-placeholder">
                  Primero agrega al menos un estado.
                </span>
              ) : (
                states.map((state) => {
                  const selected =
                    finalStates.includes(state)

                  return (
                    <button
                      type="button"
                      key={state}
                      className={
                        selected
                          ? 'automata-state-option selected'
                          : 'automata-state-option'
                      }
                      onClick={() =>
                        toggleFinalState(state)
                      }
                    >
                      {state}
                    </button>
                  )
                })
              )}
            </div>

            <p className="automata-field-help">
              Puedes seleccionar uno o varios estados.
            </p>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="automata-summary">
          <div className="automata-summary-header">
            Representación actual
          </div>

          <div className="automata-summary-content">
            <strong>
              M = (Q, Σ, δ, q₀, F)
            </strong>

            <div className="automata-summary-values">
              <span>
                Q = {'{ '}
                {states.join(', ')}
                {' }'}
              </span>

              <span>
                Σ = {'{ '}
                {alphabet.join(', ')}
                {' }'}
              </span>

              <span>
                q₀ = {initialState || '—'}
              </span>

              <span>
                F = {'{ '}
                {finalStates.join(', ')}
                {' }'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GESTIÓN DE TRANSICIONES */}
      <div className="automata-builder-card transition-card">
        <div className="automata-builder-card-title">
          <span>2</span>

          <div>
            <h2>Gestión de transiciones</h2>
            <p>
              Define la función de transición δ del autómata.
            </p>
          </div>
        </div>

        <div className="transition-form">
          <div className="transition-field">
            <label>Estado origen</label>

            <select
              value={transitionFrom}
              disabled={states.length === 0}
              onChange={(event) => {
                setTransitionFrom(event.target.value)
                setTransitionError('')
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="transition-field">
            <label>Símbolo</label>

            <select
              value={transitionSymbol}
              disabled={alphabet.length === 0}
              onChange={(event) => {
                setTransitionSymbol(event.target.value)
                setTransitionError('')
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {alphabet.map((symbol) => (
                <option
                  key={symbol}
                  value={symbol}
                >
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          <div className="transition-field">
            <label>Estado destino</label>

            <select
              value={transitionTo}
              disabled={states.length === 0}
              onChange={(event) => {
                setTransitionTo(event.target.value)
                setTransitionError('')
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="add-transition-button"
            onClick={handleAddTransition}
            disabled={
              states.length === 0 ||
              alphabet.length === 0
            }
          >
            <Plus size={15} />
            Agregar transición
          </button>
        </div>

        {transitionError && (
          <div className="transition-error">
            {transitionError}
          </div>
        )}

        <div className="transition-table-wrapper">
          {transitions.length === 0 ? (
            <div className="transition-empty">
              Aún no se registraron transiciones.
            </div>
          ) : (
            <table className="transition-table">
              <thead>
                <tr>
                  <th>Estado origen</th>
                  <th>Símbolo</th>
                  <th>Estado destino</th>
                  <th>Función</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {transitions.map((transition) => (
                  <tr
                    key={`${transition.from}-${transition.symbol}`}
                  >
                    <td>{transition.from}</td>
                    <td>{transition.symbol}</td>
                    <td>{transition.to}</td>

                    <td className="transition-function">
                      δ({transition.from},{' '}
                      {transition.symbol}) ={' '}
                      {transition.to}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="remove-transition-button"
                        onClick={() =>
                          removeTransition(
                            transition.from,
                            transition.symbol
                          )
                        }
                        aria-label="Eliminar transición"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>


        {/* VISTA PREVIA DEL AUTÓMATA */}
        <div className="automata-builder-card preview-card">
        <div className="automata-builder-card-title">
            <span>3</span>

            <div>
            <h2>Vista previa del autómata</h2>

            <p>
                Representación gráfica de los estados y
                transiciones definidos.
            </p>
            </div>
        </div>

        <AutomataPreview />
        </div>
    </section>
  )
}

export default AutomataBuilder