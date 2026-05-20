import type { JSONSchemaType, ObjectJSONSchemaType } from '../types'
import { isJSONSchemaObject } from './schemaAccess'

type SchemaOverlay = JSONSchemaType &
  Partial<
    Pick<
      ObjectJSONSchemaType,
      | 'properties'
      | 'required'
      | 'dependentRequired'
      | 'dependentSchemas'
      | 'dependencies'
      | 'if'
      | 'then'
      | 'else'
    >
  >

const hasOwnProperty = (object: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key)

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const areValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => areValuesEqual(item, right[index]))
    )
  }

  if (isObjectRecord(left) || isObjectRecord(right)) {
    if (!isObjectRecord(left) || !isObjectRecord(right)) {
      return false
    }

    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) => hasOwnProperty(right, key) && areValuesEqual(left[key], right[key])
      )
    )
  }

  return false
}

const normalizeValueForSchema = (
  value: unknown,
  schema: JSONSchemaType
): unknown => {
  const schemaType = (schema as { type?: unknown }).type

  if (typeof value !== 'string') {
    return value
  }

  if (schemaType === 'number' || schemaType === 'integer') {
    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : value
  }

  if (schemaType === 'boolean') {
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }
  }

  return value
}

const getSchemaTypes = (schema: JSONSchemaType): string[] => {
  const schemaType = (schema as { type?: unknown }).type

  if (typeof schemaType === 'string') {
    return [schemaType]
  }

  return Array.isArray(schemaType)
    ? schemaType.filter((type): type is string => typeof type === 'string')
    : []
}

const matchesType = (value: unknown, schemaType: string): boolean => {
  switch (schemaType) {
    case 'array':
      return Array.isArray(value)

    case 'boolean':
      return typeof value === 'boolean'

    case 'integer':
      return typeof value === 'number' && Number.isInteger(value)

    case 'null':
      return value === null

    case 'number':
      return typeof value === 'number' && Number.isFinite(value)

    case 'object':
      return isObjectRecord(value)

    case 'string':
      return typeof value === 'string'

    default:
      return true
  }
}

