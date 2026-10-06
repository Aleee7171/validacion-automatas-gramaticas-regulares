import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getBezierPath,
  useNodesState,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'

import dagre from 'dagre'
import {
  useEffect,
  useMemo,
} from 'react'

import '@xyflow/react/dist/style.css'

import { useAutomataStore } from '../../../store/automataStore'

/* ========================================
   TIPOS
======================================== */

type StateNodeData = {
  label: string
  isInitial: boolean
  isFinal: boolean
}

type StateNode =
  Node<StateNodeData, 'state'>

type Side =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'

type VisualTransition = {
  key: string
  from: string
  to: string
  symbols: string[]

  sourceSide: Side
  targetSide: Side

  sourceSlot: number
  targetSlot: number

  isLoop: boolean
}

/* ========================================
   POSICIONES DE LOS PUERTOS
======================================== */

const HANDLE_POSITIONS = [
  18,
  34,
  50,
  66,
  82,
]

/* ========================================
   HANDLES DEL NODO
======================================== */

function StateHandles() {
  const horizontalSides = [
    {
      side: 'left',
      position: Position.Left,
    },
    {
      side: 'right',
      position: Position.Right,
    },
  ] as const

  const verticalSides = [
    {
      side: 'top',
      position: Position.Top,
    },
    {
      side: 'bottom',
      position: Position.Bottom,
    },
  ] as const

  return (
    <>
      {horizontalSides.map(
        ({ side, position }) =>
          HANDLE_POSITIONS.map(
            (percentage, index) => (
              <span
                key={`${side}-${index}`}
              >
                <Handle
                  id={`target-${side}-${index}`}
                  type="target"
                  position={position}
                  style={{
                    top: `${percentage}%`,
                  }}
                  className="afd-node-handle"
                />

                <Handle
                  id={`source-${side}-${index}`}
                  type="source"
                  position={position}
                  style={{
                    top: `${percentage}%`,
                  }}
                  className="afd-node-handle"
                />
              </span>
            )
          )
      )}

      {verticalSides.map(
        ({ side, position }) =>
          HANDLE_POSITIONS.map(
            (percentage, index) => (
              <span
                key={`${side}-${index}`}
              >
                <Handle
                  id={`target-${side}-${index}`}
                  type="target"
                  position={position}
                  style={{
                    left: `${percentage}%`,
                  }}
                  className="afd-node-handle"
                />

                <Handle
                  id={`source-${side}-${index}`}
                  type="source"
                  position={position}
                  style={{
                    left: `${percentage}%`,
                  }}
                  className="afd-node-handle"
                />
              </span>
            )
          )
      )}
    </>
  )
}

/* ========================================
   NODO DEL AUTÓMATA
======================================== */

function AutomataStateNode({
  data,
}: NodeProps<StateNode>) {
  return (
    <div
      className={`afd-graph-node ${
        data.isFinal ? 'final' : ''
      }`}
    >
      {data.isInitial && (
        <span className="afd-initial-indicator">
          →
        </span>
      )}

      <StateHandles />

      <div className="afd-state-circle">
        <span>
          {data.label}
        </span>
      </div>
    </div>
  )
}

const nodeTypes = {
  state: AutomataStateNode,
}

/* ========================================
   EDGE PERSONALIZADO
======================================== */

