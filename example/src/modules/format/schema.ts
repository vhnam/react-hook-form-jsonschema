import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/format.schema.json',
  title: 'Format validation',
  type: 'object',
  required: ['email', 'website', 'startDate', 'startTime', 'startsAt'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      title: 'Tier 1: Email',
      description: 'Must be a syntactically valid email address.',
      format: 'email',
      default: 'user@example.com',
    },
    website: {
      type: 'string',
      title: 'Tier 1: Website',
      description: 'Must be an absolute URI, such as https://example.com.',
      format: 'uri',
      default: 'https://example.com',
    },
    startDate: {
      type: 'string',
      title: 'Tier 1: Start Date',
      description: 'Must be a valid RFC 3339 full-date value.',
      format: 'date',
      default: '2026-05-20',
    },
    startTime: {
      type: 'string',
      title: 'Tier 1: Start Time',
      description:
        'Uses a native time input; browser-native local time values are accepted.',
      format: 'time',
      default: '09:30',
    },
    startsAt: {
      type: 'string',
      title: 'Tier 1: Starts At',
      description:
        'Uses a native datetime-local input; browser-native local date-time values are accepted.',
      format: 'date-time',
      default: '2026-05-20T09:30',
    },
    requestId: {
      type: 'string',
      title: 'Tier 2: Request ID',
      description: 'Must be a UUID string.',
      format: 'uuid',
      default: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    },
    serviceIp: {
      type: 'string',
      title: 'Tier 2: Service IP',
      description: 'Must be a valid IPv4 address.',
      format: 'ipv4',
      default: '192.168.0.1',
    },
    configPointer: {
      type: 'string',
      title: 'Tier 3: Config Pointer',
      description:
        'A JSON Pointer is validated but remains a regular text input.',
      format: 'json-pointer',
      default: '/settings/theme',
    },
  },
} satisfies ObjectJSONSchemaType
