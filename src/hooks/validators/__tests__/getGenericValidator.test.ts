import type { RegisterOptions } from 'react-hook-form'

import { getValidator } from '../getGenericValidator'
import type { JSONSchemaType, JSONSubSchemaInfo } from '../../../JSONSchema'
import { ErrorTypes } from '../../../utils/errorTypes'

type ValidatorMap = Record<string, (value: unknown) => unknown>

const createContext = (JSONSchema: JSONSchemaType): JSONSubSchemaInfo => ({
  JSONSchema,
  invalidPointer: false,
  isRequired: false,
  objectName: 'field',
  pointer: '#/properties/field',
})

const getValidateMap = (options: RegisterOptions): ValidatorMap => {
  return options.validate as ValidatorMap
}

describe('getValidator const validation', () => {
  test('validates string const values', () => {
    const validate = getValidateMap(
      getValidator(createContext({ type: 'string', const: 'admin' }), {})
    )

    expect(validate.constValidator('admin')).toBe(true)
    expect(validate.constValidator('user')).toBe(ErrorTypes.notConst)
    expect(validate.constValidator('')).toBe(true)
  })

  test('validates empty string const values', () => {
    const validate = getValidateMap(
      getValidator(createContext({ type: 'string', const: '' }), {})
    )

    expect(validate.constValidator('')).toBe(true)
    expect(validate.constValidator('admin')).toBe(ErrorTypes.notConst)
  })

  test('coerces primitive form values before comparing const values', () => {
    const numberValidate = getValidateMap(
      getValidator(createContext({ type: 'number', const: 3 }), {})
    )
    const booleanValidate = getValidateMap(
      getValidator(createContext({ type: 'boolean', const: true }), {})
    )

    expect(numberValidate.constValidator('3')).toBe(true)
    expect(numberValidate.constValidator('4')).toBe(ErrorTypes.notConst)
    expect(booleanValidate.constValidator('true')).toBe(true)
    expect(booleanValidate.constValidator('false')).toBe(ErrorTypes.notConst)
  })

  test('validates array and object const values structurally', () => {
    const validate = getValidateMap(
      getValidator(
        createContext({
          type: 'array',
          const: [{ role: 'admin' }],
        }),
        {}
      )
    )

    expect(validate.constValidator([{ role: 'admin' }])).toBe(true)
    expect(validate.constValidator([{ role: 'user' }])).toBe(ErrorTypes.notConst)
  })
})