function AutomataEdge({
  id,
  source,
  target,

  sourceX,
  sourceY,

  targetX,
  targetY,

  sourcePosition,
  targetPosition,

  markerEnd,
  style,
  label,
}: EdgeProps) {
  const isLoop =
    source === target

  let edgePath = ''
  let labelX = 0
  let labelY = 0

  /* ======================================
     BUCLE
  ====================================== */

  if (isLoop) {
    const height = 75

    const direction =
      sourceX >= targetX
        ? 1
        : -1

    const control1X =
      sourceX +
      42 * direction

    const control2X =
      targetX -
      42 * direction

    edgePath = `
      M ${sourceX} ${sourceY}
      C
      ${control1X} ${sourceY - height},
      ${control2X} ${targetY - height},
      ${targetX} ${targetY}
    `

    labelX =
      (sourceX + targetX) / 2

    labelY =
      Math.min(
        sourceY,
        targetY
      ) -
      height +
      10
  } else {
    const bezier =
      getBezierPath({
        sourceX,
        sourceY,

        sourcePosition,

        targetX,
        targetY,

        targetPosition,

        curvature: 0.32,
      })

    edgePath =
      bezier[0]

    labelX =
      bezier[1]

    labelY =
      bezier[2]
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            className="afd-edge-label"
            style={{
              transform: `
                translate(-50%, -50%)
                translate(
                  ${labelX}px,
                  ${labelY}px
                )
              `,
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const edgeTypes = {
  automata: AutomataEdge,
}

/* ========================================
   DISTRIBUCIÓN AUTOMÁTICA CON DAGRE
======================================== */

function createLayout(
  states: string[],
  initialState: string,
  finalStates: string[],
  transitions: {
    from: string
    symbol: string
    to: string
  }[]
): StateNode[] {
  const graph =
    new dagre.graphlib.Graph()

  graph.setDefaultEdgeLabel(
    () => ({})
  )

  graph.setGraph({
    rankdir: 'LR',

    ranksep: 150,

    nodesep: 90,

    marginx: 60,
    marginy: 60,
  })

  states.forEach((state) => {
    graph.setNode(state, {
      width: 90,
      height: 90,
    })
  })

  /*
   * Los bucles no modifican
   * la organización del grafo.
   */
  transitions.forEach(
    (transition) => {
      if (
        transition.from !==
        transition.to
      ) {
        graph.setEdge(
          transition.from,
          transition.to
        )
      }
    }
  )

  dagre.layout(graph)

  return states.map(
    (state, index) => {
      const node =
        graph.node(state)

      return {
        id: state,

        type: 'state',

        position: node
          ? {
              x:
                node.x -
                45,

              y:
                node.y -
                45,
            }
          : {
              x:
                120 +
                index * 180,

              y: 150,
            },

        data: {
          label:
            state,

          isInitial:
            initialState ===
            state,

          isFinal:
            finalStates.includes(
              state
            ),
        },
      }
    }
  )
}

/* ========================================
   DETERMINAR LADO DE LA FLECHA
======================================== */

function getSides(
  source: {
    x: number
    y: number
  },

  target: {
    x: number
    y: number
  }
): {
  sourceSide: Side
  targetSide: Side
} {
  const dx =
    target.x -
    source.x

  const dy =
    target.y -
    source.y

  /*
   * Dirección principalmente horizontal.
   */
  if (
    Math.abs(dx) >=
    Math.abs(dy)
  ) {
    if (dx >= 0) {
      return {
        sourceSide:
          'right',

        targetSide:
          'left',
      }
    }

    return {
      sourceSide:
        'left',

      targetSide:
        'right',
    }
  }

  /*
   * Dirección principalmente vertical.
   */
  if (dy >= 0) {
    return {
      sourceSide:
        'bottom',

      targetSide:
        'top',
    }
  }

  return {
    sourceSide:
      'top',

    targetSide:
      'bottom',
  }
}

/* ========================================
   DISTRIBUIR PUNTOS DE CONEXIÓN
======================================== */

function getSlot(
  index: number,
  total: number
) {
  if (total <= 1) {
    return 2
  }

  if (total === 2) {
    return index === 0
      ? 1
      : 3
  }

  const slot =
    Math.round(
      (index * 4) /
      (total - 1)
    )

  return Math.min(
    4,
    Math.max(
      0,
      slot
    )
  )
}

/* ========================================
   COMPONENTE PRINCIPAL
======================================== */

function AutomataPreview() {
  const {
    states,
    initialState,
    finalStates,
    transitions,
  } = useAutomataStore()

  /* ======================================
     NODOS
  ====================================== */

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] =
    useNodesState<StateNode>(
      []
    )

  /*
   * Mantiene las posiciones colocadas
   * manualmente por el usuario.
   *
   * Solo crea posición para estados nuevos.
   */
  useEffect(() => {
    setNodes(
      (currentNodes) =>
        states.map(
          (state, index) => {
            const existingNode =
              currentNodes.find(
                (node) =>
                  node.id ===
                  state
              )

            /*
             * Si ya existe,
             * conserva su posición.
             */
            if (existingNode) {
              return {
                ...existingNode,

                data: {
                  label:
                    state,

                  isInitial:
                    initialState ===
                    state,

                  isFinal:
                    finalStates.includes(
                      state
                    ),
                },
              }
            }

            /*
             * Estado nuevo.
             *
             * Se coloca inicialmente
             * en una cuadrícula sencilla.
             */
            const column =
              index % 4

            const row =
              Math.floor(
                index / 4
              )

            return {
              id: state,

              type: 'state',

              position: {
                x:
                  100 +
                  column * 180,

                y:
                  100 +
                  row * 150,
              },

              data: {
                label:
                  state,

                isInitial:
                  initialState ===
                  state,

                isFinal:
                  finalStates.includes(
                    state
                  ),
              },
            }
          }
        )
    )
  }, [
    states,
    initialState,
    finalStates,
    setNodes,
  ])

  /* ======================================
     REORGANIZAR
  ====================================== */

  const handleReorganize =
    () => {
      const organizedNodes =
        createLayout(
          states,
          initialState,
          finalStates,
          transitions
        )

      setNodes(
        organizedNodes
      )
    }

  /* ======================================
     POSICIONES ACTUALES
  ====================================== */

  const positionMap =
    useMemo(
      () =>
        new Map(
          nodes.map(
            (node) => [
              node.id,
              node.position,
            ]
          )
        ),
      [nodes]
    )

  const stateOrder =
    useMemo(
      () =>
        new Map(
          states.map(
            (
              state,
              index
            ) => [
              state,
              index,
            ]
          )
        ),
      [states]
    )

  /* ======================================
     AGRUPAR TRANSICIONES
  ====================================== */

  const groupedTransitions =
    useMemo(() => {
      const grouped =
        new Map<
          string,
          {
            from: string
            to: string
            symbols: string[]
          }
        >()

      transitions.forEach(
        (transition) => {
          const key =
            `${transition.from}::${transition.to}`

          const existing =
            grouped.get(key)

          if (existing) {
            existing.symbols.push(
              transition.symbol
            )
          } else {
            grouped.set(
              key,
              {
                from:
                  transition.from,

                to:
                  transition.to,

                symbols: [
                  transition.symbol,
                ],
              }
            )
          }
        }
      )

      return grouped
    }, [transitions])

  /* ======================================
     CALCULAR CONEXIONES VISUALES
  ====================================== */

  const visualTransitions =
    useMemo(() => {
      const result:
        VisualTransition[] =
        []

      /*
       * Primero determinamos
       * los lados generales.
       */
      Array.from(
        groupedTransitions.values()
      ).forEach(
        (transition) => {
          const key =
            `${transition.from}::${transition.to}`

          const isLoop =
            transition.from ===
            transition.to

          /* ==============================
             BUCLE
          ============================== */

          if (isLoop) {
            result.push({
              key,

              ...transition,

              sourceSide:
                'top',

              targetSide:
                'top',

              sourceSlot: 4,

              targetSlot: 0,

              isLoop: true,
            })

            return
          }

          const source =
            positionMap.get(
              transition.from
            )

          const target =
            positionMap.get(
              transition.to
            )

          if (
            !source ||
            !target
          ) {
            return
          }

          const reverseKey =
            `${transition.to}::${transition.from}`

          const hasReverse =
            groupedTransitions.has(
              reverseKey
            )

          /* ==============================
             TRANSICIONES DE IDA Y VUELTA
          ============================== */

          if (hasReverse) {
            const dx =
              target.x -
              source.x

            const dy =
              target.y -
              source.y

            const fromOrder =
              stateOrder.get(
                transition.from
              ) ?? 0

            const toOrder =
              stateOrder.get(
                transition.to
              ) ?? 0

            const firstDirection =
              fromOrder <
              toOrder

            /*
             * Estados principalmente
             * uno al lado del otro.
             */
            if (
              Math.abs(dx) >=
              Math.abs(dy)
            ) {
              result.push({
                key,

                ...transition,

                sourceSide:
                  firstDirection
                    ? 'top'
                    : 'bottom',

                targetSide:
                  firstDirection
                    ? 'top'
                    : 'bottom',

                sourceSlot: 3,

                targetSlot: 1,

                isLoop: false,
              })

              return
            }

            /*
             * Estados principalmente
             * uno encima del otro.
             */
            result.push({
              key,

              ...transition,

              sourceSide:
                firstDirection
                  ? 'right'
                  : 'left',

              targetSide:
                firstDirection
                  ? 'right'
                  : 'left',

              sourceSlot: 3,

              targetSlot: 1,

              isLoop: false,
            })

            return
          }

          /* ==============================
             TRANSICIÓN NORMAL
          ============================== */

          const sides =
            getSides(
              source,
              target
            )

          result.push({
            key,

            ...transition,

            ...sides,

            sourceSlot: 2,

            targetSlot: 2,

            isLoop: false,
          })
        }
      )

      /* ==================================
         SEPARAR SALIDAS
      ================================== */

      const outgoing =
        new Map<
          string,
          VisualTransition[]
        >()

      result.forEach(
        (transition) => {
          if (
            transition.isLoop
          ) {
            return
          }

          const key =
            `${transition.from}:${transition.sourceSide}`

          const group =
            outgoing.get(
              key
            ) ?? []

          group.push(
            transition
          )

          outgoing.set(
            key,
            group
          )
        }
      )

      outgoing.forEach(
        (group) => {
          group.sort(
            (a, b) => {
              const aPosition =
                positionMap.get(
                  a.to
                )

              const bPosition =
                positionMap.get(
                  b.to
                )

              if (
                !aPosition ||
                !bPosition
              ) {
                return 0
              }

              if (
                a.sourceSide ===
                  'left' ||
                a.sourceSide ===
                  'right'
              ) {
                return (
                  aPosition.y -
                  bPosition.y
                )
              }

              return (
                aPosition.x -
                bPosition.x
              )
            }
          )

          group.forEach(
            (
              transition,
              index
            ) => {
              transition.sourceSlot =
                getSlot(
                  index,
                  group.length
                )
            }
          )
        }
      )

      /* ==================================
         SEPARAR ENTRADAS
      ================================== */

      const incoming =
        new Map<
          string,
          VisualTransition[]
        >()

      result.forEach(
        (transition) => {
          if (
            transition.isLoop
          ) {
            return
          }

          const key =
            `${transition.to}:${transition.targetSide}`

          const group =
            incoming.get(
              key
            ) ?? []

          group.push(
            transition
          )

          incoming.set(
            key,
            group
          )
        }
      )

      incoming.forEach(
        (group) => {
          group.sort(
            (a, b) => {
              const aPosition =
                positionMap.get(
                  a.from
                )

              const bPosition =
                positionMap.get(
                  b.from
                )

              if (
                !aPosition ||
                !bPosition
              ) {
                return 0
              }

              if (
                a.targetSide ===
                  'left' ||
                a.targetSide ===
                  'right'
              ) {
                return (
                  aPosition.y -
                  bPosition.y
                )
              }

              return (
                aPosition.x -
                bPosition.x
              )
            }
          )

          group.forEach(
            (
              transition,
              index
            ) => {
              transition.targetSlot =
                getSlot(
                  index,
                  group.length
                )
            }
          )
        }
      )

      return result
    }, [
      groupedTransitions,
      positionMap,
      stateOrder,
    ])

  /* ======================================
     CREAR EDGES
  ====================================== */

  const edges: Edge[] =
    useMemo(
      () =>
        visualTransitions.map(
          (
            transition,
            index
          ) => ({
            id:
              `${transition.key}-${index}`,

            source:
              transition.from,

            target:
              transition.to,

            sourceHandle:
              `source-${transition.sourceSide}-${transition.sourceSlot}`,

            targetHandle:
              `target-${transition.targetSide}-${transition.targetSlot}`,

            type:
              'automata',

            label:
              transition.symbols.join(
                ', '
              ),

            markerEnd: {
              type:
                MarkerType.ArrowClosed,

              width: 18,

              height: 18,
            },

            style: {
              stroke:
                '#214f86',

              strokeWidth: 1.8,
            },
          })
        ),
      [visualTransitions]
    )

  /* ======================================
     SIN ESTADOS
  ====================================== */

  if (
    states.length === 0
  ) {
    return (
      <div className="automata-preview-empty">
        Agrega estados para
        visualizar el autómata.
      </div>
    )
  }

  /* ======================================
     VISTA
  ====================================== */

  return (
    <div className="automata-preview-wrapper">
      <div className="automata-preview-toolbar">
        <span>
          Puedes mover los estados para ajustar la representación.
        </span>

        <button
          type="button"
          onClick={
            handleReorganize
          }
        >
          Reorganizar
        </button>
      </div>

      <div className="automata-preview-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}

          nodeTypes={
            nodeTypes
          }

          edgeTypes={
            edgeTypes
          }

          onNodesChange={
            onNodesChange
          }

          nodesDraggable

          nodesConnectable={
            false
          }

          elementsSelectable

          fitView

          fitViewOptions={{
            padding: 0.25,
          }}

          minZoom={0.3}

          maxZoom={1.8}

          panOnDrag

          zoomOnScroll
        >
          <Background
            gap={20}
            size={1}
          />

          <Controls
            showInteractive={
              false
            }
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export default AutomataPreview