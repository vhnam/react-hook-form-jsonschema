import { render, waitFor, fireEvent } from '@testing-library/react'

import { useTextArea } from '../useTextArea'
import { FormContext } from '../../components'
import mockTextAreaSchema from '../__mocks__/mockTextSchema'

const MockTextArea = (props: { pointer: string }) => {
  const methods = useTextArea(props.pointer)

  return (
    <>
      <label {...methods.getLabelProps()}>{methods.name}</label>
      <textarea {...methods.getTextAreaProps()} />
      {methods.getError() && <p>This is an error!</p>}
    </>
  )
}

test('should have string enum items', () => {
  const { getByText, container } = render(
    <FormContext schema={mockTextAreaSchema} onSubmit={() => {}}>
      <MockTextArea pointer="#/properties/stringTest" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  expect(container.querySelector('input')).toBeDefined()
  expect(container.querySelector('textarea')).toBeDefined()
  expect(getByText('stringTest')).toBeDefined()
})

test('should have all integers in interval', () => {
  const { getByText, container } = render(
    <FormContext schema={mockTextAreaSchema} onSubmit={() => {}}>
      <MockTextArea pointer="#/properties/integerTest" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  expect(container.querySelector('input')).toBeDefined()
  expect(container.querySelector('label')).toBeDefined()
  expect(getByText('integerTest')).toBeDefined()
})

test('should have all floats in interval, separated by step', () => {
  const { getByText, container } = render(
    <FormContext schema={mockTextAreaSchema}>
      <MockTextArea pointer="#/properties/numberTest" />
    </FormContext>
  )

  expect(container.querySelector('input')).toBeDefined()
  expect(container.querySelector('label')).toBeDefined()
  expect(getByText('numberTest')).toBeDefined()
})

test('should raise error', async () => {
  const { getByLabelText, getByText } = render(
    <FormContext schema={mockTextAreaSchema} onSubmit={() => {}}>
      <MockTextArea pointer="#/properties/errorTest" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  getByText('Submit').click()
  fireEvent.change(getByLabelText('errorTest'), { target: { value: 'a' } })

  await waitFor(() => {
    expect(getByText('This is an error!')).toBeDefined()
  })
})
