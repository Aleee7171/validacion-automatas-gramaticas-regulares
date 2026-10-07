import { useState } from 'react'

import {
  ArrowRight,
  Network,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'

import { useAutomataStore } from '../../store/automataStore'

import AutomataPreview from '../../features/automata-editor/components/AutomataPreview'

/* ========================================
   PROPIEDADES
======================================== */

type AutomataBuilderProps = {
  onContinue: () => void
}

/* ========================================
   COMPONENTE
======================================== */

function AutomataBuilder({
  onContinue,
}: AutomataBuilderProps) {
  /* ======================================
     CAMPOS
  ====================================== */

  const [
    stateInput,
    setStateInput,
  ] = useState('')

  const [
    symbolInput,
    setSymbolInput,
  ] = useState('')

  const [
    transitionFrom,
    setTransitionFrom,
  ] = useState('')

  const [
    transitionSymbol,
    setTransitionSymbol,
  ] = useState('')

  const [
    transitionTo,
    setTransitionTo,
  ] = useState('')

  const [
    transitionError,
    setTransitionError,
  ] = useState('')

  const [
    continueError,
    setContinueError,
  ] = useState('')

  /* ======================================
     STORE DEL AUTÓMATA
  ====================================== */

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

  /* ======================================
     AGREGAR ESTADO
  ====================================== */

  const handleAddState = () => {
    const value =
      stateInput.trim()

    if (
      !value ||
      states.includes(value)
    ) {
      return
    }

    addState(value)

    setStateInput('')

    setContinueError('')
  }

  /* ======================================
     AGREGAR SÍMBOLO
  ====================================== */

  const handleAddSymbol = () => {
    const value =
      symbolInput.trim()

    if (
      !value ||
      value.length !== 1 ||
      alphabet.includes(value)
    ) {
      return
    }

    addSymbol(value)

    setSymbolInput('')

    setContinueError('')
  }

  /* ======================================
     AGREGAR TRANSICIÓN
  ====================================== */

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

    const added =
      addTransition({
        from:
          transitionFrom,

        symbol:
          transitionSymbol,

        to:
          transitionTo,
      })

    /*
     * En un AFD no puede existir otra
     * transición para la misma combinación
     * estado + símbolo.
     */
    if (!added) {
      const existingTransition =
        transitions.find(
          (transition) =>
            transition.from ===
              transitionFrom &&
            transition.symbol ===
              transitionSymbol
        )

      setTransitionError(
        `Ya existe δ(${transitionFrom}, ${transitionSymbol}) = ${
          existingTransition?.to ?? ''
        }. En un AFD no puede existir otro destino para la misma combinación de estado y símbolo.`
      )

      return
    }

    setTransitionFrom('')
    setTransitionSymbol('')
    setTransitionTo('')

    setContinueError('')
  }

  /* ======================================
     LIMPIAR AUTÓMATA
  ====================================== */

  const handleReset = () => {
    resetAutomata()

    setStateInput('')
    setSymbolInput('')

    setTransitionFrom('')
    setTransitionSymbol('')
    setTransitionTo('')

    setTransitionError('')
    setContinueError('')
  }

  /* ======================================
     ELIMINAR ESTADO
  ====================================== */

  const handleRemoveState = (
    state: string
  ) => {
    removeState(state)

    setTransitionError('')
    setContinueError('')
  }

  /* ======================================
     ELIMINAR SÍMBOLO
  ====================================== */

  const handleRemoveSymbol = (
    symbol: string
  ) => {
    removeSymbol(symbol)

    setTransitionError('')
    setContinueError('')
  }

  /* ======================================
     ELIMINAR TRANSICIÓN
  ====================================== */

  const handleRemoveTransition = (
    from: string,
    symbol: string
  ) => {
    removeTransition(
      from,
      symbol
    )

    setTransitionError('')
    setContinueError('')
  }

  /* ======================================
     CAMBIAR ESTADO INICIAL
  ====================================== */

  const handleInitialStateChange = (
    state: string
  ) => {
    setInitialState(state)

    setContinueError('')
  }

  /* ======================================
     CAMBIAR ESTADO FINAL
  ====================================== */

  const handleFinalStateChange = (
    state: string
  ) => {
    toggleFinalState(state)

    setContinueError('')
  }

  /* ======================================
     GUARDAR Y CONTINUAR
  ====================================== */

  const handleContinue = () => {
    /*
     * Validamos que el autómata tenga
     * los elementos mínimos necesarios
     * antes de pasar al siguiente módulo.
     */

    if (states.length === 0) {
      setContinueError(
        'Debes agregar al menos un estado.'
      )

      return
    }

    if (alphabet.length === 0) {
      setContinueError(
        'Debes definir al menos un símbolo del alfabeto.'
      )

      return
    }

    if (!initialState) {
      setContinueError(
        'Debes seleccionar un estado inicial.'
      )

      return
    }

    if (
      finalStates.length === 0
    ) {
      setContinueError(
        'Debes seleccionar al menos un estado de aceptación.'
      )

      return
    }

    if (
      transitions.length === 0
    ) {
      setContinueError(
        'Debes agregar al menos una transición.'
      )

      return
    }

    setContinueError('')

    /*
     * El autómata ya se encuentra almacenado
     * mediante Zustand persist.
     *
     * Aquí solamente avanzamos al
     * siguiente módulo.
     */
    onContinue()
  }

  /* ======================================
     INTERFAZ
  ====================================== */

  return (
    <section className="automata-builder">
      {/* =================================
          ENCABEZADO
      ================================= */}

      <div className="automata-builder-heading">
        <div className="automata-builder-icon">
          <Network size={23} />
        </div>

        <div>
          <h1>
            Construir autómata
          </h1>

          <p>
            Define los elementos principales de un Autómata
            Finito Determinístico.
          </p>
        </div>
      </div>

      {/* =================================
          1. DEFINICIÓN DEL AUTÓMATA
      ================================= */}

      <div className="automata-builder-card">
        <div className="automata-builder-card-title">
          <span>
            1
          </span>

          <div>
            <h2>
              Definición del autómata
            </h2>

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
          {/* =============================
              ESTADOS
          ============================= */}

          <div className="automata-field">
            <label>
              Estados Q
            </label>

            <div className="automata-input-row">
              <input
                type="text"
                value={stateInput}
                placeholder="Ejemplo: q0"
                onChange={(
                  event
                ) => {
                  setStateInput(
                    event.target.value
                  )

                  setContinueError('')
                }}
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    handleAddState()
                  }
                }}
              />

              <button
                type="button"
                onClick={
                  handleAddState
                }
              >
                <Plus size={15} />

                Agregar
              </button>
            </div>

            <div className="automata-tags">
              {states.length ===
              0 ? (
                <span className="automata-placeholder">
                  Aún no se agregaron estados.
                </span>
              ) : (
                states.map(
                  (state) => (
                    <div
                      className="automata-tag"
                      key={state}
                    >
                      <span>
                        {state}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveState(
                            state
                          )
                        }
                        aria-label={`Eliminar ${state}`}
                      >
                        <X
                          size={
                            12
                          }
                        />
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* =============================
              ALFABETO
          ============================= */}

          <div className="automata-field">
            <label>
              Alfabeto Σ
            </label>

            <div className="automata-input-row">
              <input
                type="text"
                maxLength={1}
                value={symbolInput}
                placeholder="Ejemplo: a"
                onChange={(
                  event
                ) => {
                  setSymbolInput(
                    event.target.value
                  )

                  setContinueError('')
                }}
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    handleAddSymbol()
                  }
                }}
              />

              <button
                type="button"
                onClick={
                  handleAddSymbol
                }
              >
                <Plus size={15} />

                Agregar
              </button>
            </div>

            <div className="automata-tags">
              {alphabet.length ===
              0 ? (
                <span className="automata-placeholder">
                  Aún no se agregaron símbolos.
                </span>
              ) : (
                alphabet.map(
                  (symbol) => (
                    <div
                      className="automata-tag"
                      key={symbol}
                    >
                      <span>
                        {symbol}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSymbol(
                            symbol
                          )
                        }
                        aria-label={`Eliminar ${symbol}`}
                      >
                        <X
                          size={
                            12
                          }
                        />
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* =============================
              ESTADO INICIAL
          ============================= */}

          <div className="automata-field">
            <label>
              Estado inicial q₀
            </label>

            <select
              value={initialState}
              disabled={
                states.length ===
                0
              }
              onChange={(
                event
              ) =>
                handleInitialStateChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Seleccionar estado
              </option>

              {states.map(
                (state) => (
                  <option
                    key={state}
                    value={
                      state
                    }
                  >
                    {state}
                  </option>
                )
              )}
            </select>

            <p className="automata-field-help">
              Define el estado desde donde comenzará el
              procesamiento.
            </p>
          </div>

          {/* =============================
              ESTADOS DE ACEPTACIÓN
          ============================= */}

          <div className="automata-field">
            <label>
              Estados de aceptación F
            </label>

            <div className="automata-state-options">
              {states.length ===
              0 ? (
                <span className="automata-placeholder">
                  Primero agrega al menos un estado.
                </span>
              ) : (
                states.map(
                  (state) => {
                    const selected =
                      finalStates.includes(
                        state
                      )

                    return (
                      <button
                        type="button"
                        key={
                          state
                        }
                        className={
                          selected
                            ? 'automata-state-option selected'
                            : 'automata-state-option'
                        }
                        onClick={() =>
                          handleFinalStateChange(
                            state
                          )
                        }
                      >
                        {
                          state
                        }
                      </button>
                    )
                  }
                )
              )}
            </div>

            <p className="automata-field-help">
              Puedes seleccionar uno o varios estados.
            </p>
          </div>
        </div>

        {/* ===============================
            RESUMEN
        =============================== */}

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
                {states.join(
                  ', '
                )}
                {' }'}
              </span>

              <span>
                Σ = {'{ '}
                {alphabet.join(
                  ', '
                )}
                {' }'}
              </span>

              <span>
                q₀ ={' '}
                {initialState ||
                  '—'}
              </span>

              <span>
                F = {'{ '}
                {finalStates.join(
                  ', '
                )}
                {' }'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================
          2. GESTIÓN DE TRANSICIONES
      ================================= */}

      <div className="automata-builder-card transition-card">
        <div className="automata-builder-card-title">
          <span>
            2
          </span>

          <div>
            <h2>
              Gestión de transiciones
            </h2>

            <p>
              Define la función de transición δ del autómata.
            </p>
          </div>
        </div>

        <div className="transition-form">
          {/* ESTADO ORIGEN */}

          <div className="transition-field">
            <label>
              Estado origen
            </label>

            <select
              value={
                transitionFrom
              }
              disabled={
                states.length ===
                0
              }
              onChange={(
                event
              ) => {
                setTransitionFrom(
                  event.target.value
                )

                setTransitionError(
                  ''
                )
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {states.map(
                (state) => (
                  <option
                    key={state}
                    value={
                      state
                    }
                  >
                    {
                      state
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* SÍMBOLO */}

          <div className="transition-field">
            <label>
              Símbolo
            </label>

            <select
              value={
                transitionSymbol
              }
              disabled={
                alphabet.length ===
                0
              }
              onChange={(
                event
              ) => {
                setTransitionSymbol(
                  event.target.value
                )

                setTransitionError(
                  ''
                )
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {alphabet.map(
                (symbol) => (
                  <option
                    key={
                      symbol
                    }
                    value={
                      symbol
                    }
                  >
                    {
                      symbol
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* ESTADO DESTINO */}

          <div className="transition-field">
            <label>
              Estado destino
            </label>

            <select
              value={
                transitionTo
              }
              disabled={
                states.length ===
                0
              }
              onChange={(
                event
              ) => {
                setTransitionTo(
                  event.target.value
                )

                setTransitionError(
                  ''
                )
              }}
            >
              <option value="">
                Seleccionar
              </option>

              {states.map(
                (state) => (
                  <option
                    key={
                      state
                    }
                    value={
                      state
                    }
                  >
                    {
                      state
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* AGREGAR */}

          <button
            type="button"
            className="add-transition-button"
            onClick={
              handleAddTransition
            }
            disabled={
              states.length ===
                0 ||
              alphabet.length ===
                0
            }
          >
            <Plus size={15} />

            Agregar transición
          </button>
        </div>

        {/* ERROR */}

        {transitionError && (
          <div className="transition-error">
            {transitionError}
          </div>
        )}

        {/* TABLA */}

        <div className="transition-table-wrapper">
          {transitions.length ===
          0 ? (
            <div className="transition-empty">
              Aún no se registraron transiciones.
            </div>
          ) : (
            <table className="transition-table">
              <thead>
                <tr>
                  <th>
                    Estado origen
                  </th>

                  <th>
                    Símbolo
                  </th>

                  <th>
                    Estado destino
                  </th>

                  <th>
                    Función
                  </th>

                  <th>
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {transitions.map(
                  (
                    transition
                  ) => (
                    <tr
                      key={`${transition.from}-${transition.symbol}`}
                    >
                      <td>
                        {
                          transition.from
                        }
                      </td>

                      <td>
                        {
                          transition.symbol
                        }
                      </td>

                      <td>
                        {
                          transition.to
                        }
                      </td>

                      <td className="transition-function">
                        δ(
                        {
                          transition.from
                        }
                        ,{' '}
                        {
                          transition.symbol
                        }
                        ) ={' '}
                        {
                          transition.to
                        }
                      </td>

                      <td>
                        <button
                          type="button"
                          className="remove-transition-button"
                          onClick={() =>
                            handleRemoveTransition(
                              transition.from,
                              transition.symbol
                            )
                          }
                          aria-label="Eliminar transición"
                        >
                          <Trash2
                            size={
                              14
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =================================
          3. VISTA PREVIA
      ================================= */}

      <div className="automata-builder-card preview-card">
        <div className="automata-builder-card-title">
          <span>
            3
          </span>

          <div>
            <h2>
              Vista previa del autómata
            </h2>

            <p>
              Representación gráfica de los estados y
              transiciones definidos.
            </p>
          </div>
        </div>

        <AutomataPreview />
      </div>

      {/* =================================
          GUARDAR Y CONTINUAR
      ================================= */}

      <div className="automata-continue-section">
        <div className="automata-continue-info">
          <h3>
            Continuar con el autómata
          </h3>

          <p>
            El autómata construido se conservará para utilizarlo
            en la validación de cadenas.
          </p>

          {continueError && (
            <div className="automata-continue-error">
              {continueError}
            </div>
          )}
        </div>

        <button
          type="button"
          className="automata-continue-button"
          onClick={
            handleContinue
          }
        >
          Guardar y continuar

          <ArrowRight
            size={16}
          />
        </button>
      </div>
    </section>
  )
}

export default AutomataBuilder