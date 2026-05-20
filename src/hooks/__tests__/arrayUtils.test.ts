import {
  getDefaultItemValue,
  getMultiSelectFieldName,
  getMultiSelectOptions,
  getSingleItemsSchema,
  getTupleItemsLength,
  isMultiSelectArray,
  normalizeArrayValue,
} from '../arrayUtils'
import type { ArrayJSONSchemaType } from '../../JSONSchema'

describe('arrayUtils', () => {
  test('detects tuple and single item schemas', () => {
    const tupleSchema: ArrayJSONSchemaType = {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
    }
    const singleItemSchema: ArrayJSONSchemaType = {
      type: 'array',
      items: { type: 'string' },
    }

    expect(getTupleItemsLength(tupleSchema)).toBe(2)
    expect(getSingleItemsSchema(tupleSchema)).toBeUndefined()
    expect(getSingleItemsSchema(singleItemSchema)).toEqual({ type: 'string' })
  })

  test('builds multi-select options from enum values', () => {
    const schema: ArrayJSONSchemaType = {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['red', 'red', false, null],
      },
    }

    expect(isMultiSelectArray(schema)).toBe(true)
    expect(getMultiSelectOptions(schema)).toEqual(['red', 'false', 'null'])
  })

  test('builds multi-select options from numeric ranges', () => {
    const schema: ArrayJSONSchemaType = {
      type: 'array',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 0.3,
        multipleOf: 0.1,
      },
    }

    expect(isMultiSelectArray(schema)).toBe(true)
    expect(getMultiSelectOptions(schema)).toEqual(['0', '0.1', '0.2', '0.3'])
  })

  test('normalizes scalar, empty, and array values', () => {
    expect(normalizeArrayValue(['react'])).toEqual(['react'])
    expect(normalizeArrayValue('react')).toEqual(['react'])
    expect(normalizeArrayValue('')).toEqual([])
    expect(normalizeArrayValue(null)).toEqual([])
    expect(normalizeArrayValue(undefined)).toEqual([])
  })

  test('returns default item values from item schemas', () => {
    expect(getDefaultItemValue({ type: 'string', default: 'draft' })).toBe(
      'draft'
    )
    expect(getDefaultItemValue({ type: 'object' })).toEqual({})
    expect(getDefaultItemValue({ type: 'number' })).toBe('')
    expect(getDefaultItemValue(undefined)).toBe('')
  })

  test('builds legacy multi-select field names', () => {
    expect(getMultiSelectFieldName('#/properties/tags', 1)).toBe(
      '#/properties/tags[1]'
    )
  })
})
