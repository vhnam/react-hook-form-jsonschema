import type { ComponentProps } from 'react'
import type { RegisterOptions } from 'react-hook-form'

import type { JSONSchemaType } from '../../JSONSchema'
import type { InputTypes } from '../inputTypes'
import type { BasicInputReturnType } from './basicInputTypes'

export type { BasicInputReturnType } from './basicInputTypes'

export interface UseArrayReturnType extends BasicInputReturnType {
  type: InputTypes.fieldArray
  getFields(): { id: string }[]
  getItemPointer(index: number): string
  getItemSchema(index: number): JSONSchemaType | undefined
  getItemValidator(index: number): RegisterOptions
  appendItem(): void
  removeItem(index: number): void
  canAdd(): boolean
  canRemove(index: number): boolean
  isPrimitiveItem(index: number): boolean
  getItemInputProps(index: number): ComponentProps<'input'>
  getItemLabelProps(index: number): ComponentProps<'label'>
}

export interface UseArrayParameters {
  (pointer: string): UseArrayReturnType
}
