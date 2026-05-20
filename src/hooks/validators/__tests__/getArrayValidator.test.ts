import type { RegisterOptions } from 'react-hook-form'

import { getArrayValidator } from '../getArrayValidator'
import type { ArrayJSONSchemaType, JSONSchemaType } from '../../../JSONSchema'
import { ErrorTypes } from '../../../utils/errorTypes'

type ValidatorMap = Record<string, (value: unknown) => string | true>

const getValidateMap = (options: RegisterOptions): ValidatorMap => {
  return options.validate as ValidatorMap
}

describe('getArrayValidator', () => {
  test('validates minItems and maxItems constraints', () => {
    const validate = getValidateMap(
      getArrayValidator(
        { type: 'array', minItems: 2, maxItems: 3 },
        {},
        undefined
      )
    )

    expect(validate.minItems(['one'])).toBe(ErrorTypes.minItems)
    expect(validate.minItems(['one', 'two'])).toBe(true)
    expect(validate.maxItems(['one', 'two', 'three', 'four'])).toBe(
      ErrorTypes.maxItems
    )
    expect(validate.maxItems(['one', 'two', 'three'])).toBe(true)
  })

  test('normalizes scalar array values before checking length', () => {
    const validate = getValidateMap(
      getArrayValidator({ type: 'array', minItems: 1 }, {}, undefined)
    )

    expect(validate.minItems('one')).toBe(true)
    expect(validate.minItems('')).toBe(ErrorTypes.minItems)
  })

  test('validates uniqueItems using structural equality', () => {
    const validate = getValidateMap(
      getArrayValidator({ type: 'array', uniqueItems: true }, {}, undefined)
    )

    expect(validate.uniqueItems([{ id: 1 }, { id: 1 }])).toBe(
      ErrorTypes.uniqueItems
    )
    expect(validate.uniqueItems([{ id: 1 }, { id: 2 }])).toBe(true)
  })

  test('preserves existing object validators', () => {
    const existingValidator = jest.fn(() => ErrorTypes.required)
    const validate = getValidateMap(
      getArrayValidator(
        { type: 'array', minItems: 1 },
        { validate: { existingValidator } },
        undefined
      )
    )

    expect(validate.existingValidator([])).toBe(ErrorTypes.required)
    expect(existingValidator).toHaveBeenCalledWith([])
  })

  test('validates enum item schemas', () => {
    const itemSchema: JSONSchemaType = {
      type: 'string',
      enum: ['draft', 'published'],
    }
    const validate = getValidateMap(
      getArrayValidator({ type: 'array' }, {}, itemSchema)
    )

    expect(validate.items(['draft'])).toBe(true)
    expect(validate.items(['archived'])).toBe(ErrorTypes.notInEnum)
  })

  test('validates string item schemas', () => {
    const itemSchema: JSONSchemaType = {
      type: 'string',
      minLength: 2,
      maxLength: 4,
      pattern: '^[a-z]+$',
    }
    const validate = getValidateMap(
      getArrayValidator({ type: 'array' }, {}, itemSchema)
    )

    expect(validate.items(['ab', 'test'])).toBe(true)
    expect(validate.items(['a'])).toBe(ErrorTypes.minLength)
    expect(validate.items(['abcde'])).toBe(ErrorTypes.maxLength)
    expect(validate.items(['A1'])).toBe(ErrorTypes.pattern)
  })

  test('validates numeric item multipleOf constraints', () => {
    const arraySchema: ArrayJSONSchemaType = { type: 'array' }
    const itemSchema: JSONSchemaType = {
      type: 'number',
      multipleOf: 0.1,
    }
    const validate = getValidateMap(
      getArrayValidator(arraySchema, {}, itemSchema)
    )

    expect(validate.items([0.3])).toBe(true)
    expect(validate.items([0.15])).toBe(ErrorTypes.multipleOf)
  })
})
