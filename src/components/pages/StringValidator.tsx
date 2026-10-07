import {
  useMemo,
  useState,
} from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Play,
  RotateCcw,
  XCircle,
} from 'lucide-react'

import { useAutomataStore } from '../../store/automataStore'

import AutomataPreview from '../../features/automata-editor/components/AutomataPreview'

import {
  validateString,
  type ValidationResult,
} from '../../features/string-validator/logic/validateString'

/* ========================================
   PROPIEDADES
======================================== */

type StringValidatorProps = {
  onEditAutomata: () => void
}

/* ========================================
   COMPONENTE
======================================== */

function StringValidator({
  onEditAutomata,
}: StringValidatorProps) {
  const {
    states,
    alphabet,
    initialState,
    finalStates,
    transitions,
  } = useAutomataStore()

  const [
    input,
    setInput,
  ] = useState('')

  const [
    result,
    setResult,
  ] =
    useState<ValidationResult | null>(
      null
    )

  const [
    simulationActive,
    setSimulationActive,
  ] = useState(false)

  /*
   * currentStep representa la cantidad
   * de transiciones ya procesadas.
   *
   * 0 = todavía estamos en q0.
   * 1 = se procesó el primer símbolo.
   */
  const [
    currentStep,
    setCurrentStep,
  ] = useState(0)

  /* ======================================
     AUTÓMATA LISTO
  ====================================== */

  const automataReady =
    states.length > 0 &&
    alphabet.length > 0 &&
    Boolean(initialState) &&
    finalStates.length > 0

  /* ======================================
     EJEMPLOS
  ====================================== */

  const examples =
    useMemo(() => {
      const values:
        string[] = [
          'ε',
        ]

      if (alphabet[0]) {
        values.push(
          alphabet[0]
        )
      }

      if (alphabet[1]) {
        values.push(
          alphabet[1]
        )
      }

      if (
        alphabet[0] &&
        alphabet[1]
      ) {
        values.push(
          `${alphabet[0]}${alphabet[1]}`
        )

        values.push(
          `${alphabet[0]}${alphabet[1]}${alphabet[0]}`
        )
      }

      return [
        ...new Set(
          values
        ),
      ]
    }, [alphabet])

  /* ======================================
     VALIDAR
  ====================================== */

  const handleValidate = () => {
    if (!automataReady) {
      return
    }

    const validation =
      validateString(
        input,
        alphabet,
        initialState,
        finalStates,
        transitions
      )

    setResult(
      validation
    )

    setSimulationActive(
      false
    )

    setCurrentStep(
      validation.steps.length
    )
  }

  /* ======================================
     SIMULACIÓN
  ====================================== */

  const handleStartSimulation =
    () => {
      if (!automataReady) {
        return
      }

      const validation =
        validateString(
          input,
          alphabet,
          initialState,
          finalStates,
          transitions
        )

      setResult(
        validation
      )

      setSimulationActive(
        true
      )

      setCurrentStep(0)
    }

  const handleNextStep = () => {
    if (!result) {
      return
    }

    setCurrentStep(
      (value) =>
        Math.min(
          value + 1,
          result.steps.length
        )
    )
  }

  const handlePreviousStep =
    () => {
      setCurrentStep(
        (value) =>
          Math.max(
            value - 1,
            0
          )
      )
    }

  const handleRestartSimulation =
    () => {
      setCurrentStep(0)
    }

  /* ======================================
     LIMPIAR
  ====================================== */

  const handleReset = () => {
    setInput('')

    setResult(null)

    setSimulationActive(
      false
    )

    setCurrentStep(0)
  }

  const handleInputChange = (
    value: string
  ) => {
    setInput(value)

    setResult(null)

    setSimulationActive(
      false
    )

    setCurrentStep(0)
  }

  /* ======================================
     DATOS DEL PASO ACTUAL
  ====================================== */

  const activeStep =
    result &&
    currentStep > 0
      ? result.steps[
          currentStep - 1
        ] ?? null
      : null

  const currentState =
    currentStep === 0
      ? initialState
      : activeStep?.nextState ??
        activeStep?.currentState ??
        initialState

  const activeTransition =
    activeStep
      ? {
          from:
            activeStep.currentState,

          symbol:
            activeStep.symbol,

          to:
            activeStep.nextState,
        }
      : null

  const simulationFinished =
    Boolean(result) &&
    currentStep >=
      (result?.steps.length ??
        0)

  const visibleSteps =
    result
      ? result.steps.slice(
          0,
          simulationActive
            ? currentStep
            : result.steps.length
        )
      : []

  /* ======================================
     CADENA VISUAL
  ====================================== */

  const normalizedInput =
    input === 'ε'
      ? ''
      : input

  /* ======================================
     NO EXISTE AUTÓMATA
  ====================================== */

  if (!automataReady) {
    return (
      <section className="string-validator">
        <div className="string-validator-heading">
          <div className="string-validator-icon">
            <ListChecks
              size={23}
            />
          </div>

          <div>
            <h1>
              Probar cadenas
            </h1>

            <p>
              Valida cadenas y observa
              su recorrido dentro del AFD.
            </p>
          </div>
        </div>

        <div className="validator-empty-card">
          <AlertTriangle
            size={30}
          />

          <div>
            <h2>
              No existe un autómata
              listo para validar
            </h2>

            <p>
              Primero debes construir
              el autómata que será
              utilizado durante la
              validación.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onEditAutomata
            }
          >
            Ir a construir autómata
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="string-validator">
      {/* =================================
          ENCABEZADO
      ================================= */}

      <div className="string-validator-heading">
        <div className="string-validator-icon">
          <ListChecks
            size={23}
          />
        </div>

        <div>
          <h1>
            Probar cadenas
          </h1>

          <p>
            Comprueba una cadena y observa
            cómo es procesada por el
            autómata.
          </p>
        </div>
      </div>

      {/* =================================
          1. AUTÓMATA CARGADO
      ================================= */}

      <div className="validator-card">
        <div className="validator-card-title">
          <span>
            1
          </span>

          <div>
            <h2>
              Autómata cargado
            </h2>

            <p>
              Este es el AFD que será
              utilizado para validar las
              cadenas ingresadas.
            </p>
          </div>

          <button
            type="button"
            className="validator-edit-automata"
            onClick={
              onEditAutomata
            }
          >
            Editar autómata
          </button>
        </div>

        <div className="validator-automata-summary">
          <div>
            <span>
              Estados
            </span>

            <strong>
              Q = {'{ '}
              {states.join(', ')}
              {' }'}
            </strong>
          </div>

          <div>
            <span>
              Alfabeto
            </span>

            <strong>
              Σ = {'{ '}
              {alphabet.join(', ')}
              {' }'}
            </strong>
          </div>

          <div>
            <span>
              Estado inicial
            </span>

            <strong>
              q₀ = {initialState}
            </strong>
          </div>

          <div>
            <span>
              Aceptación
            </span>

            <strong>
              F = {'{ '}
              {finalStates.join(', ')}
              {' }'}
            </strong>
          </div>
        </div>

        <div className="validator-automata-preview">
          <AutomataPreview
            readOnly

            highlightState={
              simulationActive
                ? currentState
                : null
            }

            highlightTransition={
              simulationActive
                ? activeTransition
                : null
            }
          />
        </div>
      </div>

      {/* =================================
          2. CADENA DE ENTRADA
      ================================= */}

      <div className="validator-card">
        <div className="validator-card-title">
          <span>
            2
          </span>

          <div>
            <h2>
              Cadena de entrada
            </h2>

            <p>
              Ingresa una secuencia
              utilizando los símbolos
              definidos en Σ.
            </p>
          </div>
        </div>

        <div className="validator-input-section">
          <label>
            Cadena
          </label>

          <div className="validator-input-row">
            <input
              type="text"
              value={input}
              placeholder={`Ejemplo: ${alphabet.join(
                ''
              )}`}
              onChange={(
                event
              ) =>
                handleInputChange(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  handleValidate()
                }
              }}
            />

            <button
              type="button"
              className="validate-string-button"
              onClick={
                handleValidate
              }
            >
              <CheckCircle2
                size={16}
              />

              Validar cadena
            </button>

            <button
              type="button"
              className="simulate-string-button"
              onClick={
                handleStartSimulation
              }
            >
              <Play
                size={15}
              />

              Iniciar simulación
            </button>

            <button
              type="button"
              className="reset-string-button"
              onClick={
                handleReset
              }
              title="Limpiar"
            >
              <RotateCcw
                size={15}
              />
            </button>
          </div>

          <p className="validator-input-help">
            Para representar la cadena
            vacía puedes utilizar ε o dejar
            el campo vacío.
          </p>

          <div className="validator-examples">
            <span>
              Ejemplos rápidos:
            </span>

            {examples.map(
              (example) => (
                <button
                  type="button"
                  key={
                    example
                  }
                  onClick={() =>
                    handleInputChange(
                      example
                    )
                  }
                >
                  {example}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* =================================
          3. SIMULACIÓN
      ================================= */}

      <div className="validator-card">
        <div className="validator-card-title">
          <span>
            3
          </span>

          <div>
            <h2>
              Simulación paso a paso
            </h2>

            <p>
              Sigue la lectura de la cadena
              y observa las transiciones
              utilizadas.
            </p>
          </div>
        </div>

        {!result ? (
          <div className="validator-route-empty">
            Ingresa una cadena y selecciona
            “Iniciar simulación” para
            observar el recorrido.
          </div>
        ) : (
          <>
            {simulationActive && (
              <div className="validator-simulation-panel">
                {/* CADENA */}

                <div className="simulation-string-block">
                  <span className="simulation-label">
                    Cadena
                  </span>

                  <div className="simulation-string">
                    {normalizedInput.length ===
                    0 ? (
                      <span className="simulation-empty-string">
                        ε
                      </span>
                    ) : (
                      normalizedInput
                        .split('')
                        .map(
                          (
                            symbol,
                            index
                          ) => {
                            const processed =
                              index <
                              currentStep

                            const current =
                              index ===
                                currentStep &&
                              !simulationFinished

                            return (
                              <span
                                key={`${symbol}-${index}`}
                                className={[
                                  'simulation-symbol',

                                  processed
                                    ? 'processed'
                                    : '',

                                  current
                                    ? 'current'
                                    : '',
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ' '
                                  )}
                              >
                                {
                                  symbol
                                }
                              </span>
                            )
                          }
                        )
                    )}
                  </div>
                </div>

                {/* INFORMACIÓN DEL PASO */}

                <div className="simulation-detail-grid">
                  <div>
                    <span>
                      Paso
                    </span>

                    <strong>
                      {currentStep}{' '}
                      de{' '}
                      {
                        result.steps
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Estado actual
                    </span>

                    <strong className="simulation-state-value">
                      {
                        currentState
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Símbolo procesado
                    </span>

                    <strong>
                      {activeStep
                        ? activeStep.symbol
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Transición
                    </span>

                    <strong>
                      {activeStep
                        ? activeStep.transition
                        : 'Inicio del recorrido'}
                    </strong>
                  </div>
                </div>

                {/* CONTROLES */}

                <div className="simulation-navigation">
                  <button
                    type="button"
                    onClick={
                      handlePreviousStep
                    }
                    disabled={
                      currentStep ===
                      0
                    }
                  >
                    <ChevronLeft
                      size={15}
                    />

                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRestartSimulation
                    }
                    disabled={
                      currentStep ===
                      0
                    }
                  >
                    <RotateCcw
                      size={14}
                    />

                    Reiniciar
                  </button>

                  <button
                    type="button"
                    className="simulation-next-button"
                    onClick={
                      handleNextStep
                    }
                    disabled={
                      simulationFinished
                    }
                  >
                    Siguiente

                    <ChevronRight
                      size={15}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TABLA */}

            <div className="validator-table-wrapper">
              <table className="validator-table">
                <thead>
                  <tr>
                    <th>
                      Paso
                    </th>

                    <th>
                      Estado actual
                    </th>

                    <th>
                      Símbolo leído
                    </th>

                    <th>
                      Transición
                    </th>

                    <th>
                      Nuevo estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleSteps.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="validator-table-empty"
                      >
                        El recorrido aún
                        no ha comenzado.
                      </td>
                    </tr>
                  ) : (
                    visibleSteps.map(
                      (
                        step
                      ) => (
                        <tr
                          key={
                            step.step
                          }
                          className={
                            simulationActive &&
                            step.step ===
                              currentStep
                              ? 'active-validation-step'
                              : ''
                          }
                        >
                          <td>
                            {
                              step.step
                            }
                          </td>

                          <td>
                            {
                              step.currentState
                            }
                          </td>

                          <td>
                            {
                              step.symbol
                            }
                          </td>

                          <td className="validator-transition">
                            {
                              step.transition
                            }
                          </td>

                          <td>
                            {step.nextState ??
                              '—'}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* =================================
          4. RESULTADO
      ================================= */}

      {result &&
        (!simulationActive ||
          simulationFinished) && (
          <div
            className={`validator-result ${
              result.status
            }`}
          >
            <div className="validator-result-icon">
              {result.status ===
              'accepted' ? (
                <CheckCircle2
                  size={28}
                />
              ) : result.status ===
                  'invalid-symbol' ||
                result.status ===
                  'missing-transition' ? (
                <AlertTriangle
                  size={28}
                />
              ) : (
                <XCircle
                  size={28}
                />
              )}
            </div>

            <div>
              <span>
                Resultado de la validación
              </span>

              <h3>
                {result.status ===
                'accepted'
                  ? 'Cadena aceptada'
                  : result.status ===
                      'invalid-symbol'
                    ? 'Símbolo no válido'
                    : result.status ===
                        'missing-transition'
                      ? 'Transición no definida'
                      : 'Cadena rechazada'}
              </h3>

              <p>
                {
                  result.message
                }
              </p>
            </div>
          </div>
        )}
    </section>
  )
}

export default StringValidator