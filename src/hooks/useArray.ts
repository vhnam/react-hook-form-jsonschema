import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { ArrayJSONSchemaType, JSONSchemaType } from '../JSONSchema'
import type { JSONSubSchemaInfo } from '../JSONSchema'
import type {
  UseArrayParameters,
  BasicInputReturnType,
  UseArrayReturnType,
} from '../utils/types/arrayHookTypes'
import { InputTypes } from '../utils/inputTypes'
import {
  canAddBeyondTupleLength,
  getDefaultItemValue,
  getItemsSchemaForIndex,
  getSingleItemsSchema,
  getTupleItemsLength,
} from './arrayUtils'
import {
  getArrayItemPointer,
  getListArrayEntries,
  getListArrayItemPointersByIndex,
} from '../utils/listArrayFormUtils'
import { getEnumAsStringArray } from '../utils/enumUtils'
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
  const tupleLength = getTupleItemsLength(arraySchema)
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

  const getItemOptions = (index: number): string[] => {
    const itemSchema = getItemSchema(index)

    return itemSchema?.enum ? getEnumAsStringArray(itemSchema) : []
  }

  const canAdd = (): boolean => {
    if (!canAddBeyondTupleLength(arraySchema, fieldCount)) {
      return false
    }

    if (arraySchema.maxItems == null) {
      return true
    }

    return fieldCount < arraySchema.maxItems
  }

  const canRemove = (index: number): boolean => {
    const effectiveMinItems = Math.max(arraySchema.minItems ?? 0, tupleLength)

    if (fieldCount <= effectiveMinItems) {
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

    const formValues = formContext.getValues() as Record<string, unknown>
    const itemPointersByIndex = getListArrayItemPointersByIndex(
      formValues,
      pointer
    )
    const pointersToClear = new Set<string>()

    for (let i = index; i < fieldCount; i += 1) {
      pointersToClear.add(getItemPointer(i))
      itemPointersByIndex
        .get(i)
        ?.forEach((itemPointer) => pointersToClear.add(itemPointer))
    }

    formContext.unregister([...pointersToClear])

    for (let i = index; i < fieldCount - 1; i += 1) {
      const sourcePrefix = getItemPointer(i + 1)
      const targetPrefix = getItemPointer(i)
      const sourcePointers = itemPointersByIndex.get(i + 1) ?? []

      sourcePointers.forEach((sourcePointer) => {
        const targetPointer = `${targetPrefix}${sourcePointer.slice(
          sourcePrefix.length
        )}`

        formContext.setValue(targetPointer, formValues[sourcePointer], {
          shouldValidate: false,
        })
      })
    }

    setFieldCount((count) => count - 1)
  }

  const isPrimitiveItem = (index: number): boolean => {
    const itemSchema = getItemSchema(index)

    if (!itemSchema) {
      return false
    }

    if (itemSchema.properties) {
      return false
    }

    const type = itemSchema.type

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
    getItemOptions,
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
        getCurrentValue: (): unknown => formContext.getValues(itemPointer),
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
    getItemSelectProps: (index: number) => {
      const itemPointer = getItemPointer(index)
      const itemValidator = getItemValidator(index)
      const { register } = formContext

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
  const { formContext } = baseInput
  const { getValues, register, unregister } = formContext
  const arraySchema = baseInput.getObject() as ArrayJSONSchemaType
  const tupleLength = getTupleItemsLength(arraySchema)
  const initialCount = Math.max(
    getListArrayEntries(getValues(), pointer).length,
    arraySchema.minItems ?? 0,
    tupleLength
  )
  const [fieldCount, setFieldCount] = useState(initialCount)
  const fieldCountRef = useRef(fieldCount)

  fieldCountRef.current = fieldCount

  useEffect(() => {
    const minItems = Math.max(
      arraySchema.minItems ?? 0,
      baseInput.isRequired ? 1 : 0,
      tupleLength
    )

    // List arrays store values at indexed pointers (`…/0`, `…/1`), not at the
    // array pointer. RHF `required` / getArrayValidator rules read the parent
    // field value and would always fail; length is validated here instead.
    register(pointer, {
      validate: {
        arrayLength: (): string | true => {
          const entries = getListArrayEntries(getValues(), pointer)
          const length = Math.max(entries.length, fieldCountRef.current)

          if (minItems > 0 && length < minItems) {
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
      unregister(pointer)
    }
  }, [
    arraySchema.maxItems,
    arraySchema.minItems,
    baseInput.isRequired,
    getValues,
    pointer,
    register,
    tupleLength,
    unregister,
  ])

  return buildArrayReturn(baseInput, fieldCount, setFieldCount)
}
