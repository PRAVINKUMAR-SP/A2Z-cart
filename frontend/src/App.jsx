import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import { useProductStore } from './store/productStore';

export default function App() {
  const fetchProductsFromDb = useProductStore((state) => state.fetchProductsFromDb);

  useEffect(() => {
    if (fetchProductsFromDb) {
      fetchProductsFromDb();
    }
  }, [fetchProductsFromDb]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '14px',
            padding: '12px 18px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
          },
          success: {
            style: {
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #6ee7b7',
            },
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
