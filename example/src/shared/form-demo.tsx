import { useReducer, useState, type ReactNode } from 'react'
import {
  FormContext,
  type ObjectJSONSchemaType,
  type OnSubmitParameters,
  type UISchemaType,
} from 'react-hook-form-jsonschema'

type SaveState = {
  loading: boolean
  error: boolean | null
  success: boolean | null
}

type SaveAction =
  | { type: 'START_SAVING' }
  | { type: 'SUCCESS_SAVING' }
  | { type: 'ERROR_SAVING' }

const initialState: SaveState = { loading: false, error: null, success: null }

function reducer(state: SaveState, action: SaveAction): SaveState {
  switch (action.type) {
    case 'START_SAVING':
      return { loading: true, error: null, success: null }
    case 'SUCCESS_SAVING':
      return { loading: false, error: false, success: true }
    case 'ERROR_SAVING':
      return { loading: false, error: true, success: false }
    default:
      return state
  }
}

function save(_data: OnSubmitParameters['data']) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, 600)
  })
}

export type FormDemoProps = {
  schema: ObjectJSONSchemaType
  title: string
  description: string
  uiSchema?: UISchemaType
  defaultValues?: Record<string, unknown>
  children: ReactNode
}

export function FormDemo({
  schema,
  title,
  description,
  uiSchema,
  defaultValues,
  children,
}: FormDemoProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [submitted, setSubmitted] = useState<unknown>(null)

  return (
    <FormContext
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={({ data }: OnSubmitParameters) => {
        dispatch({ type: 'START_SAVING' })
        save(data)
          .then(() => {
            setSubmitted(data)
            dispatch({ type: 'SUCCESS_SAVING' })
          })
          .catch(() => dispatch({ type: 'ERROR_SAVING' }))
      }}
    >
      <div className="demo">
        <header className="demo-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </header>

        <div className="demo-body">{children}</div>

        <footer className="demo-footer">
          <button type="submit" disabled={state.loading}>
            {state.loading ? 'Submitting…' : 'Submit'}
          </button>
          {state.error && (
            <p className="form-status form-status--error">Error saving.</p>
          )}
          {state.success && (
            <p className="form-status form-status--success">Saved successfully.</p>
          )}
          {submitted != null && (
            <pre className="submit-output" aria-label="Submitted data">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          )}
        </footer>
      </div>
    </FormContext>
  )
}
