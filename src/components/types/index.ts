import type { BaseSyntheticEvent, HTMLAttributes, PropsWithChildren } from 'react'
import type {
  DeepPartial,
  FieldErrors,
  FieldValues,
  Mode,
  UseFormReturn,
} from 'react-hook-form'

import type {
  FormPointerValues,
  JSONObject,
  JSONSchemaType,
  IDSchemaPair,
} from '../../JSONSchema'
import type { CustomValidators } from '../../hooks/validators/types'

export interface JSONFormContextValues<
  FormValues extends FieldValues = FieldValues,
> extends UseFormReturn<FormValues> {
  errors: FieldErrors<FormValues>
  schema: JSONSchemaType
  idMap: IDSchemaPair
  customValidators?: CustomValidators
}

export type OnSubmitParameters<
  FormValues extends FieldValues = FieldValues,
> = {
  data: JSONObject
  event: BaseSyntheticEvent | undefined
  methods: JSONFormContextValues<FormValues>
}
export type OnSubmitType<FormValues extends FieldValues = FieldValues> = (
  props: OnSubmitParameters<FormValues>
) => void | Promise<void>

/** Matches `useForm` `reValidateMode` (excludes `onTouched` and `all`). */
export type RevalidateMode = Exclude<Mode, 'onTouched' | 'all'>

export type FormContextProps<FormValues extends FieldValues = FieldValues> =
  PropsWithChildren<{
    formProps?: Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'>
    validationMode?: Mode
    revalidateMode?: RevalidateMode
    submitFocusError?: boolean
    onChange?: (data: JSONObject) => void
    onSubmit?: OnSubmitType<FormValues>
    noNativeValidate?: boolean
    customValidators?: CustomValidators
    schema: JSONSchemaType
    defaultValues?: DeepPartial<FormValues> | FormValues | FormPointerValues
  }>
