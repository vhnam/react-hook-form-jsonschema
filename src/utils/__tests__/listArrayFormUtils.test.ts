import {
  getArrayItemPointer,
  getListArrayEntries,
  getListArrayItemPointers,
  getListArrayItemPointersByIndex,
} from '../listArrayFormUtils'

describe('list array form utilities', () => {
  test('builds indexed item pointers from an array pointer', () => {
    expect(getArrayItemPointer('#/properties/tags', 2)).toBe(
      '#/properties/tags/2'
    )
  })

  test('finds the exact item pointer and its child pointers only', () => {
    const values = {
      '#/properties/contacts/1': { name: 'Grace' },
      '#/properties/contacts/1/properties/email': 'grace@example.com',
      '#/properties/contacts/10/properties/email': 'ten@example.com',
      '#/properties/contacts/0/properties/email': 'ada@example.com',
      '#/properties/other/1': 'ignored',
    }

    expect(
      getListArrayItemPointers(values, '#/properties/contacts', 1)
    ).toEqual([
      '#/properties/contacts/1',
      '#/properties/contacts/1/properties/email',
    ])
  })

  test('indexes item pointers with a single form value scan', () => {
    const values = {
      '#/properties/contacts/1': { name: 'Grace' },
      '#/properties/contacts/1/properties/email': 'grace@example.com',
      '#/properties/contacts/0/properties/email': 'ada@example.com',
      '#/properties/other/1': 'ignored',
    }

    expect(
      getListArrayItemPointersByIndex(values, '#/properties/contacts')
    ).toEqual(
      new Map([
        [
          1,
          [
            '#/properties/contacts/1',
            '#/properties/contacts/1/properties/email',
          ],
        ],
        [0, ['#/properties/contacts/0/properties/email']],
      ])
    )
  })

  test('reconstructs sorted array entries from indexed form pointers', () => {
    const values = {
      '#/properties/contacts/1/properties/email': 'grace@example.com',
      '#/properties/contacts/0/properties/name': 'Ada',
      '#/properties/contacts/0/properties/emails/0': 'ada@example.com',
      '#/properties/contacts/2': 'raw item',
      '#/properties/contacts/1/properties/name': 'Grace',
      '#/properties/contacts/name': 'not an indexed item',
    }

    expect(getListArrayEntries(values, '#/properties/contacts')).toEqual([
      { emails: ['ada@example.com'], name: 'Ada' },
      { email: 'grace@example.com', name: 'Grace' },
      'raw item',
    ])
  })

  test('merges indexed child pointers over existing array entries', () => {
    const values = {
      '#/properties/contacts': [{ name: 'Ada', role: 'admin' }],
      '#/properties/contacts/0/properties/name': 'Grace',
      '#/properties/contacts/0/properties/email': 'grace@example.com',
    }

    expect(getListArrayEntries(values, '#/properties/contacts')).toEqual([
      { email: 'grace@example.com', name: 'Grace', role: 'admin' },
    ])
  })
})
