import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ComponentProps,
} from 'react'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import type { FormContextProps, JSONFormContextValues } from './types'
import {
  getObjectFromForm,
  getIdSchemaPairs,
  resolveRefs,
} from '../JSONSchema/logic'

export const InternalFormContext = createContext<JSONFormContextValues | null>(
  null
)

export function useFormContext<
  T extends FieldValues = FieldValues,
>(): JSONFormContextValues<T> {
  return useContext(InternalFormContext) as JSONFormContextValues<T>
}

export const FormContext = (props: FormContextProps) => {
  const {
    formProps: userFormProps,
    onChange,
    validationMode = 'onSubmit',
    revalidateMode = 'onChange',
    submitFocusError = true,
    defaultValues,
  } = props

  const methods = useForm({
    defaultValues,
    mode: validationMode,
    reValidateMode: revalidateMode,
    shouldFocusError: submitFocusError,
  })

  // Subscribe to errors so the provider re-renders after validation (RHF proxies formState).
  const { errors } = methods.formState

  useEffect(() => {
    if (typeof onChange !== 'function') {
      return
    }

    const subscription = methods.watch((formValues) => {
      onChange(getObjectFromForm(props.schema, formValues))
    })

    return () => subscription.unsubscribe()
  }, [methods, onChange, props.schema])

  const idMap = useMemo(() => getIdSchemaPairs(props.schema), [props.schema])

  const resolvedSchemaRefs = useMemo(
    () => resolveRefs(props.schema, idMap, []),
    [props.schema, idMap]
  )

  const formContext: JSONFormContextValues = useMemo(() => {
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
        data: getObjectFromForm(props.schema, data),
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
