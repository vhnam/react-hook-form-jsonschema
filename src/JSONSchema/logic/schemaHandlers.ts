import type { ArrayJSONSchemaType, JSONSchemaType, JSONSubSchemaInfo } from '../types'
import type { JSONFormContextValues } from '../../components'
import {
  concatFormPointer,
  JSONSchemaRootPointer,
  getSplitPointer,
} from './pathUtils'
import {
  asFormDataNode,
  asObjectSchema,
  getSchemaNode,
  getItemsSchemaForIndex,
  getSchemaProperty,
  isJSONSchemaObject,
} from './schemaAccess'

const isArrayIndex = (node: string): boolean => /^\d+$/.test(node)

const parsers: Record<string, (data: string) => number | boolean> = {
  integer: (data: string): number => parseInt(data, 10),
  number: (data: string): number => parseFloat(data),
  boolean: (data: string): boolean => data === 'true',
}

interface FormReducerContext {
  currentJSON: JSONSchemaType
  currentSubSchema: JSONSchemaType | undefined
  insideProperties: boolean
  targetData: unknown
}

export const getObjectFromForm = (
  originalSchema: JSONSchemaType,
  data: JSONSchemaType
): JSONSchemaType => {
  return Object.keys(data)
    .sort()
    .reduce((objectFromData: JSONSchemaType, key: string) => {
      const splitPointer = getSplitPointer(key)
      const fieldValue: unknown = getSchemaNode(data, key)

      if (!splitPointer || fieldValue === undefined || fieldValue === null) {
        return objectFromData
      }

      splitPointer.reduce(
        (currentContext: FormReducerContext, node: string, index: number, src: string[]) => {
          if (isArrayIndex(node) && currentContext.currentSubSchema?.type === 'array') {
            const arraySchema = currentContext.currentSubSchema as ArrayJSONSchemaType
            const itemIndex = parseInt(node, 10)
            const itemsSchema = getItemsSchemaForIndex(arraySchema, itemIndex)

            if (itemsSchema) {
              currentContext.currentSubSchema = itemsSchema
            }

            const arrayTarget = currentContext.currentJSON as unknown[]

            if (Array.isArray(arrayTarget) && arrayTarget[itemIndex] === undefined) {
              const initialValue =
                itemsSchema?.type === 'array'
                  ? []
                  : itemsSchema?.type === 'object'
                    ? {}
                    : undefined

              if (initialValue !== undefined) {
                arrayTarget[itemIndex] = initialValue
              }
            }
          } else if (!isArrayIndex(node)) {
            currentContext.currentSubSchema = currentContext.currentSubSchema
              ? getSchemaProperty(currentContext.currentSubSchema, node)
              : undefined
          }

          if (node === 'properties' && !currentContext.insideProperties) {
            return { ...currentContext, insideProperties: true }
          }

          if (index === src.length - 1) {
            const arrayItemsSchema =
              currentContext.currentSubSchema?.type === 'array'
                ? (currentContext.currentSubSchema as { items?: { type?: string } })
                    .items
                : undefined
            const itemType =
              arrayItemsSchema &&
              !Array.isArray(arrayItemsSchema) &&
              arrayItemsSchema.type
                ? arrayItemsSchema.type
                : currentContext.currentSubSchema?.type
            let parsedValue: unknown = currentContext.targetData ?? {}

            if (Array.isArray(fieldValue)) {
              parsedValue = fieldValue
            } else if (
              typeof itemType === 'string' &&
              itemType in parsers &&
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number' ||
                typeof fieldValue === 'boolean')
            ) {
              parsedValue = parsers[itemType](String(fieldValue))
            } else if (
              !isArrayIndex(node) &&
              typeof itemType === 'string' &&
              itemType in parsers
            ) {
              parsedValue = fieldValue
            } else if (isArrayIndex(node)) {
              parsedValue = fieldValue
            }

            if (isArrayIndex(node)) {
              const arrayTarget = currentContext.currentJSON as unknown[]
              const itemIndex = parseInt(node, 10)

              if (Array.isArray(arrayTarget)) {
                const existing = arrayTarget[itemIndex]

                if (
                  typeof parsedValue === 'object' &&
                  parsedValue !== null &&
                  !Array.isArray(parsedValue) &&
                  typeof existing === 'object' &&
                  existing !== null &&
                  !Array.isArray(existing)
                ) {
                  arrayTarget[itemIndex] = {
                    ...(existing as Record<string, unknown>),
                    ...(parsedValue as Record<string, unknown>),
                  }
                } else {
                  arrayTarget[itemIndex] = parsedValue
                }
              }
            } else if (currentContext.currentSubSchema) {
              Reflect.set(currentContext.currentJSON, node, parsedValue)
            }
          } else if (
            !getSchemaNode(currentContext.currentJSON, node) &&
            currentContext.currentSubSchema &&
            !isArrayIndex(node)
          ) {
            const childSchema = getSchemaProperty(
              currentContext.currentSubSchema,
              node
            )
            const initialValue =
              childSchema?.type === 'array' || isArrayIndex(src[index + 1] ?? '')
                ? []
                : {}

            Reflect.set(currentContext.currentJSON, node, initialValue)
          }

          const nextJson = isArrayIndex(node)
            ? (currentContext.currentJSON as unknown[])[parseInt(node, 10)]
            : getSchemaNode(currentContext.currentJSON, node)
          currentContext.currentJSON = Array.isArray(nextJson)
            ? nextJson
            : isJSONSchemaObject(nextJson)
              ? nextJson
              : {}

          return { ...currentContext, insideProperties: false }
        },
        {
          currentJSON: objectFromData,
          currentSubSchema: originalSchema,
          insideProperties: false,
          targetData: fieldValue,
        }
      )

      return objectFromData
    }, {})
}

