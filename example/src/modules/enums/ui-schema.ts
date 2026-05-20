import { UITypes, type UISchemaType } from 'react-hook-form-jsonschema'

export const uiSchema: UISchemaType = {
  type: UITypes.default,
  properties: {
    priority: { type: UITypes.radio },
    birthYear: { type: UITypes.select },
  },
}
