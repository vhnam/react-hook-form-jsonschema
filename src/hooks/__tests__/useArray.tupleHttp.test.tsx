import { render, waitFor, fireEvent } from '@testing-library/react'

import { useArray } from '../useArray'
import { useObject } from '../useObject'
import { FormContext } from '../../components'

const httpResponseSchema = {
  type: 'object',
  properties: {
    response: {
      type: 'array',
      title: 'HTTP Response',
      additionalItems: false,
      items: [
        {
          type: 'integer',
          title: 'Status code',
          minimum: 100,
          maximum: 599,
        },
        {
          type: 'string',
          title: 'Content-Type',
          enum: ['application/json', 'text/html', 'text/plain'],
        },
        {
          type: 'object',
          title: 'Body',
          properties: {
            data: { type: 'string', title: 'Data' },
            error: { type: 'string', title: 'Error' },
          },
        },
      ],
    },
  },
}

const BodyFields = ({ pointer }: { pointer: string }) => {
  const fields = useObject({ pointer })

  return (
    <>
      {fields.map((field) => {
        if (field.type !== 'input') {
          return null
        }

        const input = field as {
          getInputProps: () => object
          pointer: string
        }

        return <input key={field.pointer} {...input.getInputProps()} />
      })}
    </>
  )
}

const MockHttpTuple = () => {
  const array = useArray('#/properties/response')

  return (
    <>
      {array.getFields().map((row, index) => (
        <div key={row.id}>
          {array.isPrimitiveItem(index) ? (
            <input
              {...array.getItemInputProps(index)}
              aria-label={`slot-${index}`}
            />
          ) : (
            <BodyFields pointer={array.getItemPointer(index)} />
          )}
        </div>
      ))}
    </>
  )
}

test('submits filled HTTP tuple', async () => {
  let submitted: unknown = null

  const { getByLabelText, getByText } = render(
    <FormContext
      schema={httpResponseSchema}
      onSubmit={({ data }) => {
        submitted = data
      }}
    >
      <MockHttpTuple />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('slot-0'), { target: { value: '200' } })
  fireEvent.change(getByLabelText('slot-1'), { target: { value: 'text/plain' } })
  fireEvent.change(
    document.querySelector('input[name="#/properties/response/2/properties/data"]')!,
    { target: { value: 'keo 502' } }
  )
  fireEvent.change(
    document.querySelector('input[name="#/properties/response/2/properties/error"]')!,
    { target: { value: 'invalid' } }
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() => expect(submitted).not.toBeNull())

  expect(submitted).toEqual({
    response: [200, 'text/plain', { data: 'keo 502', error: 'invalid' }],
  })
})
