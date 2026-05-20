import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { getIdSchemaPairs, resolveRefs } from '../JSONSchema/logic/refHandlers'
import { ErrorTypes } from '../utils/errorTypes'
import {
  areJSONValuesEqual,
  getSchemaConstValidationErrors,
} from '../utils/constUtils'

type SchemaData = Record<string, unknown>
type GetSchemaData = (
  schema: JSONSchemaType,
  formValues: Record<string, unknown>
) => SchemaData
type SchemaDataCache = {
  data: SchemaData
  schema: JSONSchemaType
  source: FieldValues
}

const getSchemaDataFromForm: GetSchemaData = getObjectFromForm

export const InternalFormContext = createContext<unknown>(null)

export function useFormContext<
  T extends FieldValues = FieldValues,
>(): JSONFormContextValues<T> {
  return useContext(InternalFormContext) as JSONFormContextValues<T>
}

export const FormContext = <FormValues extends FieldValues = FieldValues>(
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
      ({
        ...schemaDefaultValues,
        ...defaultValues,
      }) as DefaultValues<FormValues>,
    [schemaDefaultValues, defaultValues]
  )

  const methods = useForm<FormValues>({
    defaultValues: formDefaultValues,
    mode: validationMode,
    reValidateMode: revalidateMode,
    shouldFocusError: submitFocusError,
  })
  const { reset } = methods
  const hasMountedRef = useRef(false)
  const formDefaultValuesRef = useRef<DefaultValues<FormValues>>(formDefaultValues)
  const schemaDataCacheRef = useRef<SchemaDataCache | undefined>(undefined)
  const constErrorPointersRef = useRef<string[]>([])

  const getSchemaData = useCallback(
    (formValues: FieldValues): SchemaData => {
      const cached = schemaDataCacheRef.current

      if (
        cached?.schema === resolvedSchemaRefs &&
        cached.source === formValues
      ) {
        return cached.data
      }

      const data = getSchemaDataFromForm(resolvedSchemaRefs, formValues)

      schemaDataCacheRef.current = {
        data,
        schema: resolvedSchemaRefs,
        source: formValues,
      }

      return data
    },
    [resolvedSchemaRefs]
  )

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      formDefaultValuesRef.current = formDefaultValues

      return
    }

    if (areJSONValuesEqual(formDefaultValuesRef.current, formDefaultValues)) {
      return
    }

    formDefaultValuesRef.current = formDefaultValues
    reset(formDefaultValues)
  }, [formDefaultValues, reset])

  useEffect(() => {
    if (typeof onChange !== 'function') {
      return
    }

    const subscription = methods.watch((formValues) => {
      onChange(getSchemaData(formValues))
    })

    return () => subscription.unsubscribe()
  }, [getSchemaData, methods, onChange])

  const formContext: JSONFormContextValues<FormValues> = useMemo(() => {
    const context = {
      ...methods,
      schema: resolvedSchemaRefs,
      idMap,
      customValidators: props.customValidators,
      getSchemaData,
    } as JSONFormContextValues<FormValues>

    Object.defineProperty(context, 'errors', {
      enumerable: true,
      get: () => methods.formState.errors,
    })

    return context
  }, [
    getSchemaData,
    methods,
    resolvedSchemaRefs,
    idMap,
    props.customValidators,
  ])

  const formProps: ComponentProps<'form'> = { ...userFormProps }

  const submitHandler = methods.handleSubmit((data, event) => {
    const schemaData = getSchemaData(data)
    const constErrors = getSchemaConstValidationErrors(
      resolvedSchemaRefs,
      schemaData
    )

    constErrorPointersRef.current = constErrors.map((error) => error.pointer)

    if (constErrors.length > 0) {
      constErrors.forEach((error) => {
        methods.setError(error.pointer as never, {
          type: 'validate',
          message: ErrorTypes.notConst,
        })
      })

      return
    }

    if (props.onSubmit) {
      void props.onSubmit({
        data: schemaData,
        event,
        methods: formContext,
      })
    }
  })

  formProps.onSubmit = (event) => {
    if (constErrorPointersRef.current.length > 0) {
      methods.clearErrors(constErrorPointersRef.current as never)
      constErrorPointersRef.current = []
    }

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
