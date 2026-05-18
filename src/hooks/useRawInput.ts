import type { ComponentProps } from 'react'

import type { NumberJSONSchemaType, StringJSONSchemaType } from '../JSONSchema'
import type {
  UseRawInputParameters,
  BasicInputReturnType,
  UseRawInputReturnType,
} from './types'
import { InputTypes } from './types'
import {
  getNumberMaximum,
  getNumberMinimum,
  getNumberStep,
  toFixed,
} from './validators'

const getInputId = (pointer: string, inputType: string): string => {
  return `${pointer}-${inputType}-input`
}

const getLabelId = (pointer: string, inputType: string): string => {
  return `${pointer}-${inputType}-label`
}

export const getRawInputCustomFields = (
  baseInput: BasicInputReturnType,
  inputType: string
): UseRawInputReturnType => {
  const { register } = baseInput.formContext
  const { validator } = baseInput

  const currentObject = baseInput.getObject()

  let minimum: number | undefined
  let maximum: number | undefined
  let step: number | 'any'
  let decimalPlaces: number | undefined

  const itemProps: ComponentProps<'input'> = {}

  if (currentObject.type === 'string') {
    const stringSchema = currentObject as StringJSONSchemaType

    itemProps.pattern = stringSchema.pattern
    itemProps.minLength = stringSchema.minLength
    itemProps.maxLength = stringSchema.maxLength
  } else if (
    currentObject.type === 'number' ||
    currentObject.type === 'integer'
  ) {
    const numberSchema = currentObject as NumberJSONSchemaType
    const stepAndDecimalPlaces = getNumberStep(numberSchema)

    step = stepAndDecimalPlaces[0]
    decimalPlaces = stepAndDecimalPlaces[1]

    minimum = getNumberMinimum(numberSchema)
    maximum = getNumberMaximum(numberSchema)

    itemProps.min = `${minimum}`
    itemProps.max = `${maximum}`
    itemProps.step = step === 'any' ? 'any' : toFixed(step, decimalPlaces || 0)
  }

  return {
    ...baseInput,
    type: InputTypes.input,
    getLabelProps: () => {
      const itemProps: ComponentProps<'label'> = {}

      itemProps.id = getLabelId(baseInput.pointer, inputType)
      itemProps.htmlFor = getInputId(baseInput.pointer, inputType)

      return itemProps
    },
    getInputProps: () => ({
        ...itemProps,
        ...register(baseInput.pointer, validator),
        type: inputType,
        required: baseInput.isRequired,
        id: getInputId(baseInput.pointer, inputType),
      }),
  }
}

export const useRawInput: UseRawInputParameters = (baseObject, inputType) => {
  return getRawInputCustomFields(baseObject, inputType)
}
