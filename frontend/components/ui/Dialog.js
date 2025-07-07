// frontend/components/ui/Dialog.js
"use client";

import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

// Add a mapping for common dialog sizes (tailwind width classes)
const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-full',
};

const Dialog = ({ isOpen, onClose, children, title, description, size = 'md' }) => { // Renamed `open` to `isOpen`, added title, description, size
  if (!isOpen) return null; // Correctly checks `isOpen`

  const sizeClass = dialogSizes[size] || dialogSizes.md; // Get Tailwind class for size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"> {/* Added p-4 for padding on smaller screens */}
      <div
        className={cn(
          "relative z-50 bg-white rounded-lg shadow-lg w-full animate-fadeIn",
          sizeClass // Apply dynamic size class
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose} // Use onClose directly
          className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close dialog" // Accessibility
        >
          ✕
        </button>
        
        {(title || description) && ( // Render header if title or description exist
          <DialogHeader className="p-6 pb-2"> {/* Added padding */}
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <DialogContent className="p-6 pt-0"> {/* Adjusted padding */}
          {children}
        </DialogContent>
      </div>
    </div>
  );
};

// These components are used internally by the main Dialog component
// and are exported for semantic structure, but not typically called directly with `open`/`onClose`
const DialogTrigger = ({ children, onClick, ...props }) => {
  return React.cloneElement(children, { onClick: onClick, ...props });
};

const DialogContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("dialog-content", className)} {...props}>
      {children}
    </div>
  );
};

const DialogHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn("text-center sm:text-left space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
};

const DialogDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };