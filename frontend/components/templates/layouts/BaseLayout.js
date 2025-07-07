// frontend/components/templates/layouts/BaseLayout.js
import React from 'react';
import { cn } from '@/lib/utils';

const BaseLayout = ({ 
  children, 
  template, 
  portfolio, 
  isEditing, 
  className = "",
  containerWidth = "normal" 
}) => {
  const getContainerClass = (width) => {
    switch (width) {
      case 'narrow': return 'max-w-4xl';
      case 'normal': return 'max-w-6xl';
      case 'wide': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-6xl';
    }
  };

  const containerClass = getContainerClass(
    template?.layout?.structure?.containerWidth || containerWidth
  );

  return (
    <div className={cn("base-layout min-h-screen", className)}>
      {/* Global template styling will be applied via CSS custom properties */}
      <div className={cn("template-container", containerClass)}>
        {children}
      </div>
    </div>
  );
};

export default BaseLayout;