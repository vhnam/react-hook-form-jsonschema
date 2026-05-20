import { render, waitFor, fireEvent } from '@testing-library/react'

import { useArray } from '../useArray'
import { useObject } from '../useObject'
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

const tagsSchemaWithItemDefault = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: { type: 'string', default: 'draft' },
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

test('submits with required tags schema when indexed items are filled', async () => {
  let submitted: { tags?: string[] } = {}

  const { getByText, getByLabelText } = render(
    <FormContext
      schema={tagsSchema}
      onSubmit={({ data }) => {
        submitted = data as { tags?: string[] }
      }}
    >
      <MockTagsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('tag-0'), { target: { value: 'react' } })
  fireEvent.click(getByText('Submit'))

  await waitFor(() => expect(submitted.tags).toEqual(['react']))
})

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

test('appends items with item schema default values', async () => {
  let submitted: { tags?: string[] } = {}

  const { getByText, getByLabelText } = render(
    <FormContext
      schema={tagsSchemaWithItemDefault}
      onSubmit={({ data }) => {
        submitted = data as { tags?: string[] }
      }}
    >
      <MockTagsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Add tag'))

  await waitFor(() => {
    expect((getByLabelText('tag-0') as HTMLInputElement).value).toBe('draft')
  })

  fireEvent.click(getByText('Submit'))

  await waitFor(() => expect(submitted.tags).toEqual(['draft']))
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

const tupleCoordsSchema = {
  type: 'object',
  properties: {
    coords: {
      type: 'array',
      title: 'Coordinates',
      items: [
        { type: 'integer', title: 'Latitude' },
        { type: 'integer', title: 'Longitude' },
      ],
    },
  },
}

const MockTupleArray = () => {
  const methods = useArray('#/properties/coords')

  return (
    <>
      {methods.getFields().map((field, index) => {
        const itemSchema = methods.getItemSchema(index)

        return (
          <div key={field.id}>
            <span>{itemSchema?.title ?? `Index ${index}`}</span>
            <input
              {...methods.getItemInputProps(index)}
              aria-label={`coord-${index}`}
            />
          </div>
        )
      })}
    </>
  )
}

test('renders all tuple item slots on mount', () => {
  const { getByText, getByLabelText } = render(
    <FormContext schema={tupleCoordsSchema} onSubmit={() => {}}>
      <MockTupleArray />
    </FormContext>
  )

  expect(getByText('Latitude')).toBeDefined()
  expect(getByText('Longitude')).toBeDefined()
  expect(getByLabelText('coord-0')).toBeDefined()
  expect(getByLabelText('coord-1')).toBeDefined()
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

const contactsSchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: 'Contacts',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' },
        },
      },
    },
  },
}

const contactsSchemaWithDefault = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: 'Contacts',
      default: [{ name: 'Ada', email: 'ada@example.com' }],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' },
        },
      },
    },
  },
}

const contactsSchemaMaxOneWithOneDefault = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: 'Contacts',
      maxItems: 1,
      default: [{ name: 'Ada', email: 'ada@example.com' }],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' },
        },
      },
    },
  },
}

const ContactFields = (props: { index: number; pointer: string }) => {
  const fields = useObject({ pointer: props.pointer })

  return (
    <>
      {fields.map((field) => {
        if (!('getInputProps' in field)) {
          return null
        }

        return (
          <input
            aria-label={`${field.name}-${props.index}`}
            key={field.pointer}
            {...field.getInputProps()}
          />
        )
      })}
    </>
  )
}

const MockContactsArray = () => {
  const methods = useArray('#/properties/contacts')

  return (
    <>
      {methods.getFields().map((field, index) => (
        <div data-testid="contact-row" key={field.id}>
          <ContactFields index={index} pointer={methods.getItemPointer(index)} />
          {methods.canRemove(index) && (
            <button type="button" onClick={() => methods.removeItem(index)}>
              Remove contact {index}
            </button>
          )}
        </div>
      ))}
      {methods.canAdd() && (
        <button type="button" onClick={() => methods.appendItem()}>
          Add contact
        </button>
      )}
      {methods.getError() && <p>Contacts array error</p>}
    </>
  )
}

test('renders one object-array row for defaults with multiple child fields', () => {
  const { getAllByTestId, getByLabelText } = render(
    <FormContext schema={contactsSchemaWithDefault}>
      <MockContactsArray />
    </FormContext>
  )

  expect(getAllByTestId('contact-row')).toHaveLength(1)
  expect((getByLabelText('name-0') as HTMLInputElement).value).toBe('Ada')
  expect((getByLabelText('email-0') as HTMLInputElement).value).toBe(
    'ada@example.com'
  )
})

test('appends and removes object-array rows without leaving stale child fields', async () => {
  let submitted: { contacts?: Array<{ name?: string; email?: string }> } = {}

  const { getByText, getByLabelText, queryByLabelText } = render(
    <FormContext
      schema={contactsSchema}
      onSubmit={({ data }) => {
        submitted = data as {
          contacts?: Array<{ name?: string; email?: string }>
        }
      }}
    >
      <MockContactsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('name-0'), { target: { value: 'Ada' } })
  fireEvent.change(getByLabelText('email-0'), {
    target: { value: 'ada@example.com' },
  })
  fireEvent.click(getByText('Add contact'))

  await waitFor(() => expect(getByLabelText('name-1')).toBeDefined())

  fireEvent.change(getByLabelText('name-1'), { target: { value: 'Grace' } })
  fireEvent.change(getByLabelText('email-1'), {
    target: { value: 'grace@example.com' },
  })
  fireEvent.click(getByText('Remove contact 0'))

  await waitFor(() => expect(queryByLabelText('name-1')).toBeNull())
  expect((getByLabelText('name-0') as HTMLInputElement).value).toBe('Grace')
  expect((getByLabelText('email-0') as HTMLInputElement).value).toBe(
    'grace@example.com'
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitted.contacts).toEqual([
      { email: 'grace@example.com', name: 'Grace' },
    ])
  )
})

test('checks array constraints using object item count, not child field count', async () => {
  let submitted: { contacts?: Array<{ name?: string; email?: string }> } = {}
  const { getByText, queryByText } = render(
    <FormContext
      schema={contactsSchemaMaxOneWithOneDefault}
      onSubmit={({ data }) => {
        submitted = data as {
          contacts?: Array<{ name?: string; email?: string }>
        }
      }}
    >
      <MockContactsArray />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitted.contacts).toEqual([
      { email: 'ada@example.com', name: 'Ada' },
    ])
  )
  expect(queryByText('Contacts array error')).toBeNull()
})
