import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType, StringJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from '../../utils/errorTypes'

type ValidatorResult = string | string[] | boolean | undefined
type MaybePromiseValidatorResult = ValidatorResult | Promise<ValidatorResult>

const getMinLengthResult = (value: unknown, minLength: number): ValidatorResult => {
  if (value == null || typeof value !== 'string') {
    return true
  }

  return value.length >= minLength || ErrorTypes.minLength
}

const runExistingValidate = (
  validate: RegisterOptions['validate'],
  value: unknown
): MaybePromiseValidatorResult => {
  if (typeof validate === 'function') {
    return validate(value, {})
  }

  if (validate && typeof validate === 'object') {
    for (const validator of Object.values(validate)) {
      const result = validator(value, {})

      if (result !== true) {
        return result
      }
    }
  }

  return true
}

export const getStringValidator = (
  currentObject: JSONSchemaType,
  baseValidator: RegisterOptions
): RegisterOptions => {
  const stringSchema = currentObject as StringJSONSchemaType

  if (stringSchema.minLength != null) {
    const minLength = stringSchema.minLength
    const currentValidate = baseValidator.validate

    baseValidator.minLength = {
      value: minLength,
      message: ErrorTypes.minLength,
    }
    baseValidator.validate = (value: unknown) => {
      const existingResult = runExistingValidate(currentValidate, value)

      if (existingResult instanceof Promise) {
        return existingResult.then((result) =>
          result === true ? getMinLengthResult(value, minLength) : result
        )
      }

      if (existingResult !== true) {
        return existingResult
      }

      return getMinLengthResult(value, minLength)
    }
  }

  if (stringSchema.maxLength) {
    baseValidator.maxLength = {
      value: stringSchema.maxLength,
      message: ErrorTypes.maxLength,
    }
  }

  if (stringSchema.pattern) {
    baseValidator.pattern = {
      value: new RegExp(stringSchema.pattern),
      message: ErrorTypes.pattern,
    }
  }

  return baseValidator
}
