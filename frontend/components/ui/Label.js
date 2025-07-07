import React from 'react';
import { cn } from '@/lib/utils'; // Our custom cn utility

const Label = React.forwardRef(
  ({ className = '', htmlFor, ...props }, ref) => { // Added htmlFor prop here
    const classes = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
    return (
      <label
        htmlFor={htmlFor} // Pass htmlFor to the underlying label element
        className={cn(classes, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label }; // Ensure named export