/**
 * Working example of `react-hook-form-jsonschema`.
 * See the root README for the full API.
 */

import { useReducer } from 'react'
import { createRoot } from 'react-dom/client'
import {
  useObject,
  FormContext,
  UITypes,
  InputTypes,
  type InputReturnTypes,
  type UseRawInputReturnType,
  type UseRadioReturnType,
  type UseSelectReturnType,
  type UISchemaType,
  type ObjectJSONSchemaType,
  type OnSubmitParameters,
} from 'react-hook-form-jsonschema'

const personSchema = {
  $id: 'https://example.com/person.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Person',
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      description: "The person's first name.",
      title: 'First Name',
    },
    lastName: {
      type: 'string',
      description: "The person's last name.",
      title: 'Last Name',
    },
    birthYear: {
      description: "The person's birth year.",
      type: 'integer',
      minimum: 1930,
      maximum: 2010,
      title: 'Birth Year',
    },
  },
} satisfies ObjectJSONSchemaType

const uiSchema: UISchemaType = {
  type: UITypes.default,
  properties: {
    birthYear: {
      type: UITypes.select,
    },
  },
}

function SpecializedObject(props: { baseObject: InputReturnTypes }) {
  switch (props.baseObject.type) {
    case InputTypes.input: {
      const inputObject = props.baseObject as UseRawInputReturnType

      return (
        <>
          <label {...inputObject.getLabelProps()}>
            {inputObject.getObject().title}
          </label>
          <input {...inputObject.getInputProps()} />
        </>
      )
    }
    case InputTypes.radio: {
      const radioObject = props.baseObject as UseRadioReturnType

      return (
        <>
          <label {...radioObject.getLabelProps()}>
            {radioObject.getObject().title}
          </label>
          {radioObject.getItems().map((value, index) => (
            <label
              {...radioObject.getItemLabelProps(index)}
              key={`${value}${index}`}
            >
              {value}
              <input {...radioObject.getItemInputProps(index)} />
            </label>
          ))}
        </>
      )
    }
    case InputTypes.select: {
      const selectObject = props.baseObject as UseSelectReturnType

      return (
        <>
          <label {...selectObject.getLabelProps()}>
            {selectObject.getObject().title}
          </label>
          <select {...selectObject.getSelectProps()}>
            {selectObject.getItems().map((value, index) => (
              <option
                {...selectObject.getItemOptionProps(index)}
                key={`${value}${index}`}
              >
                {value}
              </option>
            ))}
          </select>
        </>
      )
    }
  }
  return null
}

function ObjectRenderer(props: { pointer: string; UISchema?: UISchemaType }) {
  const methods = useObject({
    pointer: props.pointer,
    UISchema: props.UISchema,
  })

  return (
    <>
      {methods.map(obj => (
        <div key={`${obj.type}${obj.pointer}`}>
          <SpecializedObject baseObject={obj} />
          {obj.getError() && <p>This is an error!</p>}
        </div>
      ))}
    </>
  )
}

function save(_data: OnSubmitParameters['data']) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, 2000)
  })
}

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

function RenderMyJSONSchema() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <FormContext
      schema={personSchema}
      onSubmit={({ data }: OnSubmitParameters) => {
        dispatch({ type: 'START_SAVING' })
        save(data)
          .then(() => dispatch({ type: 'SUCCESS_SAVING' }))
          .catch(() => dispatch({ type: 'ERROR_SAVING' }))
      }}
    >
      <ObjectRenderer pointer="#" UISchema={uiSchema} />
      <input type="submit" />
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error saving!</p>}
      {state.success && <p>Saved succesfully!</p>}
    </FormContext>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<RenderMyJSONSchema />)
}
