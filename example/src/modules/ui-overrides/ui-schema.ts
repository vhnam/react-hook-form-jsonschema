import { UITypes, type UISchemaType } from 'react-hook-form-jsonschema'

export const uiSchema: UISchemaType = {
  type: UITypes.default,
  properties: {
    bio: { type: UITypes.textArea },
    password: { type: UITypes.password },
    sessionId: { type: UITypes.hidden },
  },
}
