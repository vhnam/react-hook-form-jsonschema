import type { ExampleDefinition } from './types'
import { FormDemo } from './form-demo'

function SchemaPanel(props: { title: string; data: unknown }) {
  return (
    <div className="schema-panel">
      <h3 className="schema-panel-title">{props.title}</h3>
      <pre className="schema-panel-code">{JSON.stringify(props.data, null, 2)}</pre>
    </div>
  )
}

export function ExamplePage({ example }: { example: ExampleDefinition }) {
  return (
    <div className="example-page">
      <aside className="example-page-schemas" aria-label="Example source">
        <SchemaPanel title="schema.ts" data={example.schema} />
        {example.uiSchema != null && (
          <SchemaPanel title="ui-schema.ts" data={example.uiSchema} />
        )}
        {example.defaultValues != null && (
          <SchemaPanel title="defaultValues" data={example.defaultValues} />
        )}
      </aside>

      <section className="example-page-form" aria-label="Live form">
        <FormDemo
          schema={example.schema}
          title={example.title}
          description={example.summary}
          defaultValues={example.defaultValues}
        >
          <example.Form uiSchema={example.uiSchema} />
        </FormDemo>
      </section>
    </div>
  )
}
