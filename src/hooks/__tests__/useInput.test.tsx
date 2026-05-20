import type { PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react'

import { FormContext } from '../../components'
import { useInput } from '../useInput'
import mockTextSchema from '../__mocks__/mockTextSchema'

const Wrapper = ({ children }: PropsWithChildren) => {
  return <FormContext schema={mockTextSchema}>{children}</FormContext>
}

test('useInput type date', () => {
  const { result } = renderHook(() => useInput('#/properties/stringDateTest'), {
    wrapper: Wrapper,
  })

  const { type } = result.current.getInputProps()

  expect(type).toBe('date')
})

test('useInput type date-time', () => {
  const { result } = renderHook(
    () => useInput('#/properties/stringDateTimeTest'),
    {
      wrapper: Wrapper,
    }
  )

  const { type } = result.current.getInputProps()

  expect(type).toBe('datetime-local')
})

test('useInput type email', () => {
  const { result } = renderHook(
    () => useInput('#/properties/stringEmailTest'),
    {
      wrapper: Wrapper,
    }
  )

  const { type } = result.current.getInputProps()

  expect(type).toBe('email')
})

test('useInput type time', () => {
  const { result } = renderHook(() => useInput('#/properties/stringTimeTest'), {
    wrapper: Wrapper,
  })

  const { type } = result.current.getInputProps()

  expect(type).toBe('time')
})

test.each([
  ['hostname', '#/properties/stringHostnameTest'],
  ['uuid', '#/properties/stringUuidTest'],
  ['ipv4', '#/properties/stringIpv4Test'],
  ['json-pointer', '#/properties/stringJsonPointerTest'],
])('useInput leaves %s format as text input', (_, pointer) => {
  const { result } = renderHook(() => useInput(pointer), {
    wrapper: Wrapper,
  })

  const { type } = result.current.getInputProps()

  expect(type).toBe('text')
})

test('useInput type uri', () => {
  const { result } = renderHook(() => useInput('#/properties/stringUriTest'), {
    wrapper: Wrapper,
  })

  const { type } = result.current.getInputProps()

  expect(type).toBe('url')
})
