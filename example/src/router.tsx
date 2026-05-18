import { createRouter } from '@tanstack/react-router'

import { createExampleRoutes } from './modules/create-routes'
import { examples } from './modules/registry'
import { indexRoute } from './routes/index'
import { rootRoute } from './routes/__root'

const exampleRoutes = createExampleRoutes()

const routeTree = rootRoute.addChildren([indexRoute, ...exampleRoutes])

export const router = createRouter({ routeTree })

export { examples }

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
