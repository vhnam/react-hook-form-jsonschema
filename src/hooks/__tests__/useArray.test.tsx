import { render, waitFor, fireEvent } from '@testing-library/react'

import { useArray } from '../useArray'
import { FormContext } from '../../components'

const tagsSchema = {
  type: 'object',
  required: ['tags'],
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'string',
        minLength: 2,
      },
    },
  },
}

const tagsSchemaNoMin = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: { type: 'string' },
    },
  },
}

const MockTagsArray = () => {
  const methods = useArray('#/properties/tags')

  return (
    <>
      <p>{methods.getObject().title}</p>
      {methods.getFields().map((field, index) => (
        <div key={field.id}>
          <input
            {...methods.getItemInputProps(index)}
            aria-label={`tag-${index}`}
          />
          {methods.canRemove(index) && (
            <button type="button" onClick={() => methods.removeItem(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      {methods.canAdd() && (
        <button type="button" onClick={() => methods.appendItem()}>
          Add tag
        </button>
      )}
      {methods.getError() && <p>Array error</p>}
    </>
  )
}

test('appends items and submits string array', async () => {
  let submitted: { tags?: string[] } = {}

  const { getByText, getByLabelText } = render(
    <FormContext
      schema={tagsSchemaNoMin}
      onSubmit={({ data }) => {
        submitted = data as { tags?: string[] }
      }}
    >
      <MockTagsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Add tag'))
  await waitFor(() => expect(getByLabelText('tag-0')).toBeDefined())
  fireEvent.change(getByLabelText('tag-0'), { target: { value: 'react' } })
  fireEvent.click(getByText('Submit'))

  await waitFor(() => expect(submitted.tags).toEqual(['react']))
})

test('shows minItems error when empty', async () => {
  const { getByText } = render(
    <FormContext schema={tagsSchema} onSubmit={() => {}}>
      <MockTagsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() => expect(getByText('Array error')).toBeDefined())
})

test('respects maxItems when adding', async () => {
  const { getByText, queryByText } = render(
    <FormContext schema={tagsSchema} onSubmit={() => {}}>
      <MockTagsArray />
    </FormContext>
  )

  fireEvent.click(getByText('Add tag'))
  fireEvent.click(getByText('Add tag'))
  await waitFor(() => expect(queryByText('Add tag')).toBeNull())
})
