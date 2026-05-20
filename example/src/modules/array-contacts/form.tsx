import { ListArrayField } from '../../shared/fields'
import type { ExampleFormProps } from '../../shared/types'

export function Form(_props: ExampleFormProps) {
  return <ListArrayField pointer="#/properties/contacts" />
}
