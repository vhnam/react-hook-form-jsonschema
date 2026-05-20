import type { ComponentProps } from 'react'

import type { ArrayJSONSchemaType } from '../JSONSchema'
import type {
  UseCheckboxParameters,
  BasicInputReturnType,
  UseCheckboxReturnType,
} from './types'
import { InputTypes } from './types'
import {
  getMultiSelectFieldName,
  getMultiSelectOptions,
  isMultiSelectArray,
} from './arrayUtils'
import { useGenericInput } from './useGenericInput'

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

export const getCheckboxCustomFields = (
  baseInput: BasicInputReturnType
): UseCheckboxReturnType => {
  const { register } = baseInput.formContext
  const { validator } = baseInput

  const currentObject = baseInput.getObject()

  let items: string[] = []

  const arraySchema =
    currentObject.type === 'array'
      ? (currentObject as ArrayJSONSchemaType)
      : undefined
  const multiSelect = arraySchema ? isMultiSelectArray(arraySchema) : false

  if (arraySchema) {
    items = getMultiSelectOptions(arraySchema)
  } else if (currentObject.type === 'boolean') {
    items = ['true']
  }

  const fieldValidator = multiSelect ? {} : validator

  return {
    ...baseInput,
    type: InputTypes.checkbox,
    isSingle: currentObject.type === 'boolean',
    getItemInputProps: (index) => {
      const name =
        currentObject.type === 'array'
          ? getMultiSelectFieldName(baseInput.pointer, index)
          : baseInput.pointer

      return {
        ...register(name, fieldValidator),
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

export { isMultiSelectArray }
