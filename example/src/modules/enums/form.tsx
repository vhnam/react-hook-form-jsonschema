import { ObjectFields } from '../../shared/fields'

import { uiSchema } from './ui-schema'

export function Form() {
  return <ObjectFields pointer="#" UISchema={uiSchema} />
}
