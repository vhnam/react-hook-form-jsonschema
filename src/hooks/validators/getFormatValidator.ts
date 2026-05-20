import { ErrorTypes } from '../../utils/errorTypes'

type FormatValidator = (value: string) => boolean
type FormatValidators = Record<string, FormatValidator>

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d|60)(?:\.\d+)?(?:[Zz]|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/
const LOCAL_TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d|60)(?:\.\d+)?)?$/
const DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})[Tt]([01]\d|2[0-3]):([0-5]\d):([0-5]\d|60)(?:\.\d+)?(?:[Zz]|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})[Tt]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d|60)(?:\.\d+)?)?$/
const DURATION_PATTERN =
  /^P(?=\d|T\d)(?:(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:[.,]\d+)?S)?)?|\d+W)$/
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const IPV4_PATTERN =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const ASCII_PATTERN = /^[\x00-\x7F]*$/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/
const WHITESPACE_PATTERN = /\s/u
const URI_CHARACTER_PATTERN =
  /^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/
const URI_PATTERN =
  /^[A-Za-z][A-Za-z0-9+.-]*:[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/
const IRI_REFERENCE_FORBIDDEN_PATTERN = /[\u0000-\u0020\u007F<>"\\^`{|}]/
const URI_TEMPLATE_FORBIDDEN_PATTERN = /[\u0000-\u0020\u007F<>"\\^`|]/
const IRI_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:/u
const INVALID_PERCENT_ENCODING_PATTERN = /%(?![0-9A-Fa-f]{2})/
const HOSTNAME_LABEL_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/
const IDN_HOSTNAME_LABEL_PATTERN =
  /^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u
const EMAIL_LOCAL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/
const JSON_POINTER_PATTERN = /^(?:\/(?:[^~]|~0|~1)*)*$/
const RELATIVE_JSON_POINTER_PATTERN =
  /^(?:0|[1-9]\d*)(?:#|(?:\/(?:[^~]|~0|~1)*)*)$/
const THIRTY_DAY_MONTHS = new Set([4, 6, 9, 11])

const daysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28
  }

  return THIRTY_DAY_MONTHS.has(month) ? 30 : 31
}

const isValidDate = (value: string): boolean => {
  const match = DATE_PATTERN.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  )
}

const isValidDateTime = (value: string): boolean => {
  const match = DATE_TIME_PATTERN.exec(value)

  if (match) {
    return isValidDate(match[1])
  }

  const localMatch = LOCAL_DATE_TIME_PATTERN.exec(value)

  return localMatch ? isValidDate(localMatch[1]) : false
}

const isValidTime = (value: string): boolean => {
  return TIME_PATTERN.test(value) || LOCAL_TIME_PATTERN.test(value)
}

const hasValidPercentEncoding = (value: string): boolean => {
  return !INVALID_PERCENT_ENCODING_PATTERN.test(value)
}

const hasUriReferenceSyntax = (value: string): boolean => {
  return URI_CHARACTER_PATTERN.test(value) && hasValidPercentEncoding(value)
}

const isValidUri = (value: string): boolean => {
  if (!URI_PATTERN.test(value) || !hasValidPercentEncoding(value)) {
    return false
  }

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const isValidUriReference = (value: string): boolean => {
  if (!hasUriReferenceSyntax(value)) {
    return false
  }

  try {
    new URL(value, 'https://example.invalid/')
    return true
  } catch {
    return false
  }
}

const isValidIri = (value: string): boolean => {
  if (!IRI_PATTERN.test(value) || IRI_REFERENCE_FORBIDDEN_PATTERN.test(value)) {
    return false
  }

  return hasValidPercentEncoding(value)
}

const isValidIriReference = (value: string): boolean => {
  return (
    !IRI_REFERENCE_FORBIDDEN_PATTERN.test(value) &&
    hasValidPercentEncoding(value)
  )
}

const getHostnameLabels = (value: string): string[] | undefined => {
  const hostname = value.endsWith('.') ? value.slice(0, -1) : value

  if (!hostname || hostname.length > 253) {
    return undefined
  }

  const labels = hostname.split('.')

  return labels.every((label) => label.length > 0 && label.length <= 63)
    ? labels
    : undefined
}

const isValidHostname = (value: string): boolean => {
  const labels = getHostnameLabels(value)

  return labels
    ? labels.every((label) => HOSTNAME_LABEL_PATTERN.test(label))
    : false
}

const isValidIdnHostname = (value: string): boolean => {
  const labels = getHostnameLabels(value)

  return labels
    ? labels.every((label) => IDN_HOSTNAME_LABEL_PATTERN.test(label))
    : false
}

const isValidIpv6 = (value: string): boolean => {
  try {
    new URL(`http://[${value}]/`)
    return true
  } catch {
    return false
  }
}

const isValidEmailDomain = (value: string, allowIdn: boolean): boolean => {
  if (value.startsWith('[') && value.endsWith(']')) {
    const address = value.slice(1, -1)

    return address.startsWith('IPv6:')
      ? isValidIpv6(address.slice(5))
      : IPV4_PATTERN.test(address)
  }

  return allowIdn ? isValidIdnHostname(value) : isValidHostname(value)
}

const isValidEmail = (value: string, allowIdn: boolean): boolean => {
  if (
    !value ||
    CONTROL_CHARACTER_PATTERN.test(value) ||
    (!allowIdn && !ASCII_PATTERN.test(value))
  ) {
    return false
  }

  const atIndex = value.indexOf('@')

  if (
    atIndex <= 0 ||
    atIndex !== value.lastIndexOf('@') ||
    atIndex === value.length - 1
  ) {
    return false
  }

  const localPart = value.slice(0, atIndex)
  const domain = value.slice(atIndex + 1)
  const validLocalPart = allowIdn
    ? !WHITESPACE_PATTERN.test(localPart)
    : EMAIL_LOCAL_PATTERN.test(localPart)

  return validLocalPart && isValidEmailDomain(domain, allowIdn)
}

const isValidUriTemplate = (value: string): boolean => {
  if (URI_TEMPLATE_FORBIDDEN_PATTERN.test(value)) {
    return false
  }

  let isExpression = false
  let expressionLength = 0

  for (const char of value) {
    if (char === '{') {
      if (isExpression) {
        return false
      }

      isExpression = true
      expressionLength = 0
    } else if (char === '}') {
      if (!isExpression || expressionLength === 0) {
        return false
      }

      isExpression = false
    } else if (isExpression) {
      expressionLength += 1
    }
  }

  return !isExpression
}

const isValidRegex = (value: string): boolean => {
  try {
    new RegExp(value)
    return true
  } catch {
    return false
  }
}

const formatValidators = {
  'date-time': isValidDateTime,
  date: isValidDate,
  time: isValidTime,
  duration: (value) => DURATION_PATTERN.test(value),
  email: (value) => isValidEmail(value, false),
  'idn-email': (value) => isValidEmail(value, true),
  hostname: isValidHostname,
  'idn-hostname': isValidIdnHostname,
  ipv4: (value) => IPV4_PATTERN.test(value),
  ipv6: isValidIpv6,
  uri: isValidUri,
  'uri-reference': isValidUriReference,
  iri: isValidIri,
  'iri-reference': isValidIriReference,
  uuid: (value) => UUID_PATTERN.test(value),
  'uri-template': isValidUriTemplate,
  'json-pointer': (value) => JSON_POINTER_PATTERN.test(value),
  'relative-json-pointer': (value) => RELATIVE_JSON_POINTER_PATTERN.test(value),
  regex: isValidRegex,
} satisfies FormatValidators

export type SupportedStringFormat = keyof typeof formatValidators

export const isSupportedFormat = (
  format: string
): format is SupportedStringFormat => {
  return Object.prototype.hasOwnProperty.call(formatValidators, format)
}

export const getFormatValidationResult = (
  value: unknown,
  format: string
): true | ErrorTypes.format => {
  if (typeof value !== 'string') {
    return true
  }

  if (!isSupportedFormat(format)) {
    return true
  }

  return formatValidators[format](value) ? true : ErrorTypes.format
}
