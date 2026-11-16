
import type { Transition } from '../../../store/automataStore'

export interface GrammarProduction {
  from: string
  terminal: string | null
  to: string | null
  expression: string
}

export interface RegularGrammar {
  nonTerminals: string[]
  terminals: string[]
  startSymbol: string
  productions: GrammarProduction[]
  stateNames: Record<string, string>
}

export interface AutomataForConversion {
  states: string[]
  alphabet: string[]
  initialState: string
  finalStates: string[]
  transitions: Transition[]
}

/**
 * Convierte un AFD en una gramática regular
 * lineal por la derecha.
 */
export function convertToGrammar(
  automata: AutomataForConversion
): RegularGrammar {
  const {
    states,
    alphabet,
    initialState,
    finalStates,
    transitions,
  } = automata

  // Validar la configuración del autómata.
  if (
    !states.length ||
    !alphabet.length ||
    !initialState ||
    !states.includes(initialState)
  ) {
    throw new Error(
      'Define los estados, el alfabeto y un estado inicial válido antes de convertir.'
    )
  }

  if (
    finalStates.some(
      (state) => !states.includes(state)
    )
  ) {
    throw new Error(
      'Los estados de aceptación deben pertenecer al autómata.'
    )
  }

  if (
    alphabet.some(
      (symbol) => symbol.length !== 1 || symbol === 'ε'
    )
  ) {
    throw new Error(
      'El alfabeto debe contener símbolos individuales distintos de ε.'
    )
  }

  // El estado inicial siempre corresponde al no terminal S.
  // Los demás estados se asignan a A, B, C, ..., sin usar S otra vez.
  const stateNames: Record<string, string> = {
    [initialState]: 'S',
  }

  const letters = 'ABCDEFGHIJKLMNOPQRTUVWXYZ' // Excluir S.

  function getNonTerminal(index: number): string {
    if (index < letters.length) return letters[index]

    // Para autómatas grandes, continuar con AA, AB, ..., AZ, ABA, ...
    let extra = index - letters.length
    let suffix = ''
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    do {
      suffix = alphabet[extra % 26] + suffix
      extra = Math.floor(extra / 26) - 1
    } while (extra >= 0)
    return `A${suffix}`
  }

  let nextIndex = 0
  for (const state of states) {
    if (state !== initialState) {
      stateNames[state] = getNonTerminal(nextIndex++)
    }
  }

  const productions: GrammarProduction[] = []
  const seen = new Set<string>()

  // Convertir transiciones en producciones.
  for (const transition of transitions) {
    if (
      !states.includes(transition.from) ||
      !states.includes(transition.to) ||
      !alphabet.includes(transition.symbol)
    ) {
      throw new Error(
        'Existen transiciones que no corresponden a los estados o al alfabeto.'
      )
    }

    const key =
      `${transition.from}\u0000${transition.symbol}`

    if (seen.has(key)) {
      throw new Error(
        'El autómata contiene transiciones no determinísticas.'
      )
    }

    seen.add(key)

    productions.push({
      from: stateNames[transition.from],
      terminal: transition.symbol,
      to: stateNames[transition.to],
      expression:
        `${transition.symbol}${stateNames[transition.to]}`,
    })
  }

  // Agregar ε para los estados de aceptación.
  for (const state of states) {
    if (finalStates.includes(state)) {
      productions.push({
        from: stateNames[state],
        terminal: null,
        to: null,
        expression: 'ε',
      })
    }
  }

  return {
    nonTerminals: states.map(
      (state) => stateNames[state]
    ),
    terminals: [...alphabet],
    startSymbol: stateNames[initialState],
    productions,
    stateNames,
  }
}
