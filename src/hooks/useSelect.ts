import type { ComponentProps } from 'react'

import type {
  UseSelectParameters,
  BasicInputReturnType,
  UseSelectReturnType,
} from './types'
import { InputTypes } from './types'
import { getNumberRangeOptions } from './arrayUtils'
import { useGenericInput } from './useGenericInput'
import { getEnumAsStringArray } from './validators/getEnum'

const getSelectId = (pointer: string): string => {
  return `${pointer}-select`
}

const getOptionId = (
  pointer: string,
  index: number,
  items: string[]
): string => {
  return `${pointer}-select-option-${items[index] ? items[index] : ''}`
}

export const getSelectCustomFields = (
  baseInput: BasicInputReturnType
): UseSelectReturnType => {
  const { register } = baseInput.formContext
  const { validator } = baseInput

  const currentObject = baseInput.getObject()

  let items: string[] = ['']

  if (currentObject.type === 'string') {
    items = items.concat(getEnumAsStringArray(currentObject))
  } else if (
    currentObject.type === 'number' ||
    currentObject.type === 'integer'
  ) {
    items = items.concat(getNumberRangeOptions(currentObject))
  } else if (currentObject.type === 'boolean') {
    items = ['true', 'false']
  }

  return {
    ...baseInput,
    type: InputTypes.select,
    validator,
    getLabelProps: () => {
      const labelProps: ComponentProps<'label'> = {}

      labelProps.id = `${baseInput.pointer}-label`
      labelProps.htmlFor = getSelectId(baseInput.pointer)

      return labelProps
    },
    getSelectProps: () => ({
      ...register(baseInput.pointer, validator),
      required: baseInput.isRequired,
      id: getSelectId(baseInput.pointer),
    }),
    getItemOptionProps: (index) => {
      const itemProps: ComponentProps<'option'> = {}

      itemProps.id = getOptionId(baseInput.pointer, index, items)
      itemProps.value = items[index]

      return itemProps
    },
    getItems: () => items,
  }
}

export const useSelect: UseSelectParameters = (pointer) => {
  return getSelectCustomFields(useGenericInput(pointer))
}
