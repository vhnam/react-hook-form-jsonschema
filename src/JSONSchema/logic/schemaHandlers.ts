import type {
  ArrayJSONSchemaType,
  JSONSchemaType,
  JSONSubSchemaInfo,
} from '../types'
import type { JSONFormContextValues } from '../../components'
import {
  getMultiSelectOptions,
  isMultiSelectArray,
} from '../../hooks/arrayUtils'
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
import { getActiveSchemaForData, isSchemaHidden } from './conditionalSchemas'
import { getSchemaConst, hasSchemaConst } from '../../utils/constUtils'

const isArrayIndex = (node: string): boolean => /^\d+$/.test(node)

const isReadableNode = (
  value: unknown
): value is Record<string, unknown> | readonly unknown[] =>
  typeof value === 'object' && value !== null

const hasOwnProperty = (object: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key)

const getRecordValue = (object: object, key: string): unknown =>
  (object as Record<string, unknown>)[key]

const hasSchemaDefault = (schema: JSONSchemaType): boolean =>
  hasOwnProperty(schema, 'default')

const hasSchemaInitialValue = (schema: JSONSchemaType): boolean =>
  hasSchemaDefault(schema) || hasSchemaConst(schema)

const getSchemaInitialValue = (schema: JSONSchemaType): unknown =>
  hasSchemaDefault(schema)
    ? (schema as { default?: unknown }).default
    : getSchemaConst(schema)

const cloneDefaultValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(cloneDefaultValue)
  }

  if (isJSONSchemaObject(value)) {
    return Object.keys(value).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = cloneDefaultValue(getRecordValue(value, key))

      return acc
    }, {})
  }

  return value
}

const compactMultiSelectArrayValue = (value: unknown[]): unknown[] =>
  value.filter(
    (entry) =>
      entry !== false && entry !== undefined && entry !== null && entry !== ''
  )

const maybeCompactMultiSelectValue = (
  arraySchema: ArrayJSONSchemaType | undefined,
  value: unknown
): unknown => {
  if (
    arraySchema?.type === 'array' &&
    arraySchema.uniqueItems === true &&
    isMultiSelectArray(arraySchema) &&
    Array.isArray(value)
  ) {
    return compactMultiSelectArrayValue(value)
  }

  return value
}

interface DefaultValueContext {
  defaults: Record<string, unknown>
  hasInheritedDefault: boolean
  inheritedDefault: unknown
  pointer: string
}

const setDefaultValue = (
  defaults: Record<string, unknown>,
  pointer: string,
  value: unknown
): void => {
  if (pointer !== JSONSchemaRootPointer) {
    defaults[pointer] = cloneDefaultValue(value)
  }
}

const collectArrayDefaultValues = (
  schema: ArrayJSONSchemaType,
  context: DefaultValueContext
): void => {
  const schemaHasInitialValue = hasSchemaInitialValue(schema)
  const hasDefault = schemaHasInitialValue || context.hasInheritedDefault
  const defaultValue = schemaHasInitialValue
    ? getSchemaInitialValue(schema)
    : context.inheritedDefault
  const isMultiSelectDefault =
    Array.isArray(defaultValue) &&
    schema.uniqueItems === true &&
    isMultiSelectArray(schema)
  const formDefaultValue = isMultiSelectDefault
    ? getMultiSelectOptions(schema).map((option) =>
        defaultValue.map(String).includes(option) ? option : false
      )
    : defaultValue
  const defaultItems = Array.isArray(formDefaultValue)
    ? formDefaultValue
    : undefined
  const itemCount = Math.max(
    defaultItems?.length ?? 0,
    Array.isArray(schema.items) ? schema.items.length : 0,
    schema.minItems ?? 0
  )

  if (hasDefault) {
    setDefaultValue(context.defaults, context.pointer, formDefaultValue)
  }

  if (isMultiSelectDefault) {
    return
  }

  for (let index = 0; index < itemCount; index += 1) {
    const itemSchema = getItemsSchemaForIndex(schema, index)

    if (!itemSchema) {
      continue
    }

    const itemHasInheritedDefault =
      defaultItems !== undefined && index in defaultItems

    collectSchemaDefaultValues(itemSchema, {
      defaults: context.defaults,
      hasInheritedDefault: itemHasInheritedDefault,
      inheritedDefault: itemHasInheritedDefault
        ? defaultItems[index]
        : undefined,
      pointer: concatFormPointer(context.pointer, String(index)),
    })
  }
}

