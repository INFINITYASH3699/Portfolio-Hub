// frontend/components/ui/Select.js
"use client"; // Ensure this is a client component

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available for Tailwind merging

// --- Select Context ---
// Used to pass state and handlers down to Trigger, Content, and Items
const SelectContext = React.createContext(undefined);

// --- Select Component (The main wrapper) ---
const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const ref = useRef(null);

  // Update internal state if value prop changes externally
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value, selectedValue]);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleValueChange = useCallback((newValue) => {
    setSelectedValue(newValue);
    onValueChange && onValueChange(newValue);
    close();
  }, [onValueChange, close]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const contextValue = {
    isOpen,
    toggleOpen,
    close,
    selectedValue,
    handleValueChange,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={ref} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// --- SelectTrigger Component ---
const SelectTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const { isOpen, toggleOpen, selectedValue } = React.useContext(SelectContext);

  return (
    <button // Use a button for accessibility
      type="button"
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isOpen && "ring-1 ring-ring", // Highlight when open
        className
      )}
      onClick={toggleOpen}
      ref={ref}
      {...props}
    >
      {/* This renders the currently selected value or a placeholder */}
      {selectedValue ? (
        children // If children are provided, assume they represent the selected value
      ) : (
        <span className="text-muted-foreground">Select an option</span> // Default placeholder
      )}
      <svg // Chevron icon
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";


// --- SelectValue Component ---
// This component is purely for displaying the value inside the trigger.
// It uses the context to get the selected value.
const SelectValue = ({ children, placeholder }) => {
  const { selectedValue } = React.useContext(SelectContext);
  return <>{selectedValue ? children : placeholder}</>;
};
SelectValue.displayName = "SelectValue";


// --- SelectContent Component (The dropdown options container) ---
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, close } = React.useContext(SelectContext);

  if (!isOpen) return null; // Only render when open

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white shadow-md animate-in fade-in-80",
        className
      )}
      onClick={close} // Close when an item is clicked (bubbling from SelectItem)
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";


// --- SelectItem Component (Individual options) ---
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { handleValueChange, selectedValue } = React.useContext(SelectContext);
  const isActive = selectedValue === value;

  const handleClick = useCallback(() => {
    handleValueChange(value);
  }, [handleValueChange, value]);

  return (
    <div
      role="option" // For accessibility
      aria-selected={isActive}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isActive && "font-semibold", // Highlight active item
        className
      )}
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      {children}
      {isActive && ( // Checkmark for selected item
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      )}
    </div>
  );
});
SelectItem.displayName = "SelectItem";


// Export all components
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
