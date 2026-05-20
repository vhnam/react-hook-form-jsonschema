import type { FieldError } from 'react-hook-form'

import type { JSONFormContextValues } from '../../components'
import type {
  ArrayJSONSchemaType,
  JSONSchemaType,
  StringJSONSchemaType,
} from '../../JSONSchema/types'
import {
  getMultiSelectFieldName,
  getMultiSelectOptions,
  isMultiSelectArray,
  normalizeArrayValue,
} from '../arrayUtils'
import { getListArrayEntries } from '../../utils/listArrayFormUtils'
import type { ErrorMessage } from './types'
import { ErrorTypes } from '../../utils/errorTypes'
import { getSchemaConst } from '../../utils/constUtils'

const countMultiSelectChecked = (
  formContext: JSONFormContextValues,
  pointer: string,
  options: string[]
): number => {
  const values = formContext.getValues() as Record<string, unknown>

  return options.reduce((count, _, index) => {
    const value = values[getMultiSelectFieldName(pointer, index)]

    return count + (value && value !== false ? 1 : 0)
  }, 0)
}

const getArrayConstraintError = (
  arraySchema: ArrayJSONSchemaType,
  length: number
): ErrorMessage => {
  if (
    arraySchema.minItems != null &&
    length < arraySchema.minItems
  ) {
    return {
      message: ErrorTypes.minItems,
      expected: arraySchema.minItems,
    }
  }

  if (
    arraySchema.maxItems != null &&
    length > arraySchema.maxItems
  ) {
    return {
      message: ErrorTypes.maxItems,
      expected: arraySchema.maxItems,
    }
  }

  return undefined
}

export const getError = (
  errors: FieldError | undefined,
  currentObject: JSONSchemaType,
  isRequired: boolean,
  formContext: JSONFormContextValues,
  pointer: string,
  minimum?: number,
  maximum?: number,
  step?: number | 'any'
): ErrorMessage => {
  if (currentObject.type === 'array') {
    const arraySchema = currentObject as ArrayJSONSchemaType

    if (isMultiSelectArray(arraySchema)) {
      const options = getMultiSelectOptions(arraySchema)
      const selected = countMultiSelectChecked(
        formContext,
        pointer,
        options
      )
      const constraintError = getArrayConstraintError(arraySchema, selected)

      if (constraintError) {
        return constraintError
      }
    } else {
      const formValues = formContext.getValues() as Record<string, unknown>
      const fromIndices = getListArrayEntries(formValues, pointer)
      const arr =
        fromIndices.length > 0
          ? fromIndices
          : normalizeArrayValue(formValues[pointer])
      const constraintError = getArrayConstraintError(arraySchema, arr.length)

      if (constraintError) {
        return constraintError
      }

      if (arraySchema.uniqueItems) {
        const seen = new Set<string>()

        for (const entry of arr) {
          const key = JSON.stringify(entry)

          if (seen.has(key)) {
            return {
              message: ErrorTypes.uniqueItems,
              expected: true,
            }
          }

          seen.add(key)
        }
      }
    }
  }

  if (!errors) {
    return undefined
  }

  const stringSchema = currentObject as StringJSONSchemaType

  const retError: ErrorMessage = {
    message:
      typeof errors.message === 'string'
        ? errors.message
        : ErrorTypes.undefinedError,
    expected: undefined,
  }

  switch (errors.message) {
    case ErrorTypes.required:
      retError.message = ErrorTypes.required
      retError.expected = isRequired
      break

    case ErrorTypes.maxLength:
      retError.message = ErrorTypes.maxLength
      retError.expected = stringSchema.maxLength
      break

    case ErrorTypes.minLength:
      retError.message = ErrorTypes.minLength
      retError.expected = stringSchema.minLength
      break

    case ErrorTypes.maxValue:
      retError.message = ErrorTypes.maxValue
      retError.expected = maximum
      break

    case ErrorTypes.minValue:
      retError.message = ErrorTypes.minValue
      retError.expected = minimum
      break

    case ErrorTypes.multipleOf:
      retError.message = ErrorTypes.multipleOf
      retError.expected = step
      break

    case ErrorTypes.pattern:
      retError.message = ErrorTypes.pattern
      retError.expected = stringSchema.pattern
      break

    case ErrorTypes.notInEnum:
      retError.message = ErrorTypes.notInEnum
      retError.expected = currentObject.enum
      break

    case ErrorTypes.notConst:
      return {
        message: errors.message,
        expected: getSchemaConst(currentObject),
      }

    case ErrorTypes.minItems:
      retError.message = ErrorTypes.minItems
      retError.expected = (currentObject as ArrayJSONSchemaType).minItems
      break

    case ErrorTypes.maxItems:
      retError.message = ErrorTypes.maxItems
      retError.expected = (currentObject as ArrayJSONSchemaType).maxItems
      break

    case ErrorTypes.uniqueItems:
      retError.message = ErrorTypes.uniqueItems
      retError.expected = true
      break
  }

  return retError
}
