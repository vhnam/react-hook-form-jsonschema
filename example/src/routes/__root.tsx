import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

import { examples } from '../modules/registry'

function RootLayout() {
  return (
    <div className="app">
      <aside className="app-nav">
        <p className="app-nav-title">Examples</p>
        <nav aria-label="Example routes">
          <ul className="app-nav-list">
            <li>
              <Link
                to="/"
                className="app-nav-link"
                activeProps={{ className: 'app-nav-link is-active' }}
                activeOptions={{ exact: true }}
              >
                Overview
              </Link>
            </li>
            {examples.map(example => (
              <li key={example.path}>
                <Link
                  to={example.path}
                  className="app-nav-link"
                  activeProps={{ className: 'app-nav-link is-active' }}
                >
                  {example.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
