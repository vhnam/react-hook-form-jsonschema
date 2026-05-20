import type { JSONSchemaType } from '../../JSONSchema/types'
import {
  areJSONValuesEqual,
  getSchemaConst,
  hasSchemaConst,
  isFormValueEqualToConst,
} from '../constUtils'

describe('constUtils', () => {
  test('compares JSON values structurally', () => {
    expect(
      areJSONValuesEqual(
        {
          profile: { role: 'admin' },
          tags: ['react', 'json-schema'],
        },
        {
          tags: ['react', 'json-schema'],
          profile: { role: 'admin' },
        }
      )
    ).toBe(true)
    expect(areJSONValuesEqual(['react'], ['json-schema'])).toBe(false)
    expect(areJSONValuesEqual({ tags: ['react'] }, { tags: ['react', 'ts'] })).toBe(
      false
    )
  })

  test('detects const even when the value is falsey', () => {
    expect(hasSchemaConst({ type: 'boolean', const: false })).toBe(true)
    expect(hasSchemaConst({ type: 'string', const: '' })).toBe(true)
    expect(hasSchemaConst({ type: 'number', const: 0 })).toBe(true)
    expect(hasSchemaConst({ type: 'null', const: null })).toBe(true)
    expect(hasSchemaConst({ type: 'string' })).toBe(false)
  })

  test('returns JSON-compatible const values', () => {
    expect(getSchemaConst({ type: 'string', const: 'admin' })).toBe('admin')
    expect(getSchemaConst({ type: 'array', const: ['react'] })).toEqual([
      'react',
    ])
    expect(
      getSchemaConst({ type: 'object', const: { role: 'admin' } })
    ).toEqual({ role: 'admin' })
  })

  test('ignores non-JSON const values from loose schema input', () => {
    const schema = {
      type: 'string',
      const: undefined,
    } as unknown as JSONSchemaType

    expect(hasSchemaConst(schema)).toBe(true)
    expect(getSchemaConst(schema)).toBeUndefined()
  })

  test('coerces primitive form values before comparing const values', () => {
    expect(isFormValueEqualToConst('42', { type: 'integer', const: 42 })).toBe(
      true
    )
    expect(isFormValueEqualToConst('42.5', { type: 'number', const: 42 })).toBe(
      false
    )
    expect(
      isFormValueEqualToConst('false', { type: 'boolean', const: false })
    ).toBe(true)
  })

  test('compares object and array const values structurally', () => {
    const schema: JSONSchemaType = {
      type: 'object',
      const: {
        tags: ['react', 'json-schema'],
        profile: { role: 'admin' },
      },
    }

    expect(
      isFormValueEqualToConst(
        {
          profile: { role: 'admin' },
          tags: ['react', 'json-schema'],
        },
        schema
      )
    ).toBe(true)
    expect(
      isFormValueEqualToConst(
        {
          profile: { role: 'admin' },
          tags: ['json-schema', 'react'],
        },
        schema
      )
    ).toBe(false)
  })
})
