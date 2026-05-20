import { getAnnotatedSchemaFromPointer } from '../logic/schemaHandlers'

const contactsSchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' },
        },
        required: ['name'],
      },
    },
  },
}

const formContext = {
  schema: contactsSchema,
} as unknown as Parameters<typeof getAnnotatedSchemaFromPointer>[2]

test('resolves schema for array item object pointers', () => {
  const data = {
    contacts: [{ name: 'Ada' }],
  }

  const itemInfo = getAnnotatedSchemaFromPointer(
    '#/properties/contacts/0',
    data,
    formContext
  )

  expect(itemInfo.invalidPointer).toBe(false)
  expect(itemInfo.JSONSchema).toEqual({
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', title: 'Email' },
    },
    required: ['name'],
  })

  const nameInfo = getAnnotatedSchemaFromPointer(
    '#/properties/contacts/0/properties/name',
    data,
    formContext
  )

  expect(nameInfo.invalidPointer).toBe(false)
  expect(nameInfo.JSONSchema).toEqual({ type: 'string', title: 'Name' })
  expect(nameInfo.isRequired).toBe(true)
})
