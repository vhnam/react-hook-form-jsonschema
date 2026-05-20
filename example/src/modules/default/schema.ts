import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/default.schema.json',
  title: 'Default values',
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      title: 'Display Name',
      description: 'Clear this default value and submit to see validation.',
      default: 'Demo user',
      minLength: 3,
    },
    plan: {
      type: 'string',
      title: 'Plan',
      enum: ['free', 'team', 'enterprise'],
      default: 'team',
    },
    seats: {
      type: 'integer',
      title: 'Seats',
      minimum: 1,
      maximum: 25,
      default: 5,
    },
    channels: {
      type: 'array',
      title: 'Notification Channels',
      uniqueItems: true,
      default: ['email', 'push'],
      items: {
        type: 'string',
        enum: ['email', 'sms', 'push'],
      },
    },
    profile: {
      type: 'object',
      title: 'Profile',
      default: {
        timezone: 'UTC',
        weeklyDigest: true,
      },
      properties: {
        timezone: {
          type: 'string',
          title: 'Timezone',
          enum: ['UTC', 'America/New_York', 'Asia/Ho_Chi_Minh'],
        },
        weeklyDigest: {
          type: 'boolean',
          title: 'Weekly Digest',
        },
      },
    },
  },
} satisfies ObjectJSONSchemaType
