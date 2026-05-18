import type { JSONSchemaType, ObjectJSONSchemaType } from '../types'

export const isJSONSchemaObject = (value: unknown): value is JSONSchemaType => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const getSchemaProperty = (
  schema: JSONSchemaType,
  key: string
): JSONSchemaType | undefined => {
  const value: unknown = Reflect.get(schema, key)

  return isJSONSchemaObject(value) ? value : undefined
}

export const getSchemaNode = (
  schema: JSONSchemaType,
  key: string
): unknown => Reflect.get(schema, key)

/** Form data is stored in a JSONSchema-shaped tree; leaves may be scalars. */
export const asFormDataNode = (value: unknown): JSONSchemaType | undefined => {
  if (value === undefined) {
    return undefined
  }

  return isJSONSchemaObject(value) ? value : (value as JSONSchemaType)
}

export const asObjectSchema = (
  schema: JSONSchemaType
): ObjectJSONSchemaType | undefined => {
  return schema.type === 'object' ? (schema as ObjectJSONSchemaType) : undefined
}
