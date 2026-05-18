import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType, StringJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from '../../utils/errorTypes'

export const getStringValidator = (
  currentObject: JSONSchemaType,
  baseValidator: RegisterOptions
): RegisterOptions => {
  const stringSchema = currentObject as StringJSONSchemaType

  if (stringSchema.minLength) {
    baseValidator.minLength = {
      value: stringSchema.minLength,
      message: ErrorTypes.minLength,
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
