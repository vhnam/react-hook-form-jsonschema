import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://example.com/conditional-draft-07.schema.json',
  title: 'Conditional fields — Draft-07',
  type: 'object',
  required: ['employmentStatus', 'receiptType'],
  additionalProperties: false,
  properties: {
    employmentStatus: {
      type: 'string',
      title: 'Employment status',
      description: 'Draft-07 supports value-based branches with if/then/else.',
      enum: ['employed', 'self_employed', 'unemployed'],
    },
    companyName: {
      type: 'string',
      title: 'Company name',
      description: 'Shown and required when employment status is employed.',
      'x-hidden': true,
    },
    abnNumber: {
      type: 'string',
      title: 'ABN number',
      description: 'Shown and required when employment status is self-employed.',
      pattern: '^\\d{11}$',
      'x-hidden': true,
    },
    receiptType: {
      type: 'string',
      title: 'Receipt type',
      description: 'Invoice reveals an invoice email through another Draft-07 branch.',
      enum: ['none', 'invoice'],
    },
    invoiceEmail: {
      type: 'string',
      title: 'Invoice email',
      format: 'email',
      'x-hidden': true,
    },
    creditCard: {
      type: 'string',
      title: 'Credit card',
      description:
        'Legacy dependencies can make billing fields required when this property is present.',
    },
    billingAddress: {
      type: 'string',
      title: 'Billing address',
    },
    billingCity: {
      type: 'string',
      title: 'Billing city',
    },
  },
  dependencies: {
    creditCard: ['billingAddress', 'billingCity'],
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
  else: {
    if: {
      properties: {
        employmentStatus: { const: 'self_employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
      properties: {
        abnNumber: { 'x-hidden': false },
      },
      required: ['abnNumber'],
    },
  },
  allOf: [
    {
      if: {
        properties: {
          receiptType: { const: 'invoice' },
        },
        required: ['receiptType'],
      },
      then: {
        properties: {
          invoiceEmail: { 'x-hidden': false },
        },
        required: ['invoiceEmail'],
      },
    },
  ],
} satisfies ObjectJSONSchemaType
