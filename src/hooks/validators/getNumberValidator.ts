import type { RegisterOptions } from 'react-hook-form'

import { getNumberMaximum, getNumberMinimum } from './numberUtilities'
import type { JSONSchemaType, NumberJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from '../../utils/errorTypes'

const integerPattern = /^(?:|[+-]?(?:[1-9]\d*|0))$/
const numberPattern =
  /^(?:|[+-]?(?:(?:[1-9]\d*|0)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)$/

const isMultipleOf = (value: number, multipleOf: number): boolean => {
  const quotient = value / multipleOf
  const nearestInteger = Math.round(quotient)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 100

  return Math.abs(quotient - nearestInteger) <= tolerance
}

export const getNumberValidator = (
  currentObject: JSONSchemaType,
  baseValidator: RegisterOptions
): RegisterOptions => {
  const minimum = getNumberMinimum(currentObject)
  const maximum = getNumberMaximum(currentObject)

  baseValidator.validate = {
    ...baseValidator.validate,
    multipleOf: (value: string) => {
      if (value !== '') {
        const numberSchema = currentObject as NumberJSONSchemaType
        const multipleOf = numberSchema.multipleOf

        if (multipleOf == null) {
          return true
        }

        const numericValue = Number(value)

        if (!Number.isFinite(numericValue)) {
          return true
        }

        return isMultipleOf(numericValue, multipleOf) || ErrorTypes.multipleOf
      }

      return true
    },
  }

  if (currentObject.type === 'integer') {
    baseValidator.pattern = {
      value: integerPattern,
      message: ErrorTypes.notInteger,
    }
  } else {
    baseValidator.pattern = {
      value: numberPattern,
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
