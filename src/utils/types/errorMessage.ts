import type {
  JSONSchemaBaseInstanceTypes,
  JSONSchemaType,
} from '../../JSONSchema'

import { ErrorTypes } from '../errorTypes'

export type ErrorMessageValues =
  | JSONSchemaType['enum']
  | JSONSchemaBaseInstanceTypes
  | undefined

export type ErrorMessage =
  | {
      message: ErrorTypes | string
      expected: ErrorMessageValues
    }
  | undefined
