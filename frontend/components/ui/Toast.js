"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Our custom cn utility

// 1. Toast Context
const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// 2. Toast Provider Component
// This component will provide the toast function via context
// AND render the toast messages in a fixed container.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (options) => {
    const id = Math.random().toString(36).substring(2, 9); // Unique ID
    setToasts((prev) => [...prev, { id, ...options }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss: removeToast }}>
      {children}
      {/* The actual toast display container, rendered by the provider */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <IndividualToast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// 3. Individual Toast Component (renamed to avoid confusion with ToastProvider/Context)
const IndividualToast = ({ id, title, description, variant = 'default', duration = 3000, onDismiss, action }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  const variantClasses = {
    default: "bg-background border text-foreground",
    destructive: "bg-red-500 border-red-600 text-white",
    success: "bg-green-500 border-green-600 text-white",
  };

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm flex-col items-center space-y-1 rounded-md p-4 shadow-lg sm:flex-row sm:items-center space-x-4 pointer-events-auto",
        variantClasses[variant]
      )}
      role="alert"
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      <button
        onClick={() => onDismiss(id)}
        className="absolute right-2 top-2 p-1 rounded-md hover:bg-opacity-20 hover:bg-white text-foreground"
      >
        ✕
      </button>
    </div>
  );
};