import type { FieldError } from 'react-hook-form'

import type { JSONFormContextValues } from '../../components'
import type {
  ArrayJSONSchemaType,
  BasicJSONSchemaType,
  JSONSchemaType,
  StringJSONSchemaType,
} from '../../JSONSchema'
import type { ErrorMessage } from './types'
import { ErrorTypes } from './types'

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
  // This is a special element to check errors against
  if (currentObject.type === 'array') {
    const arraySchema = currentObject as ArrayJSONSchemaType
    const formValues = formContext.getValues() as Record<string, unknown>
    const currentValues = formValues[pointer]

    if (Array.isArray(currentValues)) {
      const numberOfSelected =
        currentValues.filter((value) => value !== false).length || 0

      if (
        arraySchema.minItems != null &&
        numberOfSelected < arraySchema.minItems
      ) {
        return {
          message: ErrorTypes.minLength,
          expected: arraySchema.minItems,
        }
      }

      if (
        arraySchema.maxItems != null &&
        numberOfSelected > arraySchema.maxItems
      ) {
        return {
          message: ErrorTypes.maxLength,
          expected: arraySchema.maxItems,
        }
      }
    }
  }

  if (!errors) {
    return undefined
  }

  const stringSchema = currentObject as StringJSONSchemaType
  const schemaWithEnum = currentObject as BasicJSONSchemaType

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
      retError.expected = schemaWithEnum.enum
  }

  return retError
}
