import type { BaseSyntheticEvent, HTMLAttributes, PropsWithChildren } from 'react'
import type {
  DeepPartial,
  FieldErrors,
  FieldValues,
  Mode,
  UseFormReturn,
} from 'react-hook-form'

import type { JSONSchemaType, IDSchemaPair } from '../../JSONSchema'
import type { CustomValidators } from '../../hooks/validators'

export interface JSONFormContextValues<
  FormValues extends FieldValues = FieldValues,
> extends UseFormReturn<FormValues> {
  errors: FieldErrors<FormValues>
  schema: JSONSchemaType
  idMap: IDSchemaPair
  customValidators?: CustomValidators
}

export type OnSubmitParameters = {
  data: JSONSchemaType
  event: BaseSyntheticEvent | undefined
  methods: JSONFormContextValues
}
export type OnSubmitType = (props: OnSubmitParameters) => void | Promise<void>

/** Matches `useForm` `reValidateMode` (excludes `onTouched` and `all`). */
export type RevalidateMode = Exclude<Mode, 'onTouched' | 'all'>

export type FormContextProps<FormValues extends FieldValues = FieldValues> =
  PropsWithChildren<{
    formProps?: Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'>
    validationMode?: Mode
    revalidateMode?: RevalidateMode
    submitFocusError?: boolean
    onChange?: (data: JSONSchemaType) => void
    onSubmit?: OnSubmitType
    noNativeValidate?: boolean
    customValidators?: CustomValidators
    schema: JSONSchemaType
    defaultValues?: DeepPartial<FormValues> | FormValues
  }>
