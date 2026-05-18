import type { ComponentProps } from 'react'

import type {
  UseTextAreaParameters,
  BasicInputReturnType,
  UseTextAreaReturnType,
} from './types'
import { InputTypes } from './types'
import { useGenericInput } from './useGenericInput'

const getInputId = (pointer: string): string => {
  return `${pointer}-textarea-input`
}

const getLabelId = (pointer: string): string => {
  return `${pointer}-textarea-label`
}

export const getTextAreaCustomFields = (
  baseInput: BasicInputReturnType
): UseTextAreaReturnType => {
  const { register } = baseInput.formContext
  const { validator } = baseInput

  const currentObject = baseInput.getObject()

  const itemProps: ComponentProps<'textarea'> = {}

  if (currentObject.type === 'string') {
    itemProps.minLength = currentObject.minLength
    itemProps.maxLength = currentObject.maxLength
  }

  return {
    ...baseInput,
    type: InputTypes.textArea,
    getLabelProps: () => {
      const itemProps: ComponentProps<'label'> = {}

      itemProps.id = getLabelId(baseInput.pointer)
      itemProps.htmlFor = getInputId(baseInput.pointer)

      return itemProps
    },
    getTextAreaProps: () => {
      itemProps.name = baseInput.pointer
      itemProps.ref = register(baseInput.pointer, validator)
      itemProps.required = baseInput.isRequired
      itemProps.id = getInputId(baseInput.pointer)

      return itemProps
    },
  }
}

export const useTextArea: UseTextAreaParameters = (pointer) => {
  return getTextAreaCustomFields(useGenericInput(pointer))
}
