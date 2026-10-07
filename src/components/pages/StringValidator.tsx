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

  /* ======================================
     ESTADOS DE LA INTERFAZ
  ====================================== */

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
   * de transiciones que ya fueron
   * procesadas.
   *
   * 0 = Inicio, todavía estamos en q₀.
   * 1 = Se procesó el primer símbolo.
   * 2 = Se procesaron dos símbolos.
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
     CADENA NORMALIZADA
  ====================================== */

  /*
   * ε representa la cadena vacía.
   */
  const normalizedInput =
    input === 'ε'
      ? ''
      : input

  /* ======================================
     EJEMPLOS RÁPIDOS
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

    setResult(
      validation
    )

    /*
     * Validación directa:
     * no mostramos navegación paso a paso.
     */
    setSimulationActive(
      false
    )

    setCurrentStep(
      validation.steps.length
    )
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

      setResult(
        validation
      )

      setSimulationActive(
        true
      )

      /*
       * MUY IMPORTANTE:
       *
       * La simulación comienza en 0.
       * Todavía no se procesa ningún
       * símbolo.
       *
       * El estado resaltado será q₀.
       */
      setCurrentStep(0)
    }

  /* ======================================
     SIGUIENTE PASO
  ====================================== */

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

  /* ======================================
     PASO ANTERIOR
  ====================================== */

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

  /* ======================================
     REINICIAR SIMULACIÓN
  ====================================== */

  const handleRestartSimulation =
    () => {
      /*
       * Regresa nuevamente al
       * estado inicial q₀.
       */
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
     PASO EJECUTADO ACTUALMENTE
  ====================================== */

  /*
   * Cuando currentStep = 0 todavía
   * no existe una transición ejecutada.
   *
   * Cuando currentStep = 1 utilizamos
   * result.steps[0].
   */
  const activeStep =
    result &&
    currentStep > 0
      ? result.steps[
          currentStep - 1
        ] ?? null
      : null

  /* ======================================
     ESTADO ACTUAL
  ====================================== */

  /*
   * Inicio:
   * estado actual = q₀.
   *
   * Después de cada paso:
   * estado actual = estado alcanzado.
   */
  const currentState =
    currentStep === 0
      ? initialState
      : activeStep?.nextState ??
        activeStep?.currentState ??
        initialState

  /* ======================================
     TRANSICIÓN ACTIVA
  ====================================== */

  /*
   * En el inicio no resaltamos ninguna
   * transición.
   *
   * Solamente después de ejecutar un
   * paso se muestra la flecha utilizada.
   */
  const activeTransition =
    currentStep > 0 &&
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

  /* ======================================
     SIMULACIÓN FINALIZADA
  ====================================== */

  const simulationFinished =
    Boolean(result) &&
    currentStep >=
      (result?.steps.length ??
        0)

  /* ======================================
     PRÓXIMO SÍMBOLO
  ====================================== */

  /*
   * currentStep también representa
   * la posición del próximo símbolo
   * pendiente.
   */
  const nextSymbol =
    !simulationFinished
      ? normalizedInput[
          currentStep
        ] ?? null
      : null

  /* ======================================
     PASOS VISIBLES EN LA TABLA
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

  /* ======================================
     INTERFAZ
  ====================================== */

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

        {/* RESUMEN */}

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

        {/* GRÁFICO */}

        <div className="validator-automata-preview">
          <AutomataPreview
            readOnly

            /*
             * Apenas comienza la
             * simulación se resalta q₀.
             */
            highlightState={
              simulationActive
                ? currentState
                : null
            }

            /*
             * En el paso 0 no existe
             * transición resaltada.
             */
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
            {/* =============================
                PANEL DE SIMULACIÓN
            ============================= */}

            {simulationActive && (
              <div className="validator-simulation-panel">
                {/* =========================
                    CADENA
                ========================= */}

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
                            /*
                             * Verde:
                             * símbolo ya procesado.
                             */
                            const processed =
                              index <
                              currentStep

                            /*
                             * Naranja:
                             * próximo símbolo que
                             * será procesado.
                             */
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

                {/* =========================
                    INFORMACIÓN
                ========================= */}

                <div className="simulation-detail-grid">
                  {/* PROGRESO */}

                  <div>
                    <span>
                      Progreso
                    </span>

                    <strong>
                      {currentStep ===
                      0
                        ? 'Inicio'
                        : `Paso ${currentStep} de ${result.steps.length}`}
                    </strong>
                  </div>

                  {/* ESTADO ACTUAL */}

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

                  {/* SÍMBOLO */}

                  <div>
                    <span>
                      {currentStep ===
                      0
                        ? 'Próximo símbolo'
                        : 'Símbolo procesado'}
                    </span>

                    <strong>
                      {currentStep ===
                      0
                        ? nextSymbol ??
                          '—'
                        : activeStep?.symbol ??
                          '—'}
                    </strong>
                  </div>

                  {/* TRANSICIÓN */}

                  <div>
                    <span>
                      Transición
                    </span>

                    <strong>
                      {currentStep ===
                      0
                        ? `Inicio en ${initialState}`
                        : activeStep?.transition ??
                          '—'}
                    </strong>
                  </div>
                </div>

                {/* =========================
                    CONTROLES
                ========================= */}

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

            {/* =============================
                TABLA
            ============================= */}

            <div className="validator-table-wrapper">
              <table className="validator-table">
                <thead>
                  <tr>
                    <th>
                      Paso
                    </th>

                    <th>
                      Estado anterior
                    </th>

                    <th>
                      Símbolo leído
                    </th>

                    <th>
                      Transición
                    </th>

                    <th>
                      Estado alcanzado
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
                        {simulationActive
                          ? `Inicio del recorrido en ${initialState}.`
                          : 'El recorrido aún no ha comenzado.'}
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