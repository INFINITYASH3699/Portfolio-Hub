// frontend/components/templates/layouts/ModernLayout.js
import React from 'react';
import BaseLayout from './BaseLayout';
import TemplateNavbar from '../template-parts/TemplateNavbar';
import TemplateFooter from '../template-parts/TemplateFooter';
import { cn } from '@/lib/utils';

const ModernLayout = ({ 
  children, 
  template, 
  portfolio, 
  isEditing = false,
  onDataChange 
}) => {
  const layoutConfig = template?.layout || {};
  const structure = layoutConfig.structure || {};
  
  // Modern layout specific classes
  const modernClasses = "modern-layout bg-white text-gray-900";
  
  const getMainLayoutClasses = () => {
    const mainLayout = structure.mainLayout || 'single-column';
    const baseClasses = "main-content flex-1";
    
    switch (mainLayout) {
      case 'single-column':
        return cn(baseClasses, "w-full");
      case 'two-column':
        return cn(baseClasses, "grid grid-cols-1 lg:grid-cols-2 gap-8");
      case 'masonry':
        return cn(baseClasses, "columns-1 md:columns-2 lg:columns-3 gap-8");
      case 'grid':
        return cn(baseClasses, "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8");
      case 'fullwidth':
        return cn(baseClasses, "w-full max-w-none");
      default:
        return cn(baseClasses, "w-full");
    }
  };

  return (
    <BaseLayout
      template={template}
      portfolio={portfolio}
      isEditing={isEditing}
      className={modernClasses}
      containerWidth={structure.containerWidth}
    >
      <div className="flex flex-col min-h-screen">
        {/* Navigation Bar */}
        {structure.hasNavbar !== false && (
          <TemplateNavbar
            config={layoutConfig.components?.navbar || {}}
            data={portfolio?.templateLayout?.navbar || {}}
            isEditing={isEditing}
            template={template}
            onDataChange={onDataChange}
          />
        )}

        {/* Header Section (Optional) */}
        {structure.hasHeader && (
          <header className="template-header bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
            <div className="container mx-auto px-4 text-center">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.title || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.title', e.target.value)}
                    placeholder="Header Title"
                    className="text-3xl font-bold bg-transparent border-b-2 border-primary/30 text-center w-full max-w-2xl mx-auto"
                  />
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.subtitle || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.subtitle', e.target.value)}
                    placeholder="Header Subtitle"
                    className="text-xl text-muted-foreground bg-transparent border-b border-gray-300 text-center w-full max-w-xl mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio?.templateLayout?.header?.title && (
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">
                      {portfolio.templateLayout.header.title}
                    </h1>
                  )}
                  {portfolio?.templateLayout?.header?.subtitle && (
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      {portfolio.templateLayout.header.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={getMainLayoutClasses()}>
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>

        {/* Footer */}
        {structure.hasFooter !== false && (
          <TemplateFooter
            config={layoutConfig.components?.footer || {}}
            data={portfolio?.templateLayout?.footer || {}}
            isEditing={isEditing}
            onDataChange={onDataChange}
            portfolio={portfolio}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default ModernLayout;