import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { FieldValues } from 'react-hook-form'

import type { ArrayJSONSchemaType, JSONSchemaType } from '../JSONSchema'
import type { JSONSubSchemaInfo } from '../JSONSchema'
import type {
  UseArrayParameters,
  BasicInputReturnType,
  UseArrayReturnType,
} from '../utils/types/arrayHookTypes'
import { InputTypes } from '../utils/inputTypes'
import {
  getDefaultItemValue,
  getItemsSchemaForIndex,
  getSingleItemsSchema,
} from './arrayUtils'
import { getArrayItemPointer, getListArrayEntries } from '../utils/listArrayFormUtils'
import { ErrorTypes } from '../utils/errorTypes'
import { useGenericInput } from './useGenericInput'
import { getValidator } from './validators/getGenericValidator'
import { getInputCustomFields } from './useInput'
import { getRawInputCustomFields } from './useRawInput'

const getItemInputId = (itemPointer: string): string => {
  return `${itemPointer}-array-item-input`
}

const getItemLabelId = (itemPointer: string): string => {
  return `${itemPointer}-array-item-label`
}

export const buildArrayReturn = (
  baseInput: BasicInputReturnType,
  fieldCount: number,
  setFieldCount: (count: number | ((prev: number) => number)) => void
): UseArrayReturnType => {
  const { formContext, pointer, validator } = baseInput
  const arraySchema = baseInput.getObject() as ArrayJSONSchemaType
  const defaultItemSchema = getSingleItemsSchema(arraySchema)

  const fields = Array.from({ length: fieldCount }, (_, index) => ({
    id: `${pointer}-${index}`,
  }))

  const getItemSchema = (index: number): JSONSchemaType | undefined => {
    return getItemsSchemaForIndex(arraySchema, index) ?? defaultItemSchema
  }

  const getItemPointer = (index: number): string => {
    return getArrayItemPointer(pointer, index)
  }

  const getItemValidator = (index: number) => {
    const itemSchema = getItemSchema(index)

    if (!itemSchema) {
      return {}
    }

    const itemContext: JSONSubSchemaInfo = {
      JSONSchema: itemSchema,
      invalidPointer: false,
      isRequired: false,
      objectName: String(index),
      pointer: getItemPointer(index),
    }

    return getValidator(itemContext, formContext.customValidators ?? {})
  }

  const canAdd = (): boolean => {
    if (arraySchema.maxItems == null) {
      return true
    }

    return fieldCount < arraySchema.maxItems
  }

  const canRemove = (index: number): boolean => {
    if (arraySchema.minItems != null && fieldCount <= arraySchema.minItems) {
      return false
    }

    return index >= 0 && index < fieldCount
  }

  const appendItem = (): void => {
    if (!canAdd()) {
      return
    }

    const nextIndex = fieldCount
    const itemPointer = getItemPointer(nextIndex)
    const defaultValue = getDefaultItemValue(getItemSchema(nextIndex))

    formContext.setValue(itemPointer, defaultValue, {
      shouldValidate: false,
    })
    setFieldCount((count) => count + 1)
  }

  const removeItem = (index: number): void => {
    if (!canRemove(index)) {
      return
    }

    for (let i = index; i < fieldCount - 1; i += 1) {
      const nextValue: unknown = formContext.getValues(getItemPointer(i + 1))
      formContext.setValue(getItemPointer(i), nextValue)
      formContext.unregister(getItemPointer(i + 1))
    }

    formContext.unregister(getItemPointer(fieldCount - 1))
    setFieldCount((count) => count - 1)
  }

  const isPrimitiveItem = (index: number): boolean => {
    const itemSchema = getItemSchema(index)
    const type = itemSchema?.type

    return (
      type === 'string' ||
      type === 'number' ||
      type === 'integer' ||
      type === 'boolean'
    )
  }

  const { type: _ignoredInputType, ...baseFields } = baseInput
  void _ignoredInputType

  const arrayMethods: UseArrayReturnType = {
    ...baseFields,
    type: InputTypes.fieldArray,
    validator,
    getFields: () => fields,
    getItemPointer,
    getItemSchema,
    getItemValidator,
    appendItem,
    removeItem,
    canAdd,
    canRemove,
    isPrimitiveItem,
    getItemLabelProps: (index: number) => {
      const itemPointer = getItemPointer(index)
      const labelProps: ComponentProps<'label'> = {}

      labelProps.id = getItemLabelId(itemPointer)
      labelProps.htmlFor = getItemInputId(itemPointer)

      return labelProps
    },
    getItemInputProps: (index: number) => {
      const itemSchema = getItemSchema(index)
      const itemPointer = getItemPointer(index)
      const itemValidator = getItemValidator(index)
      const { register } = formContext

      if (!itemSchema || itemSchema.type === 'object') {
        return {
          ...register(itemPointer, itemValidator),
          id: getItemInputId(itemPointer),
        }
      }

      const itemBase: BasicInputReturnType = {
        ...baseInput,
        pointer: itemPointer,
        name: String(index),
        validator: itemValidator,
        getObject: () => itemSchema,
        getCurrentValue: (): FieldValues =>
          formContext.getValues(itemPointer) as FieldValues,
        getError: () => baseInput.getError(),
      }

      if (itemSchema.type === 'string' && !itemSchema.enum) {
        return {
          ...getRawInputCustomFields(itemBase, 'text').getInputProps(),
          id: getItemInputId(itemPointer),
        }
      }

      if (
        itemSchema.type === 'integer' ||
        itemSchema.type === 'number' ||
        itemSchema.enum
      ) {
        return {
          ...getInputCustomFields(itemBase).getInputProps(),
          id: getItemInputId(itemPointer),
        }
      }

      return {
        ...register(itemPointer, itemValidator),
        id: getItemInputId(itemPointer),
      }
    },
  }

  return arrayMethods
}

export const useArray: UseArrayParameters = (pointer: string) => {
  const baseInput = useGenericInput(pointer)
  const { formContext, validator } = baseInput
  const arraySchema = baseInput.getObject() as ArrayJSONSchemaType
  const initialCount = Math.max(
    getListArrayEntries(formContext.getValues(), pointer).length,
    arraySchema.minItems ?? 0
  )
  const [fieldCount, setFieldCount] = useState(initialCount)
  const fieldCountRef = useRef(fieldCount)

  fieldCountRef.current = fieldCount

  useEffect(() => {
    const arrayRules: typeof validator.validate =
      typeof validator.validate === 'object' ? { ...validator.validate } : {}

    formContext.register(pointer, {
      ...validator,
      validate: {
        ...arrayRules,
        arrayLength: (): string | true => {
          const entries = getListArrayEntries(formContext.getValues(), pointer)
          const length = Math.max(entries.length, fieldCountRef.current)

          if (arraySchema.minItems != null && length < arraySchema.minItems) {
            return ErrorTypes.minItems
          }

          if (arraySchema.maxItems != null && length > arraySchema.maxItems) {
            return ErrorTypes.maxItems
          }

          return true
        },
      },
    })

    return () => {
      formContext.unregister(pointer)
    }
  }, [
    arraySchema.maxItems,
    arraySchema.minItems,
    formContext,
    pointer,
    validator,
  ])

  return buildArrayReturn(baseInput, fieldCount, setFieldCount)
}
