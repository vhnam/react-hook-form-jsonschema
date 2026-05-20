import type {
  JSONSchemaType,
  JSONSchemaBaseInstanceTypes,
} from '../JSONSchema'

const mapEnumItemsToString = (obj: JSONSchemaBaseInstanceTypes): string => {
  return String(obj)
}

export const getEnumAsStringArray = (
  currentObject: JSONSchemaType
): string[] => {
  return currentObject.enum ? currentObject.enum.map(mapEnumItemsToString) : []
}
