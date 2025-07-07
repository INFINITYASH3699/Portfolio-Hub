"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

// Context for Dropdown Menu state
const DropdownMenuContext = createContext(undefined);

// 1. Main Dropdown Menu Component
const DropdownMenu = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // Controlled vs Uncontrolled behavior
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : isOpen;

  const handleOpenChange = useCallback(
    (newOpenState) => {
      if (!isControlled) {
        setIsOpen(newOpenState);
      }
      onOpenChange && onOpenChange(newOpenState);
    },
    [isControlled, onOpenChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        contentRef.current &&
        !contentRef.current.contains(event.target)
      ) {
        handleOpenChange(false);
      }
    };

    if (currentOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentOpen, handleOpenChange]);

  const contextValue = {
    isOpen: currentOpen,
    toggleOpen: useCallback(
      () => handleOpenChange(!currentOpen),
      [currentOpen, handleOpenChange]
    ),
    triggerRef,
    contentRef,
    handleOpenChange, // Pass handleOpenChange for MenuItem to close on click
  };

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <div className="relative inline-block">
        {" "}
        {/* Wrapper to position content relative to trigger */}
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

// 2. Dropdown Menu Trigger
const DropdownMenuTrigger = React.forwardRef(
  ({ children, asChild = false, ...props }, forwardedRef) => {
    const { toggleOpen, triggerRef } = useContext(DropdownMenuContext);

    // Merge the internal ref with any forwarded ref
    const ref = useCallback(
      (node) => {
        triggerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, triggerRef]
    );

    if (asChild) {
      // When asChild is true, clone the child and inject ref and onClick
      return React.cloneElement(children, {
        ref, // Pass the merged ref
        onClick: (e) => {
          toggleOpen(); // Toggle dropdown state
          // Call original onClick if it exists
          if (children.props.onClick) {
            children.props.onClick(e);
          }
        },
        ...props, // Spread additional props (like className)
      });
    }

    return (
      <button
        ref={ref}
        onClick={toggleOpen}
        type="button" // Important for buttons not to submit form
        className="inline-flex" // Basic styling for default button trigger
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// 3. Dropdown Menu Content
const DropdownMenuContent = React.forwardRef(
  ({ children, className = "", align = "end", ...props }, forwardedRef) => {
    const { isOpen, contentRef } = useContext(DropdownMenuContext);

    // Merge refs for the content div
    const ref = useCallback(
      (node) => {
        contentRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, contentRef]
    );

    if (!isOpen) return null;

    const alignClasses = {
      start: "left-0", // Adjusted for absolute positioning
      center: "left-1/2 -translate-x-1/2",
      end: "right-0", // Adjusted for absolute positioning
    };

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 w-56 rounded-md border bg-white p-1 shadow-md outline-none animate-fadeIn",
          alignClasses[align],
          className
        )}
        // IMPORTANT: Clicks inside content will be handled by individual items.
        // This div itself should *not* close the menu,
        // or it will prevent Link/Button clicks inside from working.
        // It just prevents propagation to the overlay.
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

// 4. Dropdown Menu Item (Simplified onClick handling for asChild)
const DropdownMenuItem = React.forwardRef(
  (
    {
      className = "",
      inset = false,
      disabled = false,
      children,
      asChild = false,
      onClick,
      ...props
    },
    forwardedRef
  ) => {
    const { handleOpenChange } = useContext(DropdownMenuContext); // Get the function to close the menu

    const baseClasses =
      "relative flex cursor-pointer select-none border border-b-4 mt-2 items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-100 hover:bg-muted";
    const insetClass = inset ? "pl-8" : "";
    const disabledClasses = disabled ? "pointer-events-none opacity-50" : "";

    // Common props that are always applied to the final rendered element
    const commonProps = {
      className: cn(baseClasses, insetClass, disabledClasses, className),
      role: "menuitem",
      tabIndex: disabled ? -1 : 0, // Make accessible for keyboard navigation
      //   "data-disabled": disabled,
      ...props, // Spread any other props directly onto the element
    };

    // Function that combines onClick behavior: original click handler + close menu
    const handleClick = useCallback(
      (e) => {
        if (disabled) {
          e.preventDefault(); // Prevent any default behavior if disabled
          return;
        }
        // Call original onClick if it exists (for both asChild and non-asChild)
        if (onClick) {
          onClick(e);
        }
        // IMPORTANT: Close the menu AFTER the click has processed,
        // potentially allowing navigation to initiate.
        // A small timeout can sometimes ensure navigation starts first,
        // but often direct call is fine if Link is used properly.
        handleOpenChange(false);
      },
      [disabled, onClick, handleOpenChange]
    );

    if (asChild) {
      // When asChild is true, clone the child element and merge props/ref.
      // The child (e.g., Next.js Link) should handle its own navigation.
      // We only inject the ref, styling, accessibility attributes, and our combined click handler.
      return React.cloneElement(children, {
        ref: forwardedRef, // Pass the forwarded ref
        // Merge className explicitly from both commonProps and original children props
        className: cn(commonProps.className, children.props.className),
        onClick: handleClick, // Use our combined click handler
        ...children.props, // Ensure child's own props are preserved
      });
    }

    // Default behavior if not asChild
    return (
      <div ref={forwardedRef} onClick={handleClick} {...commonProps}>
        {children}
      </div>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

// 5. Dropdown Menu Separator
const DropdownMenuSeparator = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// Re-export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
