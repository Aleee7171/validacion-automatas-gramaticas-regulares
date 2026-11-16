import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ========================================
   TIPOS
======================================== */

export interface Transition {
  from: string
  symbol: string
  to: string
}

export interface NodePosition {
  x: number
  y: number
}

export interface AutomataState {
  states: string[]
  alphabet: string[]
  initialState: string
  finalStates: string[]
  transitions: Transition[]

  /*
   * Posición visual de cada estado.
   *
   * Ejemplo:
   *
   * {
   *   q0: { x: 100, y: 150 },
   *   q1: { x: 300, y: 100 }
   * }
   */
  nodePositions: Record<
    string,
    NodePosition
  >

  /* ==============================
     ESTADOS
  ============================== */

  addState: (
    state: string
  ) => void

  removeState: (
    state: string
  ) => void

  /* ==============================
     ALFABETO
  ============================== */

  addSymbol: (
    symbol: string
  ) => void

  removeSymbol: (
    symbol: string
  ) => void

  /* ==============================
     ESTADO INICIAL Y FINALES
  ============================== */

  setInitialState: (
    state: string
  ) => void

  toggleFinalState: (
    state: string
  ) => void

  /* ==============================
     TRANSICIONES
  ============================== */

  addTransition: (
    transition: Transition
  ) => boolean

  removeTransition: (
    from: string,
    symbol: string
  ) => void

  /* ==============================
     POSICIONES
  ============================== */

  setNodePosition: (
    state: string,
    position: NodePosition
  ) => void

  setNodePositions: (
    positions: Record<
      string,
      NodePosition
    >
  ) => void

  /* ==============================
     LIMPIAR
  ============================== */

  resetAutomata: () => void
}

/* ========================================
   STORE
======================================== */

export const useAutomataStore =
  create<AutomataState>()(
    persist(
      (set, get) => ({
        states: [],

        alphabet: [],

        initialState: '',

        finalStates: [],

        transitions: [],

        nodePositions: {},

        /* ==============================
           ESTADOS
        ============================== */

        addState: (
          state
        ) => {
          const cleanState =
            state.trim()

          if (!cleanState) {
            return
          }

          const {
            states,
          } = get()

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

        removeState: (
          state
        ) => {
          const {
            states,
            initialState,
            finalStates,
            transitions,
            nodePositions,
          } = get()

          /*
           * Copiamos las posiciones
           * actuales y eliminamos
           * la correspondiente al
           * estado eliminado.
           */
          const updatedPositions = {
            ...nodePositions,
          }

          delete updatedPositions[
            state
          ]

          set({
            /*
             * Eliminar estado.
             */
            states:
              states.filter(
                (item) =>
                  item !==
                  state
              ),

            /*
             * Si era estado inicial,
             * se limpia.
             */
            initialState:
              initialState ===
              state
                ? ''
                : initialState,

            /*
             * Se elimina del conjunto
             * de estados finales.
             */
            finalStates:
              finalStates.filter(
                (item) =>
                  item !==
                  state
              ),

            /*
             * También se eliminan
             * las transiciones que
             * llegan o salen del estado.
             */
            transitions:
              transitions.filter(
                (
                  transition
                ) =>
                  transition.from !==
                    state &&
                  transition.to !==
                    state
              ),

            /*
             * Se elimina su posición
             * gráfica.
             */
            nodePositions:
              updatedPositions,
          })
        },

        /* ==============================
           ALFABETO
        ============================== */

        addSymbol: (
          symbol
        ) => {
          const cleanSymbol =
            symbol.trim()

          if (!cleanSymbol) {
            return
          }

          const {
            alphabet,
          } = get()

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
                  item !==
                  symbol
              ),

            /*
             * Si eliminamos un símbolo,
             * también eliminamos sus
             * transiciones.
             */
            transitions:
              transitions.filter(
                (
                  transition
                ) =>
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

          /*
           * Si ya es final,
           * se elimina.
           */
          if (
            finalStates.includes(
              state
            )
          ) {
            set({
              finalStates:
                finalStates.filter(
                  (item) =>
                    item !==
                    state
                ),
            })

            return
          }

          /*
           * Si no es final,
           * se agrega.
           */
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

          /*
           * En un AFD no pueden existir
           * dos transiciones con la misma
           * combinación:
           *
           * estado origen + símbolo
           */
          const alreadyExists =
            transitions.some(
              (item) =>
                item.from ===
                  transition.from &&
                item.symbol ===
                  transition.symbol
            )

          if (
            alreadyExists
          ) {
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
                (
                  transition
                ) =>
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
           POSICIÓN DE UN ESTADO
        ============================== */

        setNodePosition: (
          state,
          position
        ) => {
          const {
            nodePositions,
          } = get()

          set({
            nodePositions: {
              ...nodePositions,

              [state]: {
                x:
                  position.x,

                y:
                  position.y,
              },
            },
          })
        },

        /* ==============================
           TODAS LAS POSICIONES
        ============================== */

        setNodePositions: (
          positions
        ) => {
          set({
            nodePositions:
              positions,
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

            /*
             * También eliminamos
             * las posiciones guardadas.
             */
            nodePositions: {},
          })
        },
      }),

      {
        /* ==============================
           PERSISTENCIA
        ============================== */

        name:
          'autogram-automata',

        /*
         * Datos que se guardarán
         * en localStorage.
         *
         * Incluimos también las
         * posiciones de los estados.
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

          nodePositions:
            state.nodePositions,
        }),
      }
    )
  )