import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  addTransition: (
    transition: Transition
  ) => boolean

  removeTransition: (
    from: string,
    symbol: string
  ) => void

  resetAutomata: () => void
}

export const useAutomataStore =
  create<AutomataState>()(
    persist(
      (set, get) => ({
        states: [],
        alphabet: [],
        initialState: '',
        finalStates: [],
        transitions: [],

        /* ==============================
           ESTADOS
        ============================== */

        addState: (state) => {
          const cleanState =
            state.trim()

          if (!cleanState) {
            return
          }

          const { states } =
            get()

          if (
            states.includes(
              cleanState
            )
          ) {
            return
          }

          set({
            states: [
              ...states,
              cleanState,
            ],
          })
        },

        removeState: (state) => {
          const {
            states,
            initialState,
            finalStates,
            transitions,
          } = get()

          set({
            states:
              states.filter(
                (item) =>
                  item !== state
              ),

            initialState:
              initialState === state
                ? ''
                : initialState,

            finalStates:
              finalStates.filter(
                (item) =>
                  item !== state
              ),

            transitions:
              transitions.filter(
                (transition) =>
                  transition.from !==
                    state &&
                  transition.to !==
                    state
              ),
          })
        },

        /* ==============================
           ALFABETO
        ============================== */

        addSymbol: (symbol) => {
          const cleanSymbol =
            symbol.trim()

          if (!cleanSymbol) {
            return
          }

          const { alphabet } =
            get()

          if (
            alphabet.includes(
              cleanSymbol
            )
          ) {
            return
          }

          set({
            alphabet: [
              ...alphabet,
              cleanSymbol,
            ],
          })
        },

        removeSymbol: (
          symbol
        ) => {
          const {
            alphabet,
            transitions,
          } = get()

          set({
            alphabet:
              alphabet.filter(
                (item) =>
                  item !== symbol
              ),

            transitions:
              transitions.filter(
                (transition) =>
                  transition.symbol !==
                  symbol
              ),
          })
        },

        /* ==============================
           ESTADO INICIAL
        ============================== */

        setInitialState: (
          state
        ) => {
          set({
            initialState:
              state,
          })
        },

        /* ==============================
           ESTADOS FINALES
        ============================== */

        toggleFinalState: (
          state
        ) => {
          const {
            finalStates,
          } = get()

          if (
            finalStates.includes(
              state
            )
          ) {
            set({
              finalStates:
                finalStates.filter(
                  (item) =>
                    item !== state
                ),
            })

            return
          }

          set({
            finalStates: [
              ...finalStates,
              state,
            ],
          })
        },

        /* ==============================
           TRANSICIONES
        ============================== */

        addTransition: (
          transition
        ) => {
          const {
            transitions,
          } = get()
          
          const alreadyExists =
            transitions.some(
              (item) =>
                item.from ===
                  transition.from &&
                item.symbol ===
                  transition.symbol
            )

          if (alreadyExists) {
            return false
          }

          set({
            transitions: [
              ...transitions,
              transition,
            ],
          })

          return true
        },

        removeTransition: (
          from,
          symbol
        ) => {
          const {
            transitions,
          } = get()

          set({
            transitions:
              transitions.filter(
                (transition) =>
                  !(
                    transition.from ===
                      from &&
                    transition.symbol ===
                      symbol
                  )
              ),
          })
        },

        /* ==============================
           LIMPIAR AUTÓMATA
        ============================== */

        resetAutomata: () => {
          set({
            states: [],
            alphabet: [],
            initialState: '',
            finalStates: [],
            transitions: [],
          })
        },
      }),

      {
        /*
         * Nombre utilizado en
         * localStorage.
         */
        name:
          'autogram-automata',

        /*
         * Solo se guardan los datos
         * del autómata.
         */
        partialize: (
          state
        ) => ({
          states:
            state.states,

          alphabet:
            state.alphabet,

          initialState:
            state.initialState,

          finalStates:
            state.finalStates,

          transitions:
            state.transitions,
        }),
      }
    )
  )