import type { ComponentProps } from 'react'

import type { ArrayJSONSchemaType, JSONSchemaType } from '../JSONSchema'
import type {
  UseCheckboxParameters,
  BasicInputReturnType,
  UseCheckboxReturnType,
} from './types'
import { InputTypes } from './types'
import {
  getNumberMaximum,
  getNumberMinimum,
  getNumberStep,
  toFixed,
} from './validators'
import { useGenericInput } from './useGenericInput'
import { getEnumAsStringArray } from './validators/getEnum'

const getItemInputId = (
  path: string,
  index: number,
  items: string[]
): string => {
  return `${path}-checkbox-input-${items[index] ? items[index] : ''}`
}

const getItemLabelId = (
  path: string,
  index: number,
  items: string[]
): string => {
  return `${path}-checkbox-label-${items[index] ? items[index] : ''}`
}

const getSingleItemsSchema = (
  arraySchema: ArrayJSONSchemaType
): JSONSchemaType | undefined => {
  const items = arraySchema.items

  if (items == null || Array.isArray(items)) {
    return undefined
  }

  return items
}

export const getCheckboxCustomFields = (
  baseInput: BasicInputReturnType
): UseCheckboxReturnType => {
  const { register } = baseInput.formContext
  const { validator } = baseInput

  const currentObject = baseInput.getObject()

  let items: string[] = []
  let minimum: number | undefined
  let maximum: number | undefined
  let step: number | 'any'
  let decimalPlaces: number | undefined

  if (currentObject.type === 'array') {
    const itemSchema = getSingleItemsSchema(currentObject as ArrayJSONSchemaType)

    if (itemSchema) {
      if (itemSchema.enum) {
        items = getEnumAsStringArray(itemSchema)
      } else if (itemSchema.type === 'string') {
        items = getEnumAsStringArray(currentObject)
      } else if (
        itemSchema.type === 'number' ||
        itemSchema.type === 'integer'
      ) {
        const stepAndDecimalPlaces = getNumberStep(currentObject)

        step = stepAndDecimalPlaces[0]
        decimalPlaces = stepAndDecimalPlaces[1]

        minimum = getNumberMinimum(currentObject)
        maximum = getNumberMaximum(currentObject)

        if (minimum !== undefined && maximum !== undefined && step != 'any') {
          for (let i = minimum; i <= maximum; i += step) {
            items.push(toFixed(i, decimalPlaces || 0))
          }
        }
      }
    }

    if (currentObject.uniqueItems) {
      items = [...new Set(items)]
    }
  } else if (currentObject.type === 'boolean') {
    items = ['true']
  }

  return {
    ...baseInput,
    type: InputTypes.checkbox,
    isSingle: currentObject.type === 'boolean',
    getItemInputProps: (index) => {
      const name =
        currentObject.type === 'array'
          ? `${baseInput.pointer}[${index}]`
          : baseInput.pointer

      return {
        ...register(name, validator),
        type: 'checkbox',
        id: getItemInputId(baseInput.pointer, index, items),
        value: items[index],
      }
    },
    getItemLabelProps: (index) => {
      const itemProps: ComponentProps<'label'> = {}

      itemProps.id = getItemLabelId(baseInput.pointer, index, items)
      itemProps.htmlFor = getItemInputId(baseInput.pointer, index, items)

      return itemProps
    },
    getItems: () => items,
  }
}

export const useCheckbox: UseCheckboxParameters = (path) => {
  return getCheckboxCustomFields(useGenericInput(path))
}
