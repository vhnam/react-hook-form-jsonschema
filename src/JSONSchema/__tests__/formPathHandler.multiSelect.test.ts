import { getObjectFromForm } from '../logic'

const options = ['reading', 'gaming', 'cooking', 'sports']

const formData = {
  '#/properties/hobbies': [false, 'gaming', 'cooking', false],
  '#/properties/newsletter': false,
}

test('getObjectFromForm compacts multi-select when uniqueItems is true', () => {
  const schema = {
    type: 'object',
    properties: {
      newsletter: { type: 'boolean' },
      hobbies: {
        type: 'array',
        uniqueItems: true,
        items: { type: 'string', enum: options },
      },
    },
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    newsletter: false,
    hobbies: ['gaming', 'cooking'],
  })
})

test('getObjectFromForm keeps positional slots when uniqueItems is false', () => {
  const schema = {
    type: 'object',
    properties: {
      newsletter: { type: 'boolean' },
      hobbies: {
        type: 'array',
        uniqueItems: false,
        items: { type: 'string', enum: options },
      },
    },
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    newsletter: false,
    hobbies: [false, 'gaming', 'cooking', false],
  })
})

test('getObjectFromForm keeps positional slots when uniqueItems is omitted', () => {
  const schema = {
    type: 'object',
    properties: {
      newsletter: { type: 'boolean' },
      hobbies: {
        type: 'array',
        items: { type: 'string', enum: options },
      },
    },
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    newsletter: false,
    hobbies: [false, 'gaming', 'cooking', false],
  })
})
