import type { Transition } from '../../../store/automataStore'

/* ========================================
TIPOS
======================================== */

export type ValidationStatus =
  | 'accepted'
  | 'rejected'
  | 'invalid-symbol'
  | 'missing-transition'

export interface ValidationStep {
  step: number
  currentState: string
  symbol: string
  transition: string
  nextState: string | null
}

export interface ValidationResult {
  status: ValidationStatus

  accepted: boolean

  finalState: string

  steps: ValidationStep[]

  message: string

  invalidSymbol?: string
}

/* ========================================
   VALIDAR CADENA
======================================== */

export function validateString(
  input: string,
  alphabet: string[],
  initialState: string,
  finalStates: string[],
  transitions: Transition[]
): ValidationResult {
  /*
   * Permitimos escribir ε para representar
   * explícitamente la cadena vacía.
   */
  const normalizedInput =
    input === 'ε'
      ? ''
      : input

  /* ======================================
     VALIDAR SÍMBOLOS
  ====================================== */

  for (const symbol of normalizedInput) {
    if (!alphabet.includes(symbol)) {
      return {
        status: 'invalid-symbol',

        accepted: false,

        finalState:
          initialState,

        steps: [],

        invalidSymbol:
          symbol,

        message:
          `El símbolo "${symbol}" no pertenece al alfabeto Σ.`,
      }
    }
  }

  /* ======================================
     ESTADO INICIAL
  ====================================== */

  let currentState =
    initialState

  const steps:
    ValidationStep[] = []

  /* ======================================
     RECORRIDO DE LA CADENA
  ====================================== */

  for (
    let index = 0;
    index < normalizedInput.length;
    index++
  ) {
    const symbol =
      normalizedInput[index]

    const transition =
      transitions.find(
        (item) =>
          item.from ===
            currentState &&
          item.symbol ===
            symbol
      )

    /*
     * No existe una transición para
     * el estado y símbolo actuales.
     */
    if (!transition) {
      steps.push({
        step:
          index + 1,

        currentState,

        symbol,

        transition:
          `δ(${currentState}, ${symbol}) no definida`,

        nextState:
          null,
      })

      return {
        status:
          'missing-transition',

        accepted:
          false,

        finalState:
          currentState,

        steps,

        message:
          `No existe una transición definida para δ(${currentState}, ${symbol}).`,
      }
    }

    /*
     * Registramos el paso realizado.
     */
    steps.push({
      step:
        index + 1,

      currentState,

      symbol,

      transition:
        `δ(${currentState}, ${symbol}) = ${transition.to}`,

      nextState:
        transition.to,
    })

    /*
     * Avanzamos al siguiente estado.
     */
    currentState =
      transition.to
  }

  /* ======================================
     COMPROBAR ESTADO FINAL
  ====================================== */

  const accepted =
    finalStates.includes(
      currentState
    )

  if (accepted) {
    return {
      status:
        'accepted',

      accepted:
        true,

      finalState:
        currentState,

      steps,

      message:
        normalizedInput.length === 0
          ? `La cadena vacía es aceptada porque ${currentState} es un estado de aceptación.`
          : `La cadena es aceptada. El recorrido termina en el estado de aceptación ${currentState}.`,
    }
  }

  return {
    status:
      'rejected',

    accepted:
      false,

    finalState:
      currentState,

    steps,

    message:
      normalizedInput.length === 0
        ? `La cadena vacía es rechazada porque ${currentState} no es un estado de aceptación.`
        : `La cadena es rechazada. El recorrido termina en ${currentState}, que no pertenece al conjunto de estados de aceptación.`,
  }
}