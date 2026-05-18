import {
  createContext,
  useContext,
  useMemo,
  useRef,
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

  const isFirstRender = useRef(true)

  if (typeof onChange === 'function') {
    const watchedInputs = methods.watch()

    if (isFirstRender.current === false) {
      onChange(getObjectFromForm(props.schema, watchedInputs))
    }
  }

  const idMap = useMemo(() => getIdSchemaPairs(props.schema), [props.schema])

  const resolvedSchemaRefs = useMemo(
    () => resolveRefs(props.schema, idMap, []),
    [props.schema, idMap]
  )

  const formContext: JSONFormContextValues = useMemo(() => {
    return {
      ...methods,
      errors: methods.formState.errors,
      schema: resolvedSchemaRefs,
      idMap,
      customValidators: props.customValidators,
    }
  }, [methods, resolvedSchemaRefs, idMap, props.customValidators])

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

  if (props.noNativeValidate) {
    formProps.noValidate = props.noNativeValidate
  }

  if (isFirstRender.current === true) {
    isFirstRender.current = false
  }

  return (
    <InternalFormContext.Provider value={formContext}>
      <form {...formProps}>{props.children}</form>
    </InternalFormContext.Provider>
  )
}
