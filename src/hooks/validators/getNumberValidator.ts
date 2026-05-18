import type { RegisterOptions } from 'react-hook-form'

import { getNumberMaximum, getNumberMinimum } from './numberUtilities'
import type { JSONSchemaType, NumberJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from './types'

export const getNumberValidator = (
  currentObject: JSONSchemaType,
  baseValidator: RegisterOptions
): RegisterOptions => {
  const minimum = getNumberMinimum(currentObject)
  const maximum = getNumberMaximum(currentObject)

  baseValidator.validate = {
    ...baseValidator.validate,
    multipleOf: (value: string) => {
      if (currentObject.type === 'integer' && value) {
        const numberSchema = currentObject as NumberJSONSchemaType
        const multipleOf = numberSchema.multipleOf

        return (
          (multipleOf != null &&
            Number.parseInt(value, 10) % multipleOf === 0) ||
          ErrorTypes.multipleOf
        )
      }

      // TODO: implement float checking with epsilon
      return true
    },
  }

  if (currentObject.type === 'integer') {
    baseValidator.pattern = {
      value: /^([+-]?[1-9]\d*|0)$/,
      message: ErrorTypes.notInteger,
    }
  } else {
    baseValidator.pattern = {
      value: /^([+-]?[0-9]+([.][0-9]+))?$/,
      message: ErrorTypes.notFloat,
    }
  }

  if (minimum || minimum === 0) {
    baseValidator.min = {
      value: minimum,
      message: ErrorTypes.minValue,
    }
  }

  if (maximum || maximum === 0) {
    baseValidator.max = {
      value: maximum,
      message: ErrorTypes.maxValue,
    }
  }

  return baseValidator
}
