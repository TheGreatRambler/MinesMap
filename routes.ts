import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './src/pages/home';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '**',
    component: lazy(() => import('./src/errors/404')),
  },
];
