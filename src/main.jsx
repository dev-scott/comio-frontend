import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid #21262d',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0f1117' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0f1117' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
