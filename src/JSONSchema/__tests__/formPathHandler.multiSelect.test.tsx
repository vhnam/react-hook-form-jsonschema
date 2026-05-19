import { render, waitFor } from '@testing-library/react'

import { FormContext } from '../../components'
import { useCheckbox } from '../../hooks/useCheckbox'

const options = ['reading', 'gaming', 'cooking', 'sports']

const MockCheckbox = ({ pointer }: { pointer: string }) => {
  const methods = useCheckbox(pointer)

  return (
    <>
      {methods.getItems().map((value, index) => (
        <label key={value} htmlFor={methods.getItemInputProps(index).id}>
          {value}
          <input {...methods.getItemInputProps(index)} />
        </label>
      ))}
    </>
  )
}

test('submitted multi-select compacts when uniqueItems is true', async () => {
  let submitted: unknown

  const { getByLabelText, getByText } = render(
    <FormContext
      schema={{
        type: 'object',
        properties: {
          hobbies: {
            type: 'array',
            uniqueItems: true,
            items: { type: 'string', enum: options },
          },
        },
      }}
      onSubmit={({ data }) => {
        submitted = data
      }}
    >
      <MockCheckbox pointer="#/properties/hobbies" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  getByLabelText('gaming').click()
  getByLabelText('cooking').click()
  getByText('Submit').click()

  await waitFor(() => {
    expect(submitted).toEqual({
      hobbies: ['gaming', 'cooking'],
    })
  })
})

test('submitted multi-select keeps positional slots when uniqueItems is false', async () => {
  let submitted: unknown

  const { getByLabelText, getByText } = render(
    <FormContext
      schema={{
        type: 'object',
        properties: {
          hobbies: {
            type: 'array',
            uniqueItems: false,
            items: { type: 'string', enum: options },
          },
        },
      }}
      onSubmit={({ data }) => {
        submitted = data
      }}
    >
      <MockCheckbox pointer="#/properties/hobbies" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  getByLabelText('gaming').click()
  getByLabelText('cooking').click()
  getByText('Submit').click()

  await waitFor(() => {
    expect(submitted).toEqual({
      hobbies: [false, 'gaming', 'cooking', false],
    })
  })
})
