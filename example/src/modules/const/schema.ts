import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/const.schema.json',
  title: 'Const',
  type: 'object',
  required: ['environment', 'releaseChannel', 'buildNumber', 'signedRelease'],
  properties: {
    environment: {
      type: 'string',
      title: 'Environment',
      description:
        'This field must always submit the exact value "production".',
      const: 'production',
    },
    releaseChannel: {
      type: 'string',
      title: 'Release Channel',
      description:
        'The enum controls the available options; const restricts the valid value to stable.',
      enum: ['stable', 'beta', 'canary'],
      const: 'stable',
    },
    buildNumber: {
      type: 'integer',
      title: 'Build Number',
      description: 'Numeric const values are compared after form coercion.',
      const: 42,
    },
    signedRelease: {
      type: 'boolean',
      title: 'Signed Release',
      description: 'The checkbox must remain checked to match const: true.',
      const: true,
    },
  },
} satisfies ObjectJSONSchemaType
