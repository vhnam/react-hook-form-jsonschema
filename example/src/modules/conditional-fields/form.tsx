import { ObjectFields } from '../../shared/fields'
import type { ExampleFormProps } from '../../shared/types'

export function Form({ uiSchema }: ExampleFormProps) {
  return <ObjectFields pointer="#" UISchema={uiSchema} />
}
