// Guardar como: src/tests/caja-blanca.test.ts
// Ejecutar desde la raíz del proyecto: npx vitest run src/tests/caja-blanca.test.ts
import { describe, expect, it } from 'vitest'
import { validateString } from '../features/string-validator/logic/validateString'
import { convertToGrammar } from '../features/grammar-converter/logic/convertToGrammar'

const afd01 = {
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  initialState: 'q0',
  finalStates: ['q1'],
  transitions: [
    { from: 'q0', symbol: 'a', to: 'q1' },
    { from: 'q0', symbol: 'b', to: 'q0' },
    { from: 'q1', symbol: 'a', to: 'q1' },
    { from: 'q1', symbol: 'b', to: 'q0' },
  ],
}

const validar = (cadena: string, config = afd01) =>
  validateString(
    cadena,
    config.alphabet,
    config.initialState,
    config.finalStates,
    config.transitions,
  )

describe('Caja blanca: validateString', () => {
  it('CB-01: acepta si el recorrido termina en estado final', () => {
    const resultado = validar('aba')
    expect(resultado.status).toBe('accepted')
    expect(resultado.finalState).toBe('q1')
    expect(resultado.steps).toHaveLength(3)
  })

  it('CB-02: rechaza si termina fuera de los estados finales', () => {
    const resultado = validar('ab')
    expect(resultado.status).toBe('rejected')
    expect(resultado.finalState).toBe('q0')
  })

  it('CB-03: detecta un símbolo que no pertenece al alfabeto', () => {
    const resultado = validar('ac')
    expect(resultado.status).toBe('invalid-symbol')
    expect(resultado.invalidSymbol).toBe('c')
    expect(resultado.steps).toHaveLength(0)
  })

  it('CB-04: detecta una transición no definida', () => {
    const incompleto = {
      ...afd01,
      transitions: afd01.transitions.filter(
        (transicion) => !(transicion.from === 'q0' && transicion.symbol === 'b'),
      ),
    }
    const resultado = validar('b', incompleto)
    expect(resultado.status).toBe('missing-transition')
    expect(resultado.accepted).toBe(false)
  })

  it('CB-05: procesa la cadena vacía cuando el inicial es final', () => {
    const inicialFinal = { ...afd01, finalStates: ['q0'] }
    expect(validar('', inicialFinal).status).toBe('accepted')
    expect(validar('ε', inicialFinal).status).toBe('accepted')
  })
})

describe('Caja blanca: convertToGrammar', () => {
  it('CB-06: asigna S al inicial y genera reglas por transiciones y finales', () => {
    const gramatica = convertToGrammar(afd01)
    expect(gramatica.startSymbol).toBe('S')
    expect(gramatica.stateNames).toMatchObject({ q0: 'S', q1: 'A' })
    expect(gramatica.productions.map((p) => `${p.from}->${p.expression}`)).toEqual([
      'S->aA',
      'S->bS',
      'A->aA',
      'A->bS',
      'A->ε',
    ])
  })

  it('CB-07: rechaza un estado inicial no declarado', () => {
    expect(() => convertToGrammar({ ...afd01, initialState: 'q9' })).toThrow()
  })

  it('CB-08: rechaza transiciones duplicadas para estado y símbolo', () => {
    expect(() => convertToGrammar({
      ...afd01,
      transitions: [
        ...afd01.transitions,
        { from: 'q0', symbol: 'a', to: 'q0' },
      ],
    })).toThrow('no determinísticas')
  })
})
