import type { ArrayJSONSchemaType, JSONSchemaType } from '../JSONSchema'
import { getEnumAsStringArray } from '../utils/enumUtils'
import {
  getArrayItemPointer,
  getListArrayEntries,
} from '../utils/listArrayFormUtils'
import {
  getNumberMaximum,
  getNumberMinimum,
  getNumberStep,
  toFixed,
} from './validators/numberUtilities'

export { getArrayItemPointer, getListArrayEntries }

export const getSingleItemsSchema = (
  arraySchema: ArrayJSONSchemaType
): JSONSchemaType | undefined => {
  const items = arraySchema.items

  if (items == null || Array.isArray(items)) {
    return undefined
  }

  return items
}

export const getItemsSchemaForIndex = (
  arraySchema: ArrayJSONSchemaType,
  index: number
): JSONSchemaType | undefined => {
  const items = arraySchema.items

  if (items == null) {
    return undefined
  }

  if (Array.isArray(items)) {
    return items[index] ?? items[items.length - 1]
  }

  return items
}

/** Multi-select from a fixed set of options (enum or numeric range). */
export const isMultiSelectArray = (
  arraySchema: ArrayJSONSchemaType
): boolean => {
  const items = getSingleItemsSchema(arraySchema)

  if (!items) {
    return false
  }

  if (items.enum) {
    return true
  }

  if (items.type === 'string' && arraySchema.enum) {
    return true
  }

  if (items.type === 'number' || items.type === 'integer') {
    const minimum = getNumberMinimum(items) ?? getNumberMinimum(arraySchema)
    const maximum = getNumberMaximum(items) ?? getNumberMaximum(arraySchema)

    return minimum !== undefined && maximum !== undefined
  }

  return false
}

export const getMultiSelectOptions = (
  arraySchema: ArrayJSONSchemaType
): string[] => {
  const items = getSingleItemsSchema(arraySchema)

  if (!items) {
    return []
  }

  let options: string[] = []

  if (items.enum) {
    options = getEnumAsStringArray(items)
  } else if (items.type === 'string' && arraySchema.enum) {
    options = getEnumAsStringArray(arraySchema)
  } else if (items.type === 'number' || items.type === 'integer') {
    const stepAndDecimalPlaces = getNumberStep(items)
    const step = stepAndDecimalPlaces[0]
    const decimalPlaces = stepAndDecimalPlaces[1]
    const minimum = getNumberMinimum(items) ?? getNumberMinimum(arraySchema)
    const maximum = getNumberMaximum(items) ?? getNumberMaximum(arraySchema)

    if (minimum !== undefined && maximum !== undefined && step !== 'any') {
      for (let i = minimum; i <= maximum; i += step) {
        options.push(toFixed(i, decimalPlaces || 0))
      }
    }
  }

  if (arraySchema.uniqueItems) {
    options = [...new Set(options)]
  }

  return options
}

/** Checkbox option field names (legacy bracket form). */
export const getMultiSelectFieldName = (
  arrayPointer: string,
  optionIndex: number
): string => {
  return `${arrayPointer}[${optionIndex}]`
}

export const normalizeArrayValue = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value
  }

  if (value === undefined || value === null || value === '') {
    return []
  }

  return [value]
}

export const getDefaultItemValue = (
  itemSchema: JSONSchemaType | undefined
): Record<string, unknown> | string | number => {
  if (!itemSchema) {
    return ''
  }

  if (itemSchema.type === 'object') {
    return {}
  }

  if (itemSchema.type === 'number' || itemSchema.type === 'integer') {
    return ''
  }

  return ''
}
