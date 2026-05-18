import { Link, createRoute } from '@tanstack/react-router'

import { examples } from '../modules/registry'
import { rootRoute } from './__root'

function IndexPage() {
  return (
    <div className="demo">
      <header className="demo-header">
        <h1>react-hook-form-jsonschema</h1>
        <p>
          Each example lives in <code>src/modules/&lt;name&gt;/</code> with{' '}
          <code>schema.ts</code>, optional <code>ui-schema.ts</code>, and{' '}
          <code>form.tsx</code>. Open a route to preview schema and form side by
          side.
        </p>
      </header>
      <ul className="example-index">
        {examples.map(example => (
          <li key={example.path} className="example-index-item">
            <Link to={example.path} className="example-index-link">
              <span className="example-index-label">{example.label}</span>
              <span className="example-index-desc">{example.description}</span>
              <span className="example-index-path">modules/{example.id}/</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})
