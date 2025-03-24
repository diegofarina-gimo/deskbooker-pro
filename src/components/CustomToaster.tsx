
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { X } from 'lucide-react';

export function CustomToaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 3000, // Shorter duration (3 seconds)
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
        },
        className: 'my-toast-class',
        closeButton: true, // Enable close button
        actionButtonStyle: {
          background: '#3b82f6',
          color: 'white',
        },
        descriptionStyle: {
          color: '#6b7280',
        },
      }}
    />
  );
}
