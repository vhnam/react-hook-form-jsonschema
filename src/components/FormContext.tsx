import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ComponentProps,
} from 'react'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import type { FormContextProps, JSONFormContextValues } from './types'
import type { JSONSchemaType } from '../JSONSchema/types'
import {
  getDefaultValuesFromSchema,
  getObjectFromForm,
} from '../JSONSchema/logic/schemaHandlers'
import {
  getIdSchemaPairs,
  resolveRefs,
} from '../JSONSchema/logic/refHandlers'

type SchemaData = Record<string, unknown>
type GetSchemaData = (
  schema: JSONSchemaType,
  formValues: Record<string, unknown>
) => SchemaData

const getSchemaDataFromForm: GetSchemaData = getObjectFromForm

export const InternalFormContext = createContext<unknown>(null)

export function useFormContext<
  T extends FieldValues = FieldValues,
>(): JSONFormContextValues<T> {
  return useContext(InternalFormContext) as JSONFormContextValues<T>
}

export const FormContext = <
  FormValues extends FieldValues = FieldValues,
>(
  props: FormContextProps<FormValues>
) => {
  const {
    formProps: userFormProps,
    onChange,
    validationMode = 'onSubmit',
    revalidateMode = 'onChange',
    submitFocusError = true,
    defaultValues,
  } = props

  const idMap = useMemo(() => getIdSchemaPairs(props.schema), [props.schema])

  const resolvedSchemaRefs = useMemo<JSONSchemaType>(
    () => resolveRefs(props.schema, idMap, []),
    [props.schema, idMap]
  )

  const schemaDefaultValues = useMemo(
    () => getDefaultValuesFromSchema(resolvedSchemaRefs),
    [resolvedSchemaRefs]
  )

  const formDefaultValues = useMemo<DefaultValues<FormValues>>(
    () =>
      ({ ...schemaDefaultValues, ...defaultValues }) as DefaultValues<FormValues>,
    [schemaDefaultValues, defaultValues]
  )

  const methods = useForm<FormValues>({
    defaultValues: formDefaultValues,
    mode: validationMode,
    reValidateMode: revalidateMode,
    shouldFocusError: submitFocusError,
  })

  const getSchemaData = (formValues: FieldValues): SchemaData =>
    getSchemaDataFromForm(resolvedSchemaRefs, formValues)

  // Subscribe to errors so the provider re-renders after validation (RHF proxies formState).
  const { errors } = methods.formState

  useEffect(() => {
    if (typeof onChange !== 'function') {
      return
    }

    const subscription = methods.watch((formValues) => {
      onChange(getSchemaData(formValues))
    })

    return () => subscription.unsubscribe()
  }, [methods, onChange, resolvedSchemaRefs])

  const formContext: JSONFormContextValues<FormValues> = useMemo(() => {
    return {
      ...methods,
      errors,
      schema: resolvedSchemaRefs,
      idMap,
      customValidators: props.customValidators,
    }
  }, [methods, errors, resolvedSchemaRefs, idMap, props.customValidators])

  const formProps: ComponentProps<'form'> = { ...userFormProps }

  const submitHandler = methods.handleSubmit((data, event) => {
    if (props.onSubmit) {
      void props.onSubmit({
        data: getSchemaData(data),
        event,
        methods: formContext,
      })
    }
  })

  formProps.onSubmit = (event) => {
    void submitHandler(event)
  }

  // RHF owns validation; native validation blocks submit when HTML attrs mirror schema rules.
  formProps.noValidate = props.noNativeValidate ?? true

  return (
    <InternalFormContext.Provider value={formContext}>
      <form {...formProps}>{props.children}</form>
    </InternalFormContext.Provider>
  )
}
