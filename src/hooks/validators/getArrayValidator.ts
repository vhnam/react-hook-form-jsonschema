import type { RegisterOptions } from 'react-hook-form'

import type {
  ArrayJSONSchemaType,
  JSONSchemaType,
  StringJSONSchemaType,
} from '../../JSONSchema'
import { normalizeArrayValue } from '../arrayUtils'
import { ErrorTypes } from '../../utils/errorTypes'
import { getNumberValidator } from './getNumberValidator'
import {
  getSchemaConst,
  hasSchemaConst,
  isFormValueEqualToConst,
} from '../../utils/constUtils'

const validateItemValue = (
  value: unknown,
  itemSchema: JSONSchemaType
): string | true => {
  if (value === undefined || value === null || value === '') {
    if (
      hasSchemaConst(itemSchema) &&
      Object.is(getSchemaConst(itemSchema), value)
    ) {
      return true
    }

    return hasSchemaConst(itemSchema) ? ErrorTypes.notConst : true
  }

  if (hasSchemaConst(itemSchema)) {
    return isFormValueEqualToConst(value, itemSchema) || ErrorTypes.notConst
  }

  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    return true
  }

  const str = String(value)

  if (itemSchema.enum) {
    for (const item of itemSchema.enum) {
      if (item == value) {
        return true
      }
    }

    return ErrorTypes.notInEnum
  }

  if (itemSchema.type === 'string') {
    const stringSchema = itemSchema as StringJSONSchemaType

    if (
      stringSchema.minLength != null &&
      str.length < stringSchema.minLength
    ) {
      return ErrorTypes.minLength
    }

    if (
      stringSchema.maxLength != null &&
      str.length > stringSchema.maxLength
    ) {
      return ErrorTypes.maxLength
    }

    if (
      stringSchema.pattern &&
      !new RegExp(stringSchema.pattern).test(str)
    ) {
      return ErrorTypes.pattern
    }
  }

  if (itemSchema.type === 'integer' || itemSchema.type === 'number') {
    const numOpts = getNumberValidator(itemSchema, {})
    const validators = numOpts.validate as
      | Record<string, (v: string) => string | true>
      | undefined

    if (validators) {
      for (const fn of Object.values(validators)) {
        const result = fn(str)

        if (result !== true) {
          return result
        }
      }
    }
  }

  return true
}

export const getArrayValidator = (
  arraySchema: ArrayJSONSchemaType,
  baseValidator: RegisterOptions,
  itemSchema: JSONSchemaType | undefined
): RegisterOptions => {
  const validate: Record<string, (value: unknown) => string | true> = {
    ...(typeof baseValidator.validate === 'object'
      ? (baseValidator.validate as Record<string, (value: unknown) => string | true>)
      : {}),
  }

  if (arraySchema.minItems != null) {
    validate.minItems = (value: unknown) => {
      const arr = normalizeArrayValue(value)

      if (arr.length < arraySchema.minItems!) {
        return ErrorTypes.minItems
      }

      return true
    }
  }

  if (arraySchema.maxItems != null) {
    validate.maxItems = (value: unknown) => {
      const arr = normalizeArrayValue(value)

      if (arr.length > arraySchema.maxItems!) {
        return ErrorTypes.maxItems
      }

      return true
    }
  }

  if (arraySchema.uniqueItems) {
    validate.uniqueItems = (value: unknown) => {
      const arr = normalizeArrayValue(value)
      const seen = new Set<string>()

      for (const entry of arr) {
        const key = JSON.stringify(entry)

        if (seen.has(key)) {
          return ErrorTypes.uniqueItems
        }

        seen.add(key)
      }

      return true
    }
  }

  if (itemSchema) {
    validate.items = (value: unknown) => {
      const arr = normalizeArrayValue(value)

      for (const entry of arr) {
        const result = validateItemValue(entry, itemSchema)

        if (result !== true) {
          return result
        }
      }

      return true
    }
  }

  return {
    ...baseValidator,
    validate: Object.keys(validate).length > 0 ? validate : baseValidator.validate,
  }
}
