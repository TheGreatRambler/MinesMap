/* @refresh reload */
import './index.css';

import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/solid-query'
import App from './app';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const queryClient = new QueryClient()

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  ),
  root,
);
