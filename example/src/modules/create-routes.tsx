import { createRoute, type AnyRoute } from '@tanstack/react-router'

import { ExamplePage } from '../shared/example-page'
import { rootRoute } from '../routes/__root'

import { examples } from './registry'

export function createExampleRoutes(): AnyRoute[] {
  return examples.map(example =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: example.path,
      component: () => <ExamplePage example={example} />,
    })
  )
}
