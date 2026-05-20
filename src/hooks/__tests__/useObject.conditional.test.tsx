import { fireEvent, render, waitFor } from '@testing-library/react'

import { FormContext } from '../../components'
import { useObject } from '../useObject'
import type { UseRawInputReturnType } from '../types'

const conditionalSchema = {
  type: 'object',
  properties: {
    employmentStatus: {
      type: 'string',
      title: 'Employment status',
    },
    companyName: {
      type: 'string',
      title: 'Company name',
      'x-hidden': true,
    },
  },
  if: {
    properties: {
      employmentStatus: { const: 'employed' },
    },
    required: ['employmentStatus'],
  },
  then: {
    properties: {
      companyName: { 'x-hidden': false },
    },
    required: ['companyName'],
  },
}

const hasInputProps = (
  input: ReturnType<typeof useObject>[number]
): input is UseRawInputReturnType => {
  return 'getInputProps' in input
}

const ConditionalForm = () => {
  const inputs = useObject({ pointer: '#' })

  return (
    <>
      {inputs.map((input) => {
        if (!hasInputProps(input)) {
          return <p key={input.pointer}>{input.name}</p>
        }

        return (
          <label key={input.pointer} {...input.getLabelProps()}>
            {input.getObject().title ?? input.name}
            <input {...input.getInputProps()} />
          </label>
        )
      })}
    </>
  )
}

test('reactively shows conditional fields when their trigger matches', async () => {
  const { getByLabelText, queryByLabelText } = render(
    <FormContext schema={conditionalSchema}>
      <ConditionalForm />
    </FormContext>
  )

  expect(queryByLabelText('Company name')).toBeNull()

  fireEvent.change(getByLabelText('Employment status'), {
    target: { value: 'employed' },
  })

  await waitFor(() => {
    expect(getByLabelText('Company name')).toBeDefined()
  })
})
