import {
  getNumberMaximum,
  getNumberMinimum,
  getNumberStep,
  toFixed,
} from '../numberUtilities'

describe('numberUtilities', () => {
  test('rounds numeric values to a fixed precision string', () => {
    expect(toFixed(0.30000000000000004, 1)).toBe('0.3')
    expect(toFixed(2.6, 0)).toBe('3')
  })

  test('derives default steps from number schema types', () => {
    expect(getNumberStep({ type: 'integer' })).toEqual([1, undefined])
    expect(getNumberStep({ type: 'number' })).toEqual(['any', undefined])
  })

  test('uses multipleOf as the step and reports decimal precision', () => {
    expect(getNumberStep({ type: 'number', multipleOf: 0.25 })).toEqual([
      0.25,
      2,
    ])
    expect(getNumberStep({ type: 'integer', multipleOf: 5 })).toEqual([5, 0])
  })

  test('returns inclusive minimum and maximum values unchanged', () => {
    const schema = {
      type: 'number' as const,
      minimum: 0,
      maximum: 10,
    }

    expect(getNumberMinimum(schema)).toBe(0)
    expect(getNumberMaximum(schema)).toBe(10)
  })

  test('adjusts exclusive bounds by the configured step', () => {
    const schema = {
      type: 'number' as const,
      exclusiveMinimum: 0,
      exclusiveMaximum: 1,
      multipleOf: 0.25,
    }

    expect(getNumberMinimum(schema)).toBe(0.25)
    expect(getNumberMaximum(schema)).toBe(0.75)
  })

  test('adjusts exclusive bounds by epsilon when the step is any', () => {
    const schema = {
      type: 'number' as const,
      exclusiveMinimum: 0,
      exclusiveMaximum: 1,
    }

    expect(getNumberMinimum(schema)).toBe(0.0001)
    expect(getNumberMaximum(schema)).toBe(0.9999)
  })
})