const collectObjectDefaultValues = (
  schema: JSONSchemaType,
  context: DefaultValueContext
): void => {
  const objectSchema = asObjectSchema(schema)
  const properties = objectSchema?.properties ?? {}
  const schemaHasInitialValue = hasSchemaInitialValue(schema)
  const defaultValue = schemaHasInitialValue
    ? getSchemaInitialValue(schema)
    : context.inheritedDefault
  const objectDefault = isJSONSchemaObject(defaultValue)
    ? defaultValue
    : undefined

  Object.keys(properties).forEach((key) => {
    const childSchema = properties[key]
    const childHasInheritedDefault =
      objectDefault !== undefined && hasOwnProperty(objectDefault, key)

    collectSchemaDefaultValues(childSchema, {
      defaults: context.defaults,
      hasInheritedDefault: childHasInheritedDefault,
      inheritedDefault: childHasInheritedDefault
        ? getRecordValue(objectDefault, key)
        : undefined,
      pointer: concatFormPointer(
        concatFormPointer(context.pointer, 'properties'),
        key
      ),
    })
  })
}

const collectSchemaDefaultValues = (
  schema: JSONSchemaType,
  context: DefaultValueContext
): void => {
  if (schema.type === 'object') {
    collectObjectDefaultValues(schema, context)

    return
  }

  if (schema.type === 'array') {
    collectArrayDefaultValues(schema as ArrayJSONSchemaType, context)

    return
  }

  const schemaHasInitialValue = hasSchemaInitialValue(schema)

  if (schemaHasInitialValue || context.hasInheritedDefault) {
    const defaultValue = schemaHasInitialValue
      ? getSchemaInitialValue(schema)
      : context.inheritedDefault

    setDefaultValue(context.defaults, context.pointer, defaultValue)
  }
}

export const getDefaultValuesFromSchema = (
  schema: JSONSchemaType
): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {}

  collectSchemaDefaultValues(schema, {
    defaults,
    hasInheritedDefault: false,
    inheritedDefault: undefined,
    pointer: JSONSchemaRootPointer,
  })

  return defaults
}

const parsers: Record<string, (data: string) => number | boolean> = {
  integer: (data: string): number => parseInt(data, 10),
  number: (data: string): number => parseFloat(data),
  boolean: (data: string): boolean => data === 'true',
}

const getRawObjectFromForm = (
  data: Record<string, unknown>
): Record<string, unknown> => {
  return Object.keys(data)
    .sort()
    .reduce((rawObject: Record<string, unknown>, key: string) => {
      const fieldValue = getSchemaNode(data, key)

      if (fieldValue === undefined || fieldValue === null) {
        return rawObject
      }

      const nodes = getSplitPointer(key).filter((node) => node !== 'properties')
      let currentNode: Record<string, unknown> | unknown[] = rawObject

      nodes.forEach((node, index) => {
        const isLastNode = index === nodes.length - 1

        if (isLastNode) {
          if (Array.isArray(currentNode) && isArrayIndex(node)) {
            currentNode[parseInt(node, 10)] = fieldValue
          } else if (!Array.isArray(currentNode)) {
            Reflect.set(currentNode, node, fieldValue)
          }

          return
        }

        const nextNode = nodes[index + 1] ?? ''
        const nextValue = isArrayIndex(nextNode) ? [] : {}

        if (Array.isArray(currentNode) && isArrayIndex(node)) {
          const itemIndex = parseInt(node, 10)

          if (currentNode[itemIndex] === undefined) {
            currentNode[itemIndex] = nextValue
          }

          currentNode = currentNode[itemIndex] as Record<string, unknown> | unknown[]

          return
        }

        if (!Array.isArray(currentNode)) {
          if (!isReadableNode(getSchemaNode(currentNode, node))) {
            Reflect.set(currentNode, node, nextValue)
          }

          currentNode = getSchemaNode(currentNode, node) as
            | Record<string, unknown>
            | unknown[]
        }
      })

      return rawObject
    }, {})
}

interface FormReducerContext {
  currentJSON: Record<string, unknown> | unknown[]
  currentSubSchema: JSONSchemaType | undefined
  insideProperties: boolean
  targetData: unknown
}

