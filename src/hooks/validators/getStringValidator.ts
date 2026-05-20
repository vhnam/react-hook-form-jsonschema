import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType, StringJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from '../../utils/errorTypes'
import {
  getFormatValidationResult,
  isSupportedFormat,
} from './getFormatValidator'

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

const appendValidate = (
  baseValidator: RegisterOptions,
  validateNext: (value: unknown) => ValidatorResult
): void => {
  const currentValidate = baseValidator.validate

  baseValidator.validate = (value: unknown) => {
    const existingResult = runExistingValidate(currentValidate, value)

    if (existingResult instanceof Promise) {
      return existingResult.then((result) =>
        result === true ? validateNext(value) : result
      )
    }

    if (existingResult !== true) {
      return existingResult
    }

    return validateNext(value)
  }
}

export const getStringValidator = (
  currentObject: JSONSchemaType,
  baseValidator: RegisterOptions
): RegisterOptions => {
  const stringSchema = currentObject as StringJSONSchemaType

  if (stringSchema.minLength != null) {
    const minLength = stringSchema.minLength

    baseValidator.minLength = {
      value: minLength,
      message: ErrorTypes.minLength,
    }
    appendValidate(baseValidator, (value) => getMinLengthResult(value, minLength))
  }

  if (stringSchema.maxLength != null) {
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

  if (stringSchema.format && isSupportedFormat(stringSchema.format)) {
    const { format } = stringSchema

    appendValidate(baseValidator, (value) =>
      getFormatValidationResult(value, format)
    )
  }

  return baseValidator
}
