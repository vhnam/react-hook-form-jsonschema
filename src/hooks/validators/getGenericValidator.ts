import type { RegisterOptions } from 'react-hook-form'

import type { CustomValidators, CustomValidatorReturnValue } from './types'
import { ErrorTypes } from '../../utils/errorTypes'
import { getNumberValidator } from './getNumberValidator'
import { getStringValidator } from './getStringValidator'
import { getArrayValidator } from './getArrayValidator'
import type { ArrayJSONSchemaType, JSONSubSchemaInfo } from '../../JSONSchema'
import { getSingleItemsSchema } from '../arrayUtils'
import {
  hasSchemaConst,
  isFormValueEqualToConst,
} from '../../utils/constUtils'

type GetCustomValidatorReturnType = Record<
  string,
  (value: string) => CustomValidatorReturnValue
>

function getCustomValidator(
  customValidators: CustomValidators,
  context: JSONSubSchemaInfo
): GetCustomValidatorReturnType {
  return Object.keys(customValidators).reduce(
    (acc: GetCustomValidatorReturnType, key: string) => {
      acc[key] = (value: string) => {
        return customValidators[key](value, context)
      }

      return acc
    },
    {}
  )
}

export const getValidator = (
  context: JSONSubSchemaInfo,
  customValidators: CustomValidators
): RegisterOptions => {
  const { JSONSchema, isRequired } = context

  // The use of this variable prevents a strange undocumented behaviour of react-hook-form
  // that is it fails to validate if the `validate` field exists but is empty.
  const hasValidate =
    Object.keys(customValidators).length > 0 ||
    (JSONSchema.enum != null && JSONSchema.enum.length > 0) ||
    hasSchemaConst(JSONSchema)

  const validator: RegisterOptions = {
    ...(hasValidate
      ? {
          validate: {
            ...getCustomValidator(customValidators, context),

            ...(JSONSchema.enum
              ? {
                  enumValidator: (value: string) => {
                    if (!JSONSchema.enum || !value) {
                      return true
                    }

                    for (const item of JSONSchema.enum) {
                      if (item == value) {
                        return true
                      }
                    }

                    return ErrorTypes.notInEnum
                  },
                }
              : undefined),

            ...(hasSchemaConst(JSONSchema)
              ? {
                  constValidator: (value: unknown) => {
                    if (
                      (value === undefined || value === null || value === '') &&
                      JSONSchema.const !== ''
                    ) {
                      return true
                    }

                    return (
                      isFormValueEqualToConst(value, JSONSchema) ||
                      ErrorTypes.notConst
                    )
                  },
                }
              : undefined),
          },
        }
      : undefined),
  }

  if (isRequired) {
    validator.required = ErrorTypes.required
  }

  switch (JSONSchema.type) {
    case 'integer':

    case 'number':
      return getNumberValidator(JSONSchema, validator)

    case 'string':
      return getStringValidator(JSONSchema, validator)

    case 'boolean':
      return validator

    case 'array':
      return getArrayValidator(
        JSONSchema as ArrayJSONSchemaType,
        validator,
        getSingleItemsSchema(JSONSchema as ArrayJSONSchemaType)
      )

    default:
      return validator
  }
}
