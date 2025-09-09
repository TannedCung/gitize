'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer, useToast, ToastConfig, ToastPosition } from './Toast';

/**
 * Toast context interface
 */
interface ToastContextType {
  /** Add a new toast notification */
  addToast: (_config: Omit<ToastConfig, 'id'>) => string;
  /** Remove a specific toast by ID */
  removeToast: (_id: string) => void;
  /** Clear all toasts */
  clearToasts: () => void;
  /** Add success toast */
  success: (_message: string, _options?: Partial<ToastConfig>) => string;
  /** Add error toast */
  error: (_message: string, _options?: Partial<ToastConfig>) => string;
  /** Add warning toast */
  warning: (_message: string, _options?: Partial<ToastConfig>) => string;
  /** Add info toast */
  info: (_message: string, _options?: Partial<ToastConfig>) => string;
}

/**
 * Toast provider props
 */
interface ToastProviderProps {
  /** Child components */
  children: ReactNode;
  /** Default position for toasts */
  position?: ToastPosition;
  /** Maximum number of toasts to show */
  maxToasts?: number;
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 *
 * Provides toast functionality throughout the application using React Context.
 * Manages toast state and renders the ToastContainer.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const toastMethods = useToast();

  const contextValue: ToastContextType = {
    addToast: toastMethods.addToast,
    removeToast: toastMethods.removeToast,
    clearToasts: toastMethods.clearToasts,
    success: toastMethods.success,
    error: toastMethods.error,
    warning: toastMethods.warning,
    info: toastMethods.info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toastMethods.toasts}
        onDismiss={toastMethods.removeToast}
        position={position}
        maxToasts={maxToasts}
      />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast functionality
 *
 * @returns Toast methods for adding, removing, and managing toasts
 * @throws Error if used outside of ToastProvider
 */
export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }

  return context;
};

export default ToastProvider;
