import type { JSONSchemaType, JSONSubSchemaInfo } from './types'
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
  data: JSONSchemaType
): JSONSubSchemaInfo => {
  return getAnnotatedSchemaFromPointer(path, data, useFormContext())
}

const useObjectFromForm = (data: JSONSchemaType): JSONSchemaType => {
  return getObjectFromForm(useFormContext().schema, data)
}

interface PointerDataContext {
  currentData: JSONSchemaType | undefined
  insideProperties: boolean
}

const getDataFromPointer = (
  pointer: string,
  data: JSONSchemaType
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
        currentData: currentContext.currentData
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
