export type JSONSchemaType =
  | ArrayJSONSchemaType
  | BasicJSONSchemaType
  | BooleanJSONSchemaType
  | NumberJSONSchemaType
  | ObjectJSONSchemaType
  | StringJSONSchemaType
  | NullJSONSchemaType

export type JSONPrimitive = boolean | string | number | null
export type JSONValue = JSONPrimitive | JSONObject | JSONArray
export type JSONObject = Record<string, unknown>
export type JSONArray = unknown[]
export type FormPointerValues = Record<string, unknown>

export interface BasicJSONSchemaType {
  type?: string
  title?: string
  description?: string
  $comment?: string
  $schema?: string
  $id?: string
  $ref?: string
  anyOf?: JSONSchemaType[]
  allOf?: JSONSchemaType[]
  oneOf?: JSONSchemaType[]
  not?: JSONSchemaType[]
  enum?: JSONSchemaBaseInstanceTypes[]
  const?: JSONValue
  default?: unknown
  examples?: unknown
  [key: string]: unknown
}

export type PropertyDependencies = Record<string, string[]>
export type SchemaDependencies = Record<string, JSONSchemaType>
export type Draft07Dependencies = Record<string, string[] | JSONSchemaType>
export interface ObjectJSONSchemaType extends BasicJSONSchemaType {
  type?: 'object'
  properties?: Record<string, JSONSchemaType>
  additionalProperties?: boolean
  required?: string[]
  dependentRequired?: PropertyDependencies
  dependentSchemas?: SchemaDependencies
  if?: JSONSchemaType
  then?: JSONSchemaType
  else?: JSONSchemaType
  propertyNames?: StringJSONSchemaType
  minProperties?: number
  maxProperties?: number
  dependencies?: Draft07Dependencies
  patternProperties?: Record<string, JSONSchemaType>
}

export interface StringJSONSchemaType extends BasicJSONSchemaType {
  type?: 'string'
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  contentMediaType?: string
  contentEncoding?: string
}

export interface NumberJSONSchemaType extends BasicJSONSchemaType {
  type?: 'number' | 'integer'
  multipleOf?: number
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
}

export interface ArrayJSONSchemaType extends BasicJSONSchemaType {
  type?: 'array'
  items?: JSONSchemaType | JSONSchemaType[]
  additionalItems?: boolean | JSONSchemaType
  contains?: JSONSchemaType
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
}

export interface BooleanJSONSchemaType extends BasicJSONSchemaType {
  type?: 'boolean'
}

export interface NullJSONSchemaType extends BasicJSONSchemaType {
  type?: 'null'
}

export type JSONSchemaBaseInstanceTypes = JSONPrimitive

export type JSONSubSchemaInfo = {
  JSONSchema: JSONSchemaType
  isRequired: boolean
  objectName: string
  invalidPointer: boolean
  pointer: string
}

export type IDSchemaPair = Record<string, JSONSchemaType>