interface ReducerSubSchemaInfo {
  JSONSchema: JSONSchemaType | undefined
  currentData: JSONSchemaType | undefined
  invalidPointer: boolean
  isRequired: boolean
  fatherExists: boolean
  fatherIsRequired: boolean
  pointer: string
  objectName: string
  insideProperties: boolean
  currentRequiredField: string[]
}

export const getAnnotatedSchemaFromPointer = (
  pointer: string,
  data: JSONSchemaType,
  formContext: JSONFormContextValues
): JSONSubSchemaInfo => {
  const { schema } = formContext

  const info = getSplitPointer(pointer).reduce(
    (currentInfo: ReducerSubSchemaInfo, node: string) => {
      const { JSONSchema, currentData } = currentInfo

      if (isArrayIndex(node) && JSONSchema?.type === 'array') {
        const nextSchema = getItemsSchemaForIndex(
          JSONSchema as ArrayJSONSchemaType,
          parseInt(node, 10)
        )
        const newCurrentData = asFormDataNode(
          currentData ? getSchemaNode(currentData, node) : undefined
        )

        return {
          ...currentInfo,
          JSONSchema: nextSchema,
          currentData: newCurrentData,
          fatherExists: !!currentData,
          isRequired: false,
          invalidPointer: nextSchema === undefined,
          objectName: node,
          pointer: concatFormPointer(currentInfo.pointer, node),
          insideProperties: false,
        }
      }

      const objectSchema = JSONSchema ? asObjectSchema(JSONSchema) : undefined

      if (!objectSchema && !currentInfo.insideProperties) {
        return {
          ...currentInfo,
          JSONSchema: undefined,
          invalidPointer: true,
        }
      }

      if (node === 'properties' && !currentInfo.insideProperties && objectSchema) {
        const fatherIsRequired = currentInfo.isRequired

        return {
          ...currentInfo,
          JSONSchema: objectSchema.properties ?? {},
          fatherIsRequired,
          pointer: concatFormPointer(currentInfo.pointer, node),
          insideProperties: true,
          currentRequiredField: objectSchema.required ?? [],
        }
      }

      const fatherExists = !!currentData
      const newCurrentData = asFormDataNode(
        currentData ? getSchemaNode(currentData, node) : undefined
      )
      const isRequired = currentInfo.currentRequiredField.indexOf(node) > -1
      const nextSchema = JSONSchema
        ? getSchemaProperty(JSONSchema, node)
        : undefined

      return {
        ...currentInfo,
        JSONSchema: nextSchema,
        currentData: newCurrentData,
        fatherExists,
        isRequired,
        invalidPointer: false,
        objectName: node,
        pointer: concatFormPointer(currentInfo.pointer, node),
        insideProperties: false,
      }
    },
    {
      JSONSchema: schema,
      currentData: data,
      fatherExists: true,
      fatherIsRequired: true,
      invalidPointer: false,
      isRequired: true,
      objectName: '',
      pointer: JSONSchemaRootPointer,
      insideProperties: false,
      currentRequiredField: asObjectSchema(schema)?.required ?? [],
    }
  )

  return {
    JSONSchema: info.JSONSchema as JSONSchemaType,
    invalidPointer: info.invalidPointer,
    isRequired:
      (info.fatherIsRequired && info.isRequired) ||
      (!info.fatherIsRequired && info.isRequired && info.fatherExists),
    objectName: info.objectName,
    pointer: info.pointer,
  }
}
