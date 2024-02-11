import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';
import Mobile from './pages/mobile';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/mobile',
    component: Mobile,
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];