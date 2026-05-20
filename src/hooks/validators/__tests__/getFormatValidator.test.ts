import {
  getFormatValidationResult,
  isSupportedFormat,
} from '../getFormatValidator'
import type { SupportedStringFormat } from '../getFormatValidator'
import { ErrorTypes } from '../../../utils/errorTypes'

describe('getFormatValidationResult', () => {
  const validValues: Array<[SupportedStringFormat, string]> = [
    ['date-time', '2020-02-29T23:59:59Z'],
    ['date-time', '2020-02-29T23:59'],
    ['date', '2020-02-29'],
    ['time', '23:59:59Z'],
    ['time', '23:59'],
    ['duration', 'P1Y2M3DT4H5M6S'],
    ['email', 'user@example.com'],
    ['idn-email', '用户@例え.テスト'],
    ['hostname', 'example.com'],
    ['idn-hostname', '例え.テスト'],
    ['ipv4', '192.168.0.1'],
    ['ipv6', '2001:db8::1'],
    ['uri', 'https://example.com/path?query=value#fragment'],
    ['uri-reference', '../path?query=value#fragment'],
    ['iri', 'https://例え.テスト/パス'],
    ['iri-reference', '../パス?query=value#fragment'],
    ['uuid', 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'],
    ['uri-template', 'https://example.com/{id}'],
    ['uri-template', ''],
    ['json-pointer', '/foo/0/bar~1baz'],
    ['relative-json-pointer', '1/foo/0'],
    ['regex', '^[a-z]+$'],
  ]

  const invalidValues: Array<[SupportedStringFormat, string]> = [
    ['date-time', '2021-02-29T23:59:59Z'],
    ['date', '2021-02-29'],
    ['time', '24:00:00Z'],
    ['duration', 'P'],
    ['email', 'user.example.com'],
    ['idn-email', '用户例え.テスト'],
    ['hostname', '-example.com'],
    ['idn-hostname', '-例え.テスト'],
    ['ipv4', '256.168.0.1'],
    ['ipv6', '2001:::1'],
    ['uri', '../path'],
    ['uri-reference', 'https://example.com/%zz'],
    ['iri', '../パス'],
    ['iri-reference', 'relative path'],
    ['uuid', 'f81d4fae-7dec-11d0-a765'],
    ['uri-template', 'https://example.com/{id'],
    ['json-pointer', '/foo/~2'],
    ['relative-json-pointer', '01/foo'],
    ['regex', '[a-z'],
  ]

  test.each(validValues)('accepts valid %s values', (format, value) => {
    expect(isSupportedFormat(format)).toBe(true)
    expect(getFormatValidationResult(value, format)).toBe(true)
  })

  test.each(invalidValues)('rejects invalid %s values', (format, value) => {
    expect(isSupportedFormat(format)).toBe(true)
    expect(getFormatValidationResult(value, format)).toBe(ErrorTypes.format)
  })

  test('ignores unsupported formats and non-string values', () => {
    expect(isSupportedFormat('custom-format')).toBe(false)
    expect(getFormatValidationResult('invalid', 'custom-format')).toBe(true)
    expect(getFormatValidationResult(123, 'email')).toBe(true)
    expect(getFormatValidationResult(null, 'email')).toBe(true)
    expect(getFormatValidationResult(undefined, 'email')).toBe(true)
  })

  test('validates RFC 3339 date and time boundaries', () => {
    expect(getFormatValidationResult('2020-12-31', 'date')).toBe(true)
    expect(getFormatValidationResult('2020-04-31', 'date')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('2020-13-01', 'date')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('2021-02-29T23:59', 'date-time')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('2020-01-01T23:59:60+07:00', 'date-time')).toBe(
      true
    )
    expect(getFormatValidationResult('2020-01-01t23:59:59z', 'date-time')).toBe(
      true
    )
    expect(getFormatValidationResult('2020-01-01T23:59', 'date-time')).toBe(
      true
    )
    expect(getFormatValidationResult('23:59:60+07:00', 'time')).toBe(true)
    expect(getFormatValidationResult('23:59', 'time')).toBe(true)
    expect(getFormatValidationResult('24:00', 'time')).toBe(ErrorTypes.format)
    expect(getFormatValidationResult('23:59Z', 'time')).toBe(ErrorTypes.format)
  })

  test('distinguishes ASCII and internationalized email formats', () => {
    expect(getFormatValidationResult('user@[192.168.0.1]', 'email')).toBe(true)
    expect(getFormatValidationResult('user@[IPv6:2001:db8::1]', 'email')).toBe(
      true
    )
    expect(getFormatValidationResult('用户@example.com', 'email')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('user@example.com', 'idn-email')).toBe(true)
    expect(getFormatValidationResult('user name@example.com', 'idn-email')).toBe(
      ErrorTypes.format
    )
  })

  test('validates hostname label and length constraints', () => {
    const longLabel = 'a'.repeat(64)

    expect(getFormatValidationResult('example.com.', 'hostname')).toBe(true)
    expect(getFormatValidationResult('', 'hostname')).toBe(ErrorTypes.format)
    expect(getFormatValidationResult(`${longLabel}.com`, 'hostname')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('example..com', 'hostname')).toBe(
      ErrorTypes.format
    )
  })

  test('validates URI and IRI reference edge cases', () => {
    expect(getFormatValidationResult('mailto:user@example.com', 'uri')).toBe(true)
    expect(getFormatValidationResult('', 'uri-reference')).toBe(true)
    expect(getFormatValidationResult('', 'iri-reference')).toBe(true)
    expect(getFormatValidationResult('https://example.com/%20', 'uri')).toBe(true)
    expect(getFormatValidationResult('https://example.com/%zz', 'uri')).toBe(
      ErrorTypes.format
    )
    expect(getFormatValidationResult('https://example.com/a b', 'iri')).toBe(
      ErrorTypes.format
    )
  })

  test('validates JSON Pointer empty and escaped forms', () => {
    expect(getFormatValidationResult('', 'json-pointer')).toBe(true)
    expect(getFormatValidationResult('/~0/~1', 'json-pointer')).toBe(true)
    expect(getFormatValidationResult('0#', 'relative-json-pointer')).toBe(true)
    expect(getFormatValidationResult('1/', 'relative-json-pointer')).toBe(true)
    expect(getFormatValidationResult('1/~2', 'relative-json-pointer')).toBe(
      ErrorTypes.format
    )
  })
})
