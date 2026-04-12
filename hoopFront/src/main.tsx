import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/Common/ErrorBoundary.tsx'
import { ToastProvider } from './components/Common/Toast.tsx'

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
        },
    },
});

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Suspense fallback={<div className="feed-loading"><div className="basketball-spinner" /></div>}>
            <App />
          </Suspense>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
