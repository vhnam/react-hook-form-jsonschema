import type { FieldError, RegisterOptions } from 'react-hook-form'
import { useFormState } from 'react-hook-form'

import type { GenericInputParameters, BasicInputReturnType } from './types'
import { InputTypes } from './types'
import type { JSONFormContextValues } from '../components'
import { useFormContext } from '../components'
import type { JSONSubSchemaInfo } from '../JSONSchema'
import { useAnnotatedSchemaFromPointer } from '../JSONSchema/path-handler'
import { getError } from './validators/getError'
import { getValidator } from './validators/getGenericValidator'
import {
  getNumberMaximum,
  getNumberMinimum,
  getNumberStep,
} from './validators/numberUtilities'

export const getGenericInput = (
  formContext: JSONFormContextValues,
  subSchemaInfo: JSONSubSchemaInfo,
  pointer: string,
  fieldError?: FieldError
): BasicInputReturnType => {
  const { JSONSchema, isRequired, objectName } = subSchemaInfo

  let minimum: number | undefined
  let maximum: number | undefined
  let step: number | 'any'

  if (JSONSchema.type === 'number' || JSONSchema.type === 'integer') {
    const stepAndDecimalPlaces = getNumberStep(JSONSchema)

    step = stepAndDecimalPlaces[0]

    minimum = getNumberMinimum(JSONSchema)
    maximum = getNumberMaximum(JSONSchema)
  }

  const validator: RegisterOptions = getValidator(
    subSchemaInfo,
    formContext.customValidators ?? {}
  )

  return {
    name: objectName,
    pointer,
    isRequired,
    formContext,
    type: InputTypes.generic,
    validator,
    getError: () =>
      getError(
        fieldError ??
          (formContext.errors[pointer]
            ? (formContext.errors[pointer] as FieldError)
            : undefined),
        JSONSchema,
        isRequired,
        formContext,
        pointer,
        minimum,
        maximum,
        step
      ),
    getObject: () => JSONSchema,
    getCurrentValue: (): unknown => formContext.getValues(pointer),
  }
}

export const useGenericInput: GenericInputParameters = (pointer) => {
  const formContext = useFormContext()
  const { errors } = useFormState({
    control: formContext.control,
    name: pointer,
  })
  const data = formContext.getSchemaData(formContext.getValues())
  const subSchemaInfo = useAnnotatedSchemaFromPointer(pointer, data)

  return getGenericInput(
    formContext,
    subSchemaInfo,
    pointer,
    errors[pointer] as FieldError | undefined
  )
}
