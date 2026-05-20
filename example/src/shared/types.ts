import type { ComponentType } from 'react'
import type {
  ObjectJSONSchemaType,
  UISchemaType,
} from 'react-hook-form-jsonschema'

export type ExampleFormProps = {
  uiSchema?: UISchemaType
}

export type ExampleDefinition = {
  /** Folder name under `src/modules/` */
  id: string
  path: string
  label: string
  description: string
  title: string
  summary: string
  schema: ObjectJSONSchemaType
  uiSchema?: UISchemaType
  defaultValues?: Record<string, unknown>
  Form: ComponentType<ExampleFormProps>
}
