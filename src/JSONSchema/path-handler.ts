import type {
  FormPointerValues,
  JSONObject,
  JSONSubSchemaInfo,
} from './types'
import {
  getObjectFromForm,
  concatFormPointer,
  getAnnotatedSchemaFromPointer,
  getSplitPointer,
} from './logic'
import { asFormDataNode, getSchemaNode } from './logic/schemaAccess'
import { useFormContext } from '../components'

const useAnnotatedSchemaFromPointer = (
  path: string,
  data: JSONObject
): JSONSubSchemaInfo => {
  return getAnnotatedSchemaFromPointer(path, data, useFormContext())
}

const useObjectFromForm = (data: FormPointerValues): JSONObject => {
  return getObjectFromForm(useFormContext().schema, data)
}

interface PointerDataContext {
  currentData: unknown
  insideProperties: boolean
}

const isReadableNode = (
  value: unknown
): value is Record<string, unknown> | readonly unknown[] =>
  typeof value === 'object' && value !== null

const getDataFromPointer = (
  pointer: string,
  data: JSONObject
): undefined | string => {
  const splitPointer = getSplitPointer(pointer)

  let insideProperties = false

  const { currentData } = splitPointer.reduce<PointerDataContext>(
    (currentContext, node: string) => {
      if (node === 'properties' && !insideProperties) {
        insideProperties = true

        return { ...currentContext, insideProperties: true }
      }

      insideProperties = false

      return {
        currentData: isReadableNode(currentContext.currentData)
          ? asFormDataNode(getSchemaNode(currentContext.currentData, node))
          : undefined,
        insideProperties: true,
      }
    },
    { currentData: data, insideProperties: false }
  )

  if (
    typeof currentData === 'string' ||
    typeof currentData === 'number' ||
    typeof currentData === 'boolean'
  ) {
    return String(currentData)
  }

  return undefined
}

export {
  useObjectFromForm,
  concatFormPointer,
  useAnnotatedSchemaFromPointer,
  getDataFromPointer,
}
