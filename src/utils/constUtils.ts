import type {
  ArrayJSONSchemaType,
  JSONSchemaType,
  ObjectJSONSchemaType,
} from '../JSONSchema/types'
import { getItemsSchemaForIndex } from '../JSONSchema/logic/schemaAccess'

type SchemaConstValue =
  | boolean
  | string
  | number
  | null
  | Record<string, unknown>
  | unknown[]

const hasOwnProperty = (object: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key)

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isSchemaConstValue = (value: unknown): value is SchemaConstValue =>
  value === null ||
  typeof value === 'boolean' ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  Array.isArray(value) ||
  isObjectRecord(value)

export const hasSchemaConst = (schema: JSONSchemaType): boolean =>
  hasOwnProperty(schema, 'const')

export const getSchemaConst = (
  schema: JSONSchemaType
): SchemaConstValue | undefined => {
  const value = (schema as Record<string, unknown>).const

  return isSchemaConstValue(value) ? value : undefined
}

const normalizeFormValueForSchema = (
  value: unknown,
  schema: JSONSchemaType
): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    if (value === '') {
      return value
    }

    const numericValue = Number(value)

    return Number.isFinite(numericValue) ? numericValue : value
  }

  if (schema.type === 'boolean') {
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }
  }

  return value
}

export const areJSONValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return false
    }

    if (left.length !== right.length) {
      return false
    }

    return left.every((item, index) => areJSONValuesEqual(item, right[index]))
  }

  if (isObjectRecord(left) || isObjectRecord(right)) {
    if (!isObjectRecord(left) || !isObjectRecord(right)) {
      return false
    }

    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    if (leftKeys.length !== rightKeys.length) {
      return false
    }

    return leftKeys.every(
      (key) =>
        hasOwnProperty(right, key) && areJSONValuesEqual(left[key], right[key])
    )
  }

  return false
}

export const isFormValueEqualToConst = (
  value: unknown,
  schema: JSONSchemaType
): boolean => {
  return areJSONValuesEqual(
    normalizeFormValueForSchema(value, schema),
    schema.const
  )
}

export type SchemaConstValidationError = {
  pointer: string
}

const concatSchemaPointer = (pointer: string, node: string): string =>
  `${pointer}/${node}`

const shouldValidateConst = (
  value: unknown,
  schema: JSONSchemaType
): boolean => {
  if (!hasSchemaConst(schema) || getSchemaConst(schema) === undefined) {
    return false
  }

  if (value === undefined) {
    return false
  }

  if (
    value === '' &&
    schema.const !== '' &&
    schema.type !== 'object' &&
    schema.type !== 'array'
  ) {
    return false
  }

  return true
}

export const getSchemaConstValidationErrors = (
  schema: JSONSchemaType,
  value: unknown,
  pointer = '#'
): SchemaConstValidationError[] => {
  const errors: SchemaConstValidationError[] = []

  if (
    shouldValidateConst(value, schema) &&
    !isFormValueEqualToConst(value, schema)
  ) {
    errors.push({ pointer })
  }

  if (schema.type === 'object' && isObjectRecord(value)) {
    const objectSchema = schema as ObjectJSONSchemaType
    const properties = objectSchema.properties ?? {}

    Object.keys(properties).forEach((key) => {
      errors.push(
        ...getSchemaConstValidationErrors(
          properties[key],
          value[key],
          concatSchemaPointer(concatSchemaPointer(pointer, 'properties'), key)
        )
      )
    })
  }

  if (schema.type === 'array' && Array.isArray(value)) {
    const arraySchema = schema as ArrayJSONSchemaType

    value.forEach((entry, index) => {
      const itemSchema = getItemsSchemaForIndex(arraySchema, index)

      if (!itemSchema) {
        return
      }

      errors.push(
        ...getSchemaConstValidationErrors(
          itemSchema,
          entry,
          concatSchemaPointer(pointer, String(index))
        )
      )
    })
  }

  return errors
}
