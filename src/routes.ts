import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';
import Visplay from './pages/visplay'

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/visplay',
    component: Visplay,
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];