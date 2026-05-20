import type { JSONSubSchemaInfo } from '../../../JSONSchema'

export { ErrorTypes } from '../../../utils/errorTypes'
export type { ErrorMessage, ErrorMessageValues } from '../../../utils/types/errorMessage'

export type CustomValidatorReturnValue = string | true

export type CustomValidator = (
  value: string,
  context: JSONSubSchemaInfo
) => CustomValidatorReturnValue

export type CustomValidators = Record<string, CustomValidator>
