import type { ComponentProps } from 'react'

import type { StringJSONSchemaType } from '../JSONSchema'
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
    const stringSchema = currentObject as StringJSONSchemaType

    itemProps.minLength = stringSchema.minLength
    itemProps.maxLength = stringSchema.maxLength
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
    getTextAreaProps: () => ({
      ...itemProps,
      ...register(baseInput.pointer, validator),
      required: baseInput.isRequired,
      id: getInputId(baseInput.pointer),
    }),
  }
}

export const useTextArea: UseTextAreaParameters = (pointer) => {
  return getTextAreaCustomFields(useGenericInput(pointer))
}
