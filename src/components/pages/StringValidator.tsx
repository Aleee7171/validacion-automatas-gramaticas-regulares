import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  Play,
  RotateCcw,
  XCircle,
} from 'lucide-react'

import { useAutomataStore } from '../../store/automataStore'

import {
  validateString,
  type ValidationResult,
} from '../../features/string-validator/logic/validateString'

type StringValidatorProps = {
  onEditAutomata: () => void
}

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

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0)

  /* ======================================
     COMPROBAR SI EXISTE AUTÓMATA
  ====================================== */

  const automataReady =
    states.length > 0 &&
    alphabet.length > 0 &&
    Boolean(initialState) &&
    finalStates.length > 0

  /* ======================================
     EJEMPLOS RÁPIDOS
  ====================================== */

  const examples =
    useMemo(() => {
      const values: string[] = [
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
      } else if (
        alphabet[0]
      ) {
        values.push(
          `${alphabet[0]}${alphabet[0]}`
        )
      }

      return [
        ...new Set(values),
      ]
    }, [alphabet])

  /* ======================================
     VALIDAR DIRECTAMENTE
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

    setResult(validation)

    setSimulationActive(
      false
    )

    setCurrentStep(0)
  }

  /* ======================================
     INICIAR SIMULACIÓN
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

      setResult(validation)

      setSimulationActive(
        true
      )

      setCurrentStep(0)
    }

  /* ======================================
     SIGUIENTE PASO
  ====================================== */

  const handleNextStep = () => {
    if (!result) {
      return
    }

    if (
      currentStep <
      result.steps.length
    ) {
      setCurrentStep(
        (value) =>
          value + 1
      )
    }
  }

  /* ======================================
     PASO ANTERIOR
  ====================================== */

  const handlePreviousStep =
    () => {
      setCurrentStep(
        (value) =>
          Math.max(
            0,
            value - 1
          )
      )
    }

  /* ======================================
     REINICIAR
  ====================================== */

  const handleReset = () => {
    setInput('')
    setResult(null)

    setSimulationActive(
      false
    )

    setCurrentStep(0)
  }

  /* ======================================
     CAMBIAR CADENA
  ====================================== */

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
     PASO ACTUAL
  ====================================== */

  const visibleSteps =
    result
      ? result.steps.slice(
          0,
          simulationActive
            ? currentStep
            : result.steps.length
        )
      : []

  const simulationFinished =
    Boolean(result) &&
    currentStep >=
      (result?.steps.length ??
        0)

  const displayedState =
    useMemo(() => {
      if (!result) {
        return initialState
      }

      if (
        currentStep === 0
      ) {
        return initialState
      }

      const step =
        result.steps[
          Math.min(
            currentStep - 1,
            result.steps.length -
              1
          )
        ]

      return (
        step?.nextState ??
        step?.currentState ??
        initialState
      )
    }, [
      result,
      currentStep,
      initialState,
    ])

  /* ======================================
     AUTÓMATA NO DEFINIDO
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
              Valida cadenas y
              observa su recorrido
              dentro del AFD.
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
              Primero debes definir
              los estados, alfabeto,
              estado inicial y
              estados de aceptación.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onEditAutomata
            }
          >
            Ir a construir
            autómata
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
            Ingresa una cadena y
            revisa su recorrido paso
            a paso dentro del AFD.
          </p>
        </div>
      </div>

      {/* =================================
          RESUMEN DEL AUTÓMATA
      ================================= */}

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

      {/* =================================
          1. INGRESO DE CADENA
      ================================= */}

      <div className="validator-card">
        <div className="validator-card-title">
          <span>
            1
          </span>

          <div>
            <h2>
              Ingreso de cadena
            </h2>

            <p>
              Escribe una secuencia
              formada por símbolos
              pertenecientes al
              alfabeto del autómata.
            </p>
          </div>
        </div>

        <div className="validator-input-section">
          <label>
            Cadena de entrada
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
              aria-label="Reiniciar validación"
            >
              <RotateCcw
                size={15}
              />
            </button>
          </div>

          <p className="validator-input-help">
            Para representar la
            cadena vacía puedes
            utilizar ε o dejar el
            campo vacío.
          </p>

          {/* EJEMPLOS */}

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
          2. RECORRIDO
      ================================= */}

      <div className="validator-card">
        <div className="validator-card-title">
          <span>
            2
          </span>

          <div>
            <h2>
              Recorrido de la cadena
            </h2>

            <p>
              Observa el estado
              actual, símbolo leído y
              transición utilizada.
            </p>
          </div>
        </div>

        {!result ? (
          <div className="validator-route-empty">
            Valida una cadena o
            inicia una simulación
            para visualizar su
            recorrido.
          </div>
        ) : (
          <>
            {/* SIMULACIÓN */}

            {simulationActive && (
              <div className="validator-simulation">
                <div className="simulation-current-state">
                  <span>
                    Estado actual
                  </span>

                  <strong>
                    {
                      displayedState
                    }
                  </strong>
                </div>

                <div className="simulation-progress">
                  Paso{' '}
                  {currentStep}{' '}
                  de{' '}
                  {
                    result.steps
                      .length
                  }
                </div>

                <div className="simulation-controls">
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
                    ← Anterior
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextStep
                    }
                    disabled={
                      simulationFinished
                    }
                  >
                    Siguiente →
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
                        El recorrido
                        todavía no ha
                        comenzado.
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
          3. RESULTADO
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
                Resultado de la
                validación
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
                {result.message}
              </p>
            </div>
          </div>
        )}
    </section>
  )
}

export default StringValidator