import { render, waitFor, fireEvent } from '@testing-library/react'

import { useInput } from '../../useInput'
import { FormContext } from '../../../components'
import { ErrorTypes } from '../types'
import mockSchema from '../../__mocks__/mockSchema'

const MockInput = (props: { path: string }) => {
  const methods = useInput(props.path)
  const error = methods.getError()

  return (
    <>
      <label {...methods.getLabelProps()}>
        {methods.getObject().title}
        <input {...methods.getInputProps()} />
      </label>
      {error && (
        <p>
          This is an error:{' '}
          {`${error.message}:${error.expected?.toString() ?? ''}`}
        </p>
      )}
    </>
  )
}

test('should raise error when writing value not in enum', async () => {
  const { getByText, getByLabelText } = render(
    <FormContext schema={mockSchema} onSubmit={() => {}}>
      <MockInput path="#/properties/stringTest" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('test-useSelectString'), {
    target: { value: 'some value not in the enum' },
  })
  getByText('Submit').click()

  await waitFor(() =>
    expect(
      getByText(
        `This is an error: ${ErrorTypes.notInEnum}:this,tests,the,useSelect,hook`
      )
    ).toBeDefined()
  )
})

test('should raise minLength error for an empty optional string', async () => {
  const schema = {
    type: 'object',
    properties: {
      displayName: {
        type: 'string',
        title: 'Display Name',
        default: 'Demo user',
        minLength: 1,
      },
    },
  }

  const { getByText, getByLabelText } = render(
    <FormContext schema={schema} onSubmit={() => {}}>
      <MockInput path="#/properties/displayName" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('Display Name'), {
    target: { value: '' },
  })
  getByText('Submit').click()

  await waitFor(() =>
    expect(
      getByText(`This is an error: ${ErrorTypes.minLength}:1`)
    ).toBeDefined()
  )
})

test('should raise maxLength error for a maxLength zero string', async () => {
  const schema = {
    type: 'object',
    properties: {
      emptyOnly: {
        type: 'string',
        title: 'Empty Only',
        maxLength: 0,
      },
    },
  }

  const { getByText, getByLabelText } = render(
    <FormContext schema={schema} onSubmit={() => {}} noNativeValidate>
      <MockInput path="#/properties/emptyOnly" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  fireEvent.change(getByLabelText('Empty Only'), {
    target: { value: 'x' },
  })
  getByText('Submit').click()

  await waitFor(() =>
    expect(
      getByText(`This is an error: ${ErrorTypes.maxLength}:0`)
    ).toBeDefined()
  )
})

describe('testing integer boundaries', () => {
  it('should raise error for maximum', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/integerTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectInteger'), {
      target: { value: 12 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.maxValue}:6`)
      ).toBeDefined()
    )
  })

  it('should raise error for minimum', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/integerTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectInteger'), {
      target: { value: -12 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.minValue}:0`)
      ).toBeDefined()
    )
  })

  it('should raise error for multipleOf', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/integerTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectInteger'), {
      target: { value: 5 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.multipleOf}:2`)
      ).toBeDefined()
    )
  })

  it('should raise error for notInteger', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/integerTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectInteger'), {
      target: { value: 2.2 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.notInteger}:`)
      ).toBeDefined()
    )
  })
})

describe('testing float boundaries', () => {
  it('should submit integer-looking number values', async () => {
    const submitHandlerMock = jest.fn()
    const { getByText, getByLabelText } = render(
      <FormContext
        schema={mockSchema}
        onSubmit={submitHandlerMock}
        noNativeValidate
      >
        <MockInput path="#/properties/numberTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectNumber'), {
      target: { value: 0 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(submitHandlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numberTest: 0 }),
        })
      )
    )
  })

  it('should raise multipleOf error for decimal numbers', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/numberTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectNumber'), {
      target: { value: 0.15 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.multipleOf}:0.1`)
      ).toBeDefined()
    )
  })

  it('should raise error for maximum', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/numberTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectNumber'), {
      target: { value: 12 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.maxValue}:0.5`)
      ).toBeDefined()
    )
  })

  it('should raise error for minimum', async () => {
    const { getByText, getByLabelText } = render(
      <FormContext schema={mockSchema} onSubmit={() => {}} noNativeValidate>
        <MockInput path="#/properties/numberTest" />
        <input type="submit" value="Submit" />
      </FormContext>
    )

    fireEvent.change(getByLabelText('test-useSelectNumber'), {
      target: { value: -12 },
    })
    getByText('Submit').click()

    await waitFor(() =>
      expect(
        getByText(`This is an error: ${ErrorTypes.minValue}:0`)
      ).toBeDefined()
    )
  })
})

test('should raise required error', async () => {
  const { getByText } = render(
    <FormContext schema={mockSchema} onSubmit={() => {}}>
      <MockInput path="#/properties/errorTest" />
      <input type="submit" value="Submit" />
    </FormContext>
  )

  getByText('Submit').click()

  await waitFor(() =>
    expect(
      getByText(`This is an error: ${ErrorTypes.required}:true`)
    ).toBeDefined()
  )
})
