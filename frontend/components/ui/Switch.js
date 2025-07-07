"use client";

import React, { useState, useCallback, useId } from 'react'; // Added useId for accessibility
import { cn } from '@/lib/utils'; // Our custom cn utility

const Switch = React.forwardRef(
  ({ className = '', checked, onCheckedChange, disabled = false, ...props }, ref) => {
    // Internal state for uncontrolled usage, or use 'checked' for controlled
    const [internalChecked, setInternalChecked] = useState(false);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const id = useId(); // Generate a unique ID for accessibility

    const handleClick = useCallback(() => {
      if (disabled) return;

      const newCheckedState = !currentChecked;
      if (!isControlled) {
        setInternalChecked(newCheckedState);
      }
      onCheckedChange && onCheckedChange(newCheckedState);
    }, [currentChecked, disabled, isControlled, onCheckedChange]);

    const trackClasses = cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      currentChecked ? "bg-primary" : "bg-input", // Primary for ON, Input for OFF
      className
    );

    const thumbClasses = cn(
      "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
      currentChecked ? "translate-x-5" : "translate-x-0" // Slide thumb
    );

    return (
      <button
        type="button" // Important for buttons not to submit forms
        role="switch"
        aria-checked={currentChecked}
        aria-labelledby={props['aria-labelledby'] || (props.id ? `${props.id}-label` : id)} // Link with a label
        onClick={handleClick}
        disabled={disabled}
        className={trackClasses}
        ref={ref}
        {...props}
      >
        <span
          className={thumbClasses}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };