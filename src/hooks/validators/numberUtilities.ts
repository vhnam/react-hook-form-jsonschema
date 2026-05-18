import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType, NumberJSONSchemaType } from '../../JSONSchema'
import { ErrorTypes } from './types'

// Used for exclusiveMinimum and exclusiveMaximum values
const EPSILON = 0.0001

export const toFixed = (value: number, precision: number): string => {
  const power = 10 ** (precision || 0)

  return String(Math.round(value * power) / power)
}

export const getNumberStep = (
  currentObject: JSONSchemaType
): [number | 'any', number | undefined] => {
  const numberSchema = currentObject as NumberJSONSchemaType

  // Get dominant step value if it is defined
  const step =
    numberSchema.multipleOf !== undefined
      ? numberSchema.multipleOf
      : numberSchema.type === 'integer'
        ? 1
        : 'any'

  let decimalPlaces: number | undefined

  if (numberSchema.multipleOf != null) {
    const decimals = numberSchema.multipleOf.toString().split('.')[1]

    if (decimals) {
      decimalPlaces = decimals.length
    } else {
      decimalPlaces = 0
    }
  }

  return [step, decimalPlaces]
}

export const getNumberMinimum = (
  currentObject: JSONSchemaType
): number | undefined => {
  const numberSchema = currentObject as NumberJSONSchemaType
  const [step] = getNumberStep(currentObject)

  // Calculates whether there is a minimum or exclusiveMinimum value defined somewhere
  let minimum =
    numberSchema.exclusiveMinimum !== undefined
      ? numberSchema.exclusiveMinimum
      : numberSchema.minimum !== undefined
        ? numberSchema.minimum
        : undefined

  if (minimum !== undefined && numberSchema.exclusiveMinimum !== undefined) {
    if (step && step != 'any') {
      minimum += step
    } else {
      minimum += EPSILON
    }
  }

  return minimum
}

export const getNumberMaximum = (
  currentObject: JSONSchemaType
): number | undefined => {
  const numberSchema = currentObject as NumberJSONSchemaType
  const [step] = getNumberStep(currentObject)

  // Calculates wether there is a maximum or exclusiveMaximum value defined somewhere
  let maximum =
    numberSchema.exclusiveMaximum !== undefined
      ? numberSchema.exclusiveMaximum
      : numberSchema.maximum !== undefined
        ? numberSchema.maximum
        : undefined

  if (maximum !== undefined && numberSchema.exclusiveMaximum !== undefined) {
    if (step && step != 'any') {
      maximum -= step
    } else {
      maximum -= EPSILON
    }
  }

  return maximum
}

export const getNumberValidator = (
  currentObject: JSONSchemaType,
  required: boolean
): RegisterOptions => {
  const numberSchema = currentObject as NumberJSONSchemaType
  const minimum = getNumberMinimum(currentObject)
  const maximum = getNumberMaximum(currentObject)

  const validator: RegisterOptions = {
    validate: {
      multipleOf: (value: string) => {
        if (numberSchema.type === 'integer' && value) {
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
    },
  }

  if (required) {
    validator.required = ErrorTypes.required
  }

  if (numberSchema.type === 'integer') {
    validator.pattern = {
      value: /^([+-]?[1-9]\d*|0)$/,
      message: ErrorTypes.pattern,
    }
  } else {
    validator.pattern = {
      value: /^([0-9]+([,.][0-9]+))?$/,
      message: ErrorTypes.pattern,
    }
  }

  if (minimum || minimum === 0) {
    validator.min = {
      value: minimum,
      message: ErrorTypes.minValue,
    }
  }

  if (maximum || maximum === 0) {
    validator.max = {
      value: maximum,
      message: ErrorTypes.maxValue,
    }
  }

  return validator
}