export const getObjectFromForm = (
  originalSchema: JSONSchemaType,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const activeSchema = getActiveSchemaForData(
    originalSchema,
    getRawObjectFromForm(data)
  )

  return Object.keys(data)
    .sort()
    .reduce((objectFromData: Record<string, unknown>, key: string) => {
      const splitPointer = getSplitPointer(key)
      const fieldValue: unknown = getSchemaNode(data, key)

      if (!splitPointer || fieldValue === undefined || fieldValue === null) {
        return objectFromData
      }

      splitPointer.reduce(
        (
          currentContext: FormReducerContext,
          node: string,
          index: number,
          src: string[]
        ) => {
          if (
            isArrayIndex(node) &&
            currentContext.currentSubSchema?.type === 'array'
          ) {
            const arraySchema =
              currentContext.currentSubSchema as ArrayJSONSchemaType
            const itemIndex = parseInt(node, 10)
            const itemsSchema = getItemsSchemaForIndex(arraySchema, itemIndex)

            if (itemsSchema) {
              currentContext.currentSubSchema = itemsSchema
            }

            const arrayTarget = currentContext.currentJSON

            if (
              Array.isArray(arrayTarget) &&
              arrayTarget[itemIndex] === undefined
            ) {
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
                ? (
                    currentContext.currentSubSchema as {
                      items?: { type?: string }
                    }
                  ).items
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

            if (isSchemaHidden(currentContext.currentSubSchema)) {
              return { ...currentContext, insideProperties: false }
            }

            if (isArrayIndex(node)) {
              const arrayTarget = currentContext.currentJSON
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
              const arraySchema =
                currentContext.currentSubSchema.type === 'array'
                  ? (currentContext.currentSubSchema as ArrayJSONSchemaType)
                  : undefined

              Reflect.set(
                currentContext.currentJSON,
                node,
                maybeCompactMultiSelectValue(arraySchema, parsedValue)
              )
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
              childSchema?.type === 'array' ||
              isArrayIndex(src[index + 1] ?? '')
                ? []
                : {}

            Reflect.set(currentContext.currentJSON, node, initialValue)
          }

          const nextJson = isArrayIndex(node)
            ? Array.isArray(currentContext.currentJSON)
              ? currentContext.currentJSON[parseInt(node, 10)]
              : undefined
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
          currentSubSchema: activeSchema,
          insideProperties: false,
          targetData: fieldValue,
        }
      )

      return objectFromData
    }, {})
}

interface ReducerSubSchemaInfo {
  JSONSchema: JSONSchemaType | undefined
  currentData: unknown
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
  data: Record<string, unknown>,
  formContext: JSONFormContextValues
): JSONSubSchemaInfo => {
  const { schema } = formContext

  const info = getSplitPointer(pointer).reduce(
    (currentInfo: ReducerSubSchemaInfo, node: string) => {
      const { JSONSchema, currentData } = currentInfo

      if (isArrayIndex(node) && JSONSchema?.type === 'array') {
        const itemSchema = getItemsSchemaForIndex(
          JSONSchema as ArrayJSONSchemaType,
          parseInt(node, 10)
        )
        const newCurrentData = asFormDataNode(
          isReadableNode(currentData)
            ? getSchemaNode(currentData, node)
            : undefined
        )
        const nextSchema = itemSchema
          ? getActiveSchemaForData(itemSchema, newCurrentData)
          : undefined

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

      if (
        node === 'properties' &&
        !currentInfo.insideProperties &&
        objectSchema
      ) {
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
        isReadableNode(currentData)
          ? getSchemaNode(currentData, node)
          : undefined
      )
      const isRequired = currentInfo.currentRequiredField.indexOf(node) > -1
      const rawNextSchema = JSONSchema
        ? getSchemaProperty(JSONSchema, node)
        : undefined
      const nextSchema = rawNextSchema
        ? getActiveSchemaForData(rawNextSchema, newCurrentData)
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
      JSONSchema: getActiveSchemaForData(schema, data),
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
      !isSchemaHidden(info.JSONSchema) &&
      ((info.fatherIsRequired && info.isRequired) ||
        (!info.fatherIsRequired && info.isRequired && info.fatherExists)),
    objectName: info.objectName,
    pointer: info.pointer,
  }
}
