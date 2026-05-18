import type { JSONSchemaType, IDSchemaPair } from '../types'
import {
  getSplitPointer,
  concatFormPointer,
  JSONSchemaRootPointer,
} from './pathUtils'
import { getSchemaProperty } from './schemaAccess'

const absoluteRegExp = /^[a-z][a-z0-9+.-]*:/i
const isAbsoluteURI = (uri: string) => {
  return absoluteRegExp.test(uri)
}

const fragmentRegExp = /^#(\/(([^#/~])|(~[01]))*)*/i
const isURIFragmentPointer = (pointer: string) => {
  return fragmentRegExp.test(pointer)
}

export const getSchemaFromRef = (
  $ref: string,
  IDRecord: Record<string, JSONSchemaType>,
  schema?: JSONSchemaType
): JSONSchemaType => {
  if (isAbsoluteURI($ref)) {
    const baseUrl = new URL($ref)

    if (baseUrl.hash) {
      return getSchemaFromRef(
        baseUrl.hash,
        IDRecord,
        IDRecord[`${baseUrl.origin}${baseUrl.pathname}`]
      )
    }
  } else if (isURIFragmentPointer($ref) && schema) {
    const resolved = getSplitPointer($ref).reduce<JSONSchemaType | undefined>(
      (currentSchema, pointer) =>
        currentSchema ? getSchemaProperty(currentSchema, pointer) : undefined,
      schema
    )

    if (resolved) {
      return resolved
    }
  }

  return IDRecord[$ref]
}

export const resolveRefs = (
  schema: JSONSchemaType,
  idMap: IDSchemaPair,
  usedRefs: string[]
): JSONSchemaType => {
  let resolvedRefs: JSONSchemaType = {}

  if (schema.$ref) {
    const { $ref } = schema

    if (usedRefs.indexOf($ref) > -1) {
      return resolvedRefs
    }

    usedRefs.push($ref)

    resolvedRefs = {
      ...getSchemaFromRef($ref, idMap),
    }
  } else {
    resolvedRefs = { ...schema }
  }

  return Object.keys(resolvedRefs).reduce(
    (acc: JSONSchemaType, key: string) => {
      const child = getSchemaProperty(acc, key)

      if (child && !(child.$ref && usedRefs.indexOf(child.$ref) > -1)) {
        acc[key] = resolveRefs(child, idMap, usedRefs.slice())
      }

      return acc
    },
    resolvedRefs
  )
}

export const getIdSchemaPairs = (schema: JSONSchemaType) => {
  const recursiveGetIdSchemaPairs = (
    currentPointer: string,
    currentSchema: JSONSchemaType,
    baseUrl: URL | undefined
  ): Record<string, JSONSchemaType> => {
    return Object.keys(currentSchema).reduce(
      (IDs: Record<string, JSONSchemaType>, key: string) => {
        const child = getSchemaProperty(currentSchema, key)

        if (child) {
          return {
            ...recursiveGetIdSchemaPairs(
              concatFormPointer(currentPointer, key),
              child,
              baseUrl
            ),
            ...IDs,
          }
        }

        if (key === '$id') {
          const id: unknown = Reflect.get(currentSchema, key)

          if (typeof id === 'string') {
            IDs[id] = currentSchema

            if (!isAbsoluteURI(id)) {
              try {
                IDs[new URL(id, baseUrl).href] = currentSchema
              } catch (e) {
                if (!(e instanceof TypeError)) {
                  throw e
                }
              }
            }
          }
        }

        return IDs
      },
      { [currentPointer]: currentSchema }
    )
  }

  let baseUrl: URL | undefined

  if (schema.$id && isAbsoluteURI(schema.$id)) {
    try {
      baseUrl = new URL(schema.$id)
    } catch (e) {
      baseUrl = undefined
      if (!(e instanceof TypeError)) {
        throw e
      }
    }
  }

  if (baseUrl) {
    return {
      [baseUrl.href]: schema,
      ...recursiveGetIdSchemaPairs(JSONSchemaRootPointer, schema, baseUrl),
    }
  }

  return recursiveGetIdSchemaPairs(JSONSchemaRootPointer, schema, baseUrl)
}
