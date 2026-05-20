import type {
  UseObjectProperties,
  UseObjectReturnType,
  BasicInputReturnType,
  UISchemaType,
} from './types'
import { UITypes } from './types'
import type {
  JSONObject,
  JSONSubSchemaInfo,
  ObjectJSONSchemaType,
} from '../JSONSchema'
import {
  useAnnotatedSchemaFromPointer,
  concatFormPointer,
} from '../JSONSchema/path-handler'
import {
  getAnnotatedSchemaFromPointer,
  getObjectFromForm,
} from '../JSONSchema/logic'
import { getGenericInput } from './useGenericInput'
import { getInputCustomFields } from './useInput'
import { getRadioCustomFields } from './useRadio'
import type { JSONFormContextValues } from '../components'
import { useFormContext } from '../components'
import { getSelectCustomFields } from './useSelect'
import { getHiddenCustomFields } from './useHidden'
import { getPasswordCustomFields } from './usePassword'
import { getTextAreaCustomFields } from './useTextArea'
import { getCheckboxCustomFields, isMultiSelectArray } from './useCheckbox'
import type { ArrayJSONSchemaType } from '../JSONSchema'

function getFromGeneric(
  genericInput: BasicInputReturnType
): UseObjectReturnType {
  const currentObject = genericInput.getObject()
  const inputs: UseObjectReturnType = []

  switch (currentObject.type) {
    case 'string':
      if (currentObject.enum) {
        inputs.push(getSelectCustomFields(genericInput))
      } else {
        inputs.push(getInputCustomFields(genericInput))
      }

      break

    case 'integer':

    case 'number':
      inputs.push(getInputCustomFields(genericInput))
      break

    case 'array':
      if (isMultiSelectArray(currentObject as ArrayJSONSchemaType)) {
        inputs.push(getCheckboxCustomFields(genericInput))
      }
      break

    case 'boolean':
      inputs.push(getCheckboxCustomFields(genericInput))
      break
  }

  return inputs
}

// Outside of this function
function getChildProperties(
  pointer: string,
  UISchema: UISchemaType | undefined,
  formContext: JSONFormContextValues,
  data: JSONObject
) {
  return (allInputs: UseObjectReturnType, key: string) => {
    const newUISchema =
      UISchema && UISchema.properties ? UISchema.properties[key] : undefined

    const currentPointer = concatFormPointer(
      concatFormPointer(pointer, 'properties'),
      key
    )

    const currentPointerInfo = getAnnotatedSchemaFromPointer(
      currentPointer,
      data,
      formContext
    )

    const newInput = getStructure(
      formContext,
      currentPointerInfo,
      currentPointer,
      newUISchema,
      data
    )

    return allInputs.concat(newInput)
  }
}

function getStructure(
  formContext: JSONFormContextValues,
  pointerInfo: JSONSubSchemaInfo,
  pointer: string,
  UISchema: UISchemaType | undefined,
  data: JSONObject
): UseObjectReturnType {
  let inputs: UseObjectReturnType = []
  const { JSONSchema } = pointerInfo

  const genericInput = getGenericInput(formContext, pointerInfo, pointer)

  if (JSONSchema.type === 'object') {
    const properties = (JSONSchema as ObjectJSONSchemaType).properties ?? {}
    const objKeys = Object.keys(properties)
    const childInputs = objKeys.reduce(
      getChildProperties(pointer, UISchema, formContext, data),
      []
    )

    return childInputs
  }

  if (!UISchema) {
    return inputs.concat(getFromGeneric(genericInput))
  }

  switch (UISchema.type) {
    case UITypes.default:
      inputs = inputs.concat(getFromGeneric(genericInput))
      break

    case UITypes.checkbox:
      inputs.push(getCheckboxCustomFields(genericInput))
      break

    case UITypes.hidden:
      inputs.push(getHiddenCustomFields(genericInput))
      break

    case UITypes.input:
      inputs.push(getInputCustomFields(genericInput))
      break

    case UITypes.password:
      inputs.push(getPasswordCustomFields(genericInput))
      break

    case UITypes.radio:
      inputs.push(getRadioCustomFields(genericInput))
      break

    case UITypes.select:
      inputs.push(getSelectCustomFields(genericInput))
      break

    case UITypes.textArea:
      inputs.push(getTextAreaCustomFields(genericInput))
      break
  }

  return inputs
}

export const useObject: UseObjectProperties = (props) => {
  const formContext = useFormContext()
  const data = getObjectFromForm(formContext.schema, formContext.getValues())
  const childArray = getStructure(
    formContext,
    useAnnotatedSchemaFromPointer(props.pointer, data),
    props.pointer,
    props.UISchema,
    data
  )

  return childArray
}
