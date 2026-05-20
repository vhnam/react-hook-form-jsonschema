import { fireEvent, render, waitFor } from '@testing-library/react'
import { Controller } from 'react-hook-form'

import { useObject } from '../../hooks/useObject'
import { useInput } from '../../hooks/useInput'
import mockSchema from '../__mocks__/mockFormSchema'
import { FormContext } from '../FormContext'

const ObjectRenderer = (props: { pointer: string }) => {
  const fields = useObject({ pointer: props.pointer })

  return (
    <>
      {fields.map((field) => {
        const fieldJsonSchema = field.getObject()

        return (
          <Controller
            control={field.formContext.control}
            defaultValue=""
            key={field.pointer}
            name={field.pointer}
            render={({ field: controllerField }) => (
              <input aria-label={fieldJsonSchema.title} {...controllerField} />
            )}
          />
        )
      })}
    </>
  )
}

const InputRenderer = (props: { label: string; pointer: string }) => {
  const field = useInput(props.pointer)

  return <input aria-label={props.label} {...field.getInputProps()} />
}

test('should call onChange when something changes', () => {
  const changeHandlerMock = jest.fn()

  const { getByLabelText } = render(
    <FormContext onChange={changeHandlerMock} schema={mockSchema}>
      <ObjectRenderer pointer="#" />
    </FormContext>
  )

  expect(changeHandlerMock).toHaveBeenCalledTimes(0)

  let changeValue: Record<string, string> = {}

  Object.entries(mockSchema.properties).forEach(
    ([fieldName, fieldProperties], index) => {
      const fieldNumber = index + 1

      const inputElement = getByLabelText(fieldProperties.title)

      const fieldNewValue = `new value for field ${fieldNumber}`

      fireEvent.change(inputElement, {
        target: { value: fieldNewValue },
      })

      expect(changeHandlerMock).toHaveBeenCalledTimes(fieldNumber)

      changeValue = { ...changeValue, [fieldName]: fieldNewValue }

      const expectedValues = Object.keys(mockSchema.properties).reduce(
        (acc, key) => {
          acc[key] = changeValue[key] ?? ''
          return acc
        },
        {} as Record<string, string>
      )

      expect(changeHandlerMock).toHaveBeenLastCalledWith(expectedValues)
    }
  )
})

test('should submit schema default values automatically', async () => {
  const submitHandlerMock = jest.fn()
  const schemaWithDefaults = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Jane',
      },
      age: {
        type: 'integer',
        default: 32,
      },
    },
  }

  const { getByText } = render(
    <FormContext schema={schemaWithDefaults} onSubmit={submitHandlerMock}>
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <InputRenderer label="Age" pointer="#/properties/age" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          age: 32,
          firstName: 'Jane',
        },
      })
    )
  )
})

test('should let form default values override schema defaults', async () => {
  const submitHandlerMock = jest.fn()
  const schemaWithDefaults = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Jane',
      },
    },
  }

  const { getByText } = render(
    <FormContext
      defaultValues={{ '#/properties/firstName': 'Grace' }}
      schema={schemaWithDefaults}
      onSubmit={submitHandlerMock}
    >
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          firstName: 'Grace',
        },
      })
    )
  )
})

test('should reset values when schema defaults change on rerender', async () => {
  const submitHandlerMock = jest.fn()
  const firstSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Jane',
      },
    },
  }
  const secondSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Ada',
      },
    },
  }

  const { getByText, getByLabelText, rerender } = render(
    <FormContext schema={firstSchema} onSubmit={submitHandlerMock}>
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  rerender(
    <FormContext schema={secondSchema} onSubmit={submitHandlerMock}>
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  await waitFor(() =>
    expect((getByLabelText('First name') as HTMLInputElement).value).toBe('Ada')
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          firstName: 'Ada',
        },
      })
    )
  )
})

test('should reset values when defaultValues change on rerender', async () => {
  const submitHandlerMock = jest.fn()
  const schema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Jane',
      },
    },
  }

  const { getByText, getByLabelText, rerender } = render(
    <FormContext
      defaultValues={{ '#/properties/firstName': 'Grace' }}
      schema={schema}
      onSubmit={submitHandlerMock}
    >
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  rerender(
    <FormContext
      defaultValues={{ '#/properties/firstName': 'Ada' }}
      schema={schema}
      onSubmit={submitHandlerMock}
    >
      <InputRenderer label="First name" pointer="#/properties/firstName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  await waitFor(() =>
    expect((getByLabelText('First name') as HTMLInputElement).value).toBe('Ada')
  )

  fireEvent.click(getByText('Submit'))

  await waitFor(() =>
    expect(submitHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          firstName: 'Ada',
        },
      })
    )
  )
})
