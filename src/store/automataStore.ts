import { create } from 'zustand'

export interface Transition {
  from: string
  symbol: string
  to: string
}

export interface AutomataState {
  states: string[]
  alphabet: string[]
  initialState: string
  finalStates: string[]
  transitions: Transition[]

  addState: (state: string) => void
  removeState: (state: string) => void

  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void

  setInitialState: (state: string) => void
  toggleFinalState: (state: string) => void

  addTransition: (transition: Transition) => boolean
  removeTransition: (
    from: string,
    symbol: string
  ) => void

  resetAutomata: () => void
}

export const useAutomataStore =
  create<AutomataState>((set, get) => ({
    states: [],
    alphabet: [],
    initialState: '',
    finalStates: [],
    transitions: [],

    addState: (state) =>
      set((current) => {
        if (current.states.includes(state)) {
          return current
        }

        return {
          states: [...current.states, state],
        }
      }),

    removeState: (state) =>
      set((current) => ({
        states: current.states.filter(
          (item) => item !== state
        ),

        initialState:
          current.initialState === state
            ? ''
            : current.initialState,

        finalStates: current.finalStates.filter(
          (item) => item !== state
        ),

        transitions:
          current.transitions.filter(
            (transition) =>
              transition.from !== state &&
              transition.to !== state
          ),
      })),

    addSymbol: (symbol) =>
      set((current) => {
        if (current.alphabet.includes(symbol)) {
          return current
        }

        return {
          alphabet: [...current.alphabet, symbol],
        }
      }),

    removeSymbol: (symbol) =>
      set((current) => ({
        alphabet: current.alphabet.filter(
          (item) => item !== symbol
        ),

        transitions:
          current.transitions.filter(
            (transition) =>
              transition.symbol !== symbol
          ),
      })),

    setInitialState: (state) =>
      set({
        initialState: state,
      }),

    toggleFinalState: (state) =>
      set((current) => ({
        finalStates:
          current.finalStates.includes(state)
            ? current.finalStates.filter(
                (item) => item !== state
              )
            : [...current.finalStates, state],
      })),

    addTransition: (transition) => {
      const current = get()

      const alreadyExists =
        current.transitions.some(
          (item) =>
            item.from === transition.from &&
            item.symbol === transition.symbol
        )

      if (alreadyExists) {
        return false
      }

      set({
        transitions: [
          ...current.transitions,
          transition,
        ],
      })

      return true
    },

    removeTransition: (from, symbol) =>
      set((current) => ({
        transitions:
          current.transitions.filter(
            (transition) =>
              !(
                transition.from === from &&
                transition.symbol === symbol
              )
          ),
      })),

    resetAutomata: () =>
      set({
        states: [],
        alphabet: [],
        initialState: '',
        finalStates: [],
        transitions: [],
      }),
  }))