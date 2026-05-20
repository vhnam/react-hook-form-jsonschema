import {
  getAnnotatedSchemaFromPointer,
  getConditionalDependencyKeys,
  getObjectFromForm,
} from '../logic'

const getFormContext = (schema: Parameters<typeof getObjectFromForm>[0]) =>
  ({
    schema,
  }) as unknown as Parameters<typeof getAnnotatedSchemaFromPointer>[2]

test('marks dependentRequired fields as required when the trigger is present', () => {
  const schema = {
    type: 'object',
    properties: {
      creditCard: { type: 'string' },
      billingAddress: { type: 'string' },
    },
    dependentRequired: {
      creditCard: ['billingAddress'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/billingAddress',
    { creditCard: '' },
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(true)
})

test('does not apply dependentRequired when the trigger is absent', () => {
  const schema = {
    type: 'object',
    properties: {
      creditCard: { type: 'string' },
      billingAddress: { type: 'string' },
    },
    dependentRequired: {
      creditCard: ['billingAddress'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/billingAddress',
    {},
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(false)
})

test('treats falsey trigger values as present for dependentRequired', () => {
  const schema = {
    type: 'object',
    properties: {
      hasMedicalCondition: { type: 'boolean' },
      conditionName: { type: 'string' },
    },
    dependentRequired: {
      hasMedicalCondition: ['conditionName'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/conditionName',
    { hasMedicalCondition: false },
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(true)
})

test('keeps Draft-07 array dependencies compatible with dependentRequired', () => {
  const schema = {
    type: 'object',
    properties: {
      creditCard: { type: 'string' },
      billingAddress: { type: 'string' },
    },
    dependencies: {
      creditCard: ['billingAddress'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/billingAddress',
    { creditCard: '4111' },
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(true)
})

test('applies dependentSchemas when the trigger is present', () => {
  const schema = {
    type: 'object',
    properties: {
      creditCard: { type: 'string' },
    },
    dependentSchemas: {
      creditCard: {
        properties: {
          billingAddress: { type: 'string' },
        },
        required: ['billingAddress'],
      },
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/billingAddress',
    { creditCard: '4111' },
    getFormContext(schema)
  )

  expect(info.JSONSchema).toEqual({ type: 'string' })
  expect(info.isRequired).toBe(true)
})

test('keeps Draft-07 schema dependencies compatible with dependentSchemas', () => {
  const schema = {
    type: 'object',
    properties: {
      creditCard: { type: 'string' },
    },
    dependencies: {
      creditCard: {
        properties: {
          billingAddress: { type: 'string' },
        },
        required: ['billingAddress'],
      },
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/billingAddress',
    { creditCard: '4111' },
    getFormContext(schema)
  )

  expect(info.JSONSchema).toEqual({ type: 'string' })
  expect(info.isRequired).toBe(true)
})

test('applies if/then/else required branches from normalized schema data', () => {
  const schema = {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string' },
      companyName: { type: 'string' },
      abnNumber: { type: 'string' },
    },
    if: {
      properties: {
        employmentStatus: { const: 'employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
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
        required: ['abnNumber'],
      },
    },
  }

  const formContext = getFormContext(schema)

  expect(
    getAnnotatedSchemaFromPointer(
      '#/properties/companyName',
      { employmentStatus: 'employed' },
      formContext
    ).isRequired
  ).toBe(true)
  expect(
    getAnnotatedSchemaFromPointer(
      '#/properties/abnNumber',
      { employmentStatus: 'self_employed' },
      formContext
    ).isRequired
  ).toBe(true)
})

test('does not match if/then when a required trigger field is absent', () => {
  const schema = {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string' },
      companyName: { type: 'string' },
    },
    if: {
      properties: {
        employmentStatus: { const: 'employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
      required: ['companyName'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/companyName',
    {},
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(false)
})

test('normalizes primitive values before matching conditional const values', () => {
  const schema = {
    type: 'object',
    properties: {
      age: { type: 'integer' },
      guardianName: { type: 'string' },
    },
    if: {
      properties: {
        age: { type: 'integer', const: 17 },
      },
      required: ['age'],
    },
    then: {
      required: ['guardianName'],
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/guardianName',
    { age: '17' },
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(true)
})

test('applies allOf conditionals independently', () => {
  const schema = {
    type: 'object',
    properties: {
      hasSpouse: { type: 'boolean' },
      hasChildren: { type: 'boolean' },
      spouseName: { type: 'string' },
      childrenCount: { type: 'integer' },
    },
    allOf: [
      {
        if: {
          properties: { hasSpouse: { const: true } },
          required: ['hasSpouse'],
        },
        then: { required: ['spouseName'] },
      },
      {
        if: {
          properties: { hasChildren: { const: true } },
          required: ['hasChildren'],
        },
        then: { required: ['childrenCount'] },
      },
    ],
  }

  const formContext = getFormContext(schema)
  const data = { hasSpouse: true, hasChildren: true }

  expect(
    getAnnotatedSchemaFromPointer('#/properties/spouseName', data, formContext)
      .isRequired
  ).toBe(true)
  expect(
    getAnnotatedSchemaFromPointer('#/properties/childrenCount', data, formContext)
      .isRequired
  ).toBe(true)
})

test('uses active conditional properties when building schema data', () => {
  const schema = {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string' },
    },
    if: {
      properties: {
        employmentStatus: { const: 'employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
      properties: {
        companyName: { type: 'string' },
      },
      required: ['companyName'],
    },
  }

  expect(
    getObjectFromForm(schema, {
      '#/properties/companyName': 'ACME',
      '#/properties/employmentStatus': 'employed',
    })
  ).toEqual({
    companyName: 'ACME',
    employmentStatus: 'employed',
  })
})

test('omits fields hidden by active x-hidden overlays from schema data', () => {
  const schema = {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string' },
      companyName: { type: 'string', 'x-hidden': true },
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
    },
  }

  expect(
    getObjectFromForm(schema, {
      '#/properties/companyName': 'ACME',
      '#/properties/employmentStatus': 'unemployed',
    })
  ).toEqual({
    employmentStatus: 'unemployed',
  })
})

test('does not require hidden fields even when they are listed as required', () => {
  const schema = {
    type: 'object',
    properties: {
      companyName: { type: 'string', 'x-hidden': true },
    },
    required: ['companyName'],
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/companyName',
    {},
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(false)
})

test('applies conditionals inside array item schemas using item data', () => {
  const schema = {
    type: 'object',
    properties: {
      contacts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            preferred: { type: 'boolean' },
            phone: { type: 'string' },
          },
          if: {
            properties: {
              preferred: { const: true },
            },
            required: ['preferred'],
          },
          then: {
            required: ['phone'],
          },
        },
      },
    },
  }

  const info = getAnnotatedSchemaFromPointer(
    '#/properties/contacts/0/properties/phone',
    { contacts: [{ preferred: true }] },
    getFormContext(schema)
  )

  expect(info.isRequired).toBe(true)
})

test('collects dependency keys from conditional schema branches', () => {
  const schema = {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string' },
      hasSpouse: { type: 'boolean' },
      creditCard: { type: 'string' },
    },
    dependentRequired: {
      creditCard: ['billingAddress'],
    },
    if: {
      properties: {
        employmentStatus: { const: 'employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
      allOf: [
        {
          if: {
            properties: {
              hasSpouse: { const: true },
            },
            required: ['hasSpouse'],
          },
          then: {
            required: ['spouseName'],
          },
        },
      ],
    },
  }

  expect(getConditionalDependencyKeys(schema).sort()).toEqual([
    'creditCard',
    'employmentStatus',
    'hasSpouse',
  ])
})
