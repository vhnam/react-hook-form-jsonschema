import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType } from '../../JSONSchema'
import type { JSONFormContextValues } from '../../components/types'
import type { ErrorMessage } from './errorMessage'
import type { InputTypes } from '../inputTypes'

export interface BasicInputReturnType {
  getError(): ErrorMessage
  getObject(): JSONSchemaType
  getCurrentValue(): unknown
  formContext: JSONFormContextValues
  isRequired: boolean
  name: string
  type: InputTypes
  pointer: string
  validator: RegisterOptions
}
