import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './globalModern.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // Data "tươi" trong 2 phút
      gcTime: 1000 * 60 * 5,      // Cache giữ 5 phút
      refetchOnWindowFocus: false, // Không refetch khi focus tab
      retry: 1,                    // Retry 1 lần nếu lỗi
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