const isValueValidForSchema = (
  value: unknown,
  schema: JSONSchemaType
): boolean => {
  if (!isJSONSchemaObject(schema)) {
    return true
  }

  const normalizedValue = normalizeValueForSchema(value, schema)
  const schemaTypes = getSchemaTypes(schema)
  const schemaConst = (schema as { const?: unknown }).const
  const schemaEnum = (schema as { enum?: unknown }).enum

  if (
    schemaTypes.length > 0 &&
    !schemaTypes.some((schemaType) => matchesType(normalizedValue, schemaType))
  ) {
    return false
  }

  if (
    hasOwnProperty(schema, 'const') &&
    !areValuesEqual(normalizedValue, schemaConst)
  ) {
    return false
  }

  if (
    Array.isArray(schemaEnum) &&
    !schemaEnum.some((entry) => areValuesEqual(normalizedValue, entry))
  ) {
    return false
  }

  if (Array.isArray(schema.allOf)) {
    if (!schema.allOf.every((entry) => isValueValidForSchema(value, entry))) {
      return false
    }
  }

  if (Array.isArray(schema.anyOf)) {
    if (!schema.anyOf.some((entry) => isValueValidForSchema(value, entry))) {
      return false
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const matchCount = schema.oneOf.filter((entry) =>
      isValueValidForSchema(value, entry)
    ).length

    if (matchCount !== 1) {
      return false
    }
  }

  if (isObjectRecord(value)) {
    const objectSchema = schema as ObjectJSONSchemaType

    if (
      objectSchema.required?.some((key) => !hasOwnProperty(value, key)) === true
    ) {
      return false
    }

    const properties = objectSchema.properties ?? {}

    if (
      Object.keys(properties).some(
        (key) =>
          hasOwnProperty(value, key) &&
          !isValueValidForSchema(value[key], properties[key])
      )
    ) {
      return false
    }
  }

  return true
}

const mergeSchema = (
  baseSchema: JSONSchemaType | undefined,
  overlaySchema: JSONSchemaType
): JSONSchemaType => {
  if (!baseSchema || !isJSONSchemaObject(baseSchema)) {
    return overlaySchema
  }

  if (!isJSONSchemaObject(overlaySchema)) {
    return baseSchema
  }

  const mergedSchema: JSONSchemaType = {
    ...baseSchema,
    ...overlaySchema,
  }

  const baseProperties = (baseSchema as ObjectJSONSchemaType).properties
  const overlayProperties = (overlaySchema as ObjectJSONSchemaType).properties

  if (baseProperties || overlayProperties) {
    ;(mergedSchema as ObjectJSONSchemaType).properties = {
      ...(baseProperties ?? {}),
      ...(overlayProperties ?? {}),
    }
  }

  return mergedSchema
}

const applyRequired = (
  requiredFields: Set<string>,
  required: string[] | undefined
): void => {
  required?.forEach((field) => requiredFields.add(field))
}

const applyProperties = (
  activeSchema: ObjectJSONSchemaType,
  properties: Record<string, JSONSchemaType> | undefined
): void => {
  if (!properties) {
    return
  }

  activeSchema.properties = { ...(activeSchema.properties ?? {}) }

  Object.keys(properties).forEach((key) => {
    activeSchema.properties![key] = mergeSchema(
      activeSchema.properties![key],
      properties[key]
    )
  })
}

const applySchemaOverlay = (
  activeSchema: ObjectJSONSchemaType,
  requiredFields: Set<string>,
  overlaySchema: JSONSchemaType,
  data: unknown
): void => {
  if (!isJSONSchemaObject(overlaySchema)) {
    return
  }

  const overlay = overlaySchema as ObjectJSONSchemaType

  applyProperties(activeSchema, overlay.properties)
  applyRequired(requiredFields, overlay.required)
  applyDependentRequired(requiredFields, overlay, data)
  applyDependentSchemas(activeSchema, requiredFields, overlay, data)
  applyIfThenElse(activeSchema, requiredFields, overlay, data)
  applyAllOf(activeSchema, requiredFields, overlay, data)
}

const applyDependentRequired = (
  requiredFields: Set<string>,
  schema: SchemaOverlay,
  data: unknown
): void => {
  if (!isObjectRecord(data)) {
    return
  }

  const dependentRequired = (schema.dependentRequired ?? {}) as Record<
    string,
    string[]
  >

  Object.keys(dependentRequired).forEach((trigger) => {
    if (hasOwnProperty(data, trigger)) {
      applyRequired(requiredFields, dependentRequired[trigger])
    }
  })

  const dependencies = (schema.dependencies ?? {}) as Record<
    string,
    string[] | JSONSchemaType
  >

  Object.keys(dependencies).forEach((trigger) => {
    const dependency = dependencies[trigger]

    if (hasOwnProperty(data, trigger) && Array.isArray(dependency)) {
      applyRequired(requiredFields, dependency)
    }
  })
}

const applyDependentSchemas = (
  activeSchema: ObjectJSONSchemaType,
  requiredFields: Set<string>,
  schema: SchemaOverlay,
  data: unknown
): void => {
  if (!isObjectRecord(data)) {
    return
  }

  const dependentSchemas = (schema.dependentSchemas ?? {}) as Record<
    string,
    JSONSchemaType
  >

  Object.keys(dependentSchemas).forEach((trigger) => {
    if (hasOwnProperty(data, trigger)) {
      applySchemaOverlay(
        activeSchema,
        requiredFields,
        dependentSchemas[trigger],
        data
      )
    }
  })

  const dependencies = (schema.dependencies ?? {}) as Record<
    string,
    string[] | JSONSchemaType
  >

  Object.keys(dependencies).forEach((trigger) => {
    const dependency = dependencies[trigger]

    if (
      hasOwnProperty(data, trigger) &&
      !Array.isArray(dependency) &&
      isJSONSchemaObject(dependency)
    ) {
      applySchemaOverlay(activeSchema, requiredFields, dependency, data)
    }
  })
}

const applyIfThenElse = (
  activeSchema: ObjectJSONSchemaType,
  requiredFields: Set<string>,
  schema: SchemaOverlay,
  data: unknown
): void => {
  if (!schema.if) {
    return
  }

  const branch = isValueValidForSchema(data, schema.if) ? schema.then : schema.else

  if (branch) {
    applySchemaOverlay(activeSchema, requiredFields, branch, data)
  }
}

const applyAllOf = (
  activeSchema: ObjectJSONSchemaType,
  requiredFields: Set<string>,
  schema: SchemaOverlay,
  data: unknown
): void => {
  schema.allOf?.forEach((entry) => {
    applySchemaOverlay(activeSchema, requiredFields, entry, data)
  })
}

export const getActiveSchemaForData = (
  schema: JSONSchemaType,
  data: unknown
): JSONSchemaType => {
  if (!isJSONSchemaObject(schema) || schema.type !== 'object') {
    return schema
  }

  const objectSchema = schema as ObjectJSONSchemaType
  const activeSchema: ObjectJSONSchemaType = {
    ...objectSchema,
    properties: objectSchema.properties ? { ...objectSchema.properties } : undefined,
  }
  const requiredFields = new Set<string>(objectSchema.required ?? [])

  applyDependentRequired(requiredFields, schema, data)
  applyDependentSchemas(activeSchema, requiredFields, schema, data)
  applyIfThenElse(activeSchema, requiredFields, schema, data)
  applyAllOf(activeSchema, requiredFields, schema, data)

  if (requiredFields.size > 0) {
    activeSchema.required = [...requiredFields]
  } else {
    delete activeSchema.required
  }

  return activeSchema
}

export const isSchemaHidden = (schema: JSONSchemaType | undefined): boolean =>
  isJSONSchemaObject(schema) && Reflect.get(schema, 'x-hidden') === true

const collectConditionKeys = (
  schema: JSONSchemaType | undefined,
  dependencyKeys: Set<string>
): void => {
  if (!schema || !isJSONSchemaObject(schema)) {
    return
  }

  const objectSchema = schema as ObjectJSONSchemaType

  objectSchema.required?.forEach((key) => dependencyKeys.add(key))

  Object.keys(objectSchema.properties ?? {}).forEach((key) => {
    dependencyKeys.add(key)
  })

  schema.allOf?.forEach((entry) => collectConditionKeys(entry, dependencyKeys))
  schema.anyOf?.forEach((entry) => collectConditionKeys(entry, dependencyKeys))
  schema.oneOf?.forEach((entry) => collectConditionKeys(entry, dependencyKeys))
}

const collectConditionalKeys = (
  schema: JSONSchemaType | undefined,
  dependencyKeys: Set<string>
): void => {
  if (!schema || !isJSONSchemaObject(schema)) {
    return
  }

  const overlay = schema as ObjectJSONSchemaType

  Object.keys(overlay.dependentRequired ?? {}).forEach((key) =>
    dependencyKeys.add(key)
  )
  Object.keys(overlay.dependentSchemas ?? {}).forEach((key) =>
    dependencyKeys.add(key)
  )
  Object.keys(overlay.dependencies ?? {}).forEach((key) =>
    dependencyKeys.add(key)
  )

  collectConditionKeys(overlay.if, dependencyKeys)
  collectConditionalKeys(overlay.then, dependencyKeys)
  collectConditionalKeys(overlay.else, dependencyKeys)
  schema.allOf?.forEach((entry) => collectConditionalKeys(entry, dependencyKeys))
}

export const getConditionalDependencyKeys = (
  schema: JSONSchemaType | undefined
): string[] => {
  const dependencyKeys = new Set<string>()

  collectConditionalKeys(schema, dependencyKeys)

  return [...dependencyKeys]
}
