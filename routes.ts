import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './src/pages/home';
import AboutData from './src/pages/about.data';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: lazy(() => import('./src/pages/about')),
    data: AboutData,
  },
  {
    path: '**',
    component: lazy(() => import('./src/errors/404')),
  },
];
