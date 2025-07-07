// frontend/components/templates/layouts/PhotographyLayout.js
import React from 'react';
import BaseLayout from './BaseLayout';
import TemplateNavbar from '../template-parts/TemplateNavbar';
import TemplateFooter from '../template-parts/TemplateFooter';
import { cn } from '@/lib/utils';

const PhotographyLayout = ({ 
  children, 
  template, 
  portfolio, 
  isEditing = false,
  onDataChange 
}) => {
  const layoutConfig = template?.layout || {};
  const structure = layoutConfig.structure || {};
  
  // Photography layout specific classes - dark, visual-focused
  const photographyClasses = "photography-layout bg-black text-white overflow-x-hidden";
  
  const getMainLayoutClasses = () => {
    const mainLayout = structure.mainLayout || 'fullwidth';
    const baseClasses = "main-content flex-1";
    
    switch (mainLayout) {
      case 'single-column':
        return cn(baseClasses, "w-full");
      case 'two-column':
        return cn(baseClasses, "grid grid-cols-1 lg:grid-cols-2");
      case 'masonry':
        return cn(baseClasses, "columns-1 md:columns-2 lg:columns-3 gap-4");
      case 'grid':
        return cn(baseClasses, "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4");
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
      className={photographyClasses}
      containerWidth="full"
    >
      <div className="flex flex-col min-h-screen">
        {/* Photography Navigation - Minimal and elegant */}
        {structure.hasNavbar !== false && (
          <div className="absolute top-0 left-0 right-0 z-50">
            <TemplateNavbar
              config={{
                ...layoutConfig.components?.navbar,
                style: 'transparent',
                position: 'fixed'
              }}
              data={portfolio?.templateLayout?.navbar || {}}
              isEditing={isEditing}
              template={template}
              onDataChange={onDataChange}
            />
          </div>
        )}

        {/* Full-screen Header for Photography */}
        {structure.hasHeader && (
          <header className="template-header relative min-h-screen flex items-center justify-center">
            {/* Background Image or Video */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
            
            <div className="relative z-10 text-center px-4">
              {isEditing ? (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.title || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.title', e.target.value)}
                    placeholder="Photographer Name"
                    className="text-6xl font-light bg-transparent border-b border-white/30 text-center text-white w-full max-w-4xl mx-auto"
                  />
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.subtitle || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.subtitle', e.target.value)}
                    placeholder="Visual Storyteller"
                    className="text-2xl font-light text-white/80 bg-transparent border-b border-white/20 text-center w-full max-w-2xl mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {portfolio?.templateLayout?.header?.title && (
                    <h1 className="text-5xl md:text-7xl font-light text-white leading-tight tracking-wide">
                      {portfolio.templateLayout.header.title}
                    </h1>
                  )}
                  {portfolio?.templateLayout?.header?.subtitle && (
                    <p className="text-xl md:text-2xl font-light text-white/80 max-w-3xl mx-auto tracking-wider">
                      {portfolio.templateLayout.header.subtitle}
                    </p>
                  )}
                  
                  {/* Scroll Indicator */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                      <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area - Full width for images */}
        <main className={getMainLayoutClasses()}>
          {/* Photography sections - no container for full-width images */}
          <div className="photography-sections-wrapper">
            {children}
          </div>
        </main>

        {/* Minimal Dark Footer */}
        {structure.hasFooter !== false && (
          <TemplateFooter
            config={{
              ...layoutConfig.components?.footer,
              style: 'dark'
            }}
            data={portfolio?.templateLayout?.footer || {}}
            isEditing={isEditing}
            onDataChange={onDataChange}
            portfolio={portfolio}
          />
        )}
      </div>

      {/* Photography Layout Specific Styles */}
      <style jsx>{`
        .photography-layout {
          font-family: 'Inter', -apple-system, sans-serif;
          letter-spacing: 0.025em;
        }

        .photography-layout .photography-sections-wrapper > section {
          background: transparent;
          border: none;
          margin-bottom: 0;
          padding: 0;
        }
        
        .photography-layout .photography-sections-wrapper > section:not(#hero) {
          padding: 4rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .photography-layout h2 {
          font-weight: 300;
          font-size: 2.5rem;
          color: white;
          text-align: center;
          margin-bottom: 3rem;
          letter-spacing: 0.1em;
        }

        .photography-layout .section-content {
          padding: 0;
        }

        /* Special styling for image galleries in photography layout */
        .photography-layout img {
          transition: all 0.3s ease;
          filter: grayscale(20%);
        }

        .photography-layout img:hover {
          filter: grayscale(0%);
          transform: scale(1.02);
        }

        /* Hide default section backgrounds for photography */
        .photography-layout section[id] {
          background: transparent !important;
        }
      `}</style>
    </BaseLayout>
  );
};

export default PhotographyLayout;