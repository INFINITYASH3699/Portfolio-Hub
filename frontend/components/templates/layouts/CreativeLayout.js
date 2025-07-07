// frontend/components/templates/layouts/CreativeLayout.js
import React from 'react';
import BaseLayout from './BaseLayout';
import TemplateNavbar from '../template-parts/TemplateNavbar';
import TemplateFooter from '../template-parts/TemplateFooter';
import { cn } from '@/lib/utils';

const CreativeLayout = ({ 
  children, 
  template, 
  portfolio, 
  isEditing = false,
  onDataChange 
}) => {
  const layoutConfig = template?.layout || {};
  const structure = layoutConfig.structure || {};
  
  // Creative layout specific classes - more colorful and artistic
  const creativeClasses = "creative-layout bg-gradient-to-br from-purple-50 via-white to-pink-50 text-gray-900 overflow-x-hidden";
  
  const getMainLayoutClasses = () => {
    const mainLayout = structure.mainLayout || 'masonry';
    const baseClasses = "main-content flex-1 relative";
    
    switch (mainLayout) {
      case 'single-column':
        return cn(baseClasses, "w-full space-y-16");
      case 'two-column':
        return cn(baseClasses, "grid grid-cols-1 lg:grid-cols-5 gap-12");
      case 'masonry':
        return cn(baseClasses, "columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8");
      case 'grid':
        return cn(baseClasses, "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12");
      case 'fullwidth':
        return cn(baseClasses, "w-full max-w-none");
      default:
        return cn(baseClasses, "space-y-16");
    }
  };

  return (
    <BaseLayout
      template={template}
      portfolio={portfolio}
      isEditing={isEditing}
      className={creativeClasses}
      containerWidth={structure.containerWidth}
    >
      <div className="flex flex-col min-h-screen relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-300 to-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Navigation Bar */}
        {structure.hasNavbar !== false && (
          <div className="relative z-10">
            <TemplateNavbar
              config={{
                ...layoutConfig.components?.navbar,
                style: 'transparent',
                position: 'sticky'
              }}
              data={portfolio?.templateLayout?.navbar || {}}
              isEditing={isEditing}
              template={template}
              onDataChange={onDataChange}
            />
          </div>
        )}

        {/* Creative Header Section */}
        {structure.hasHeader && (
          <header className="template-header relative z-10 py-20 text-center">
            <div className="container mx-auto px-4">
              {isEditing ? (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.title || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.title', e.target.value)}
                    placeholder="Creative Header Title"
                    className="text-5xl font-bold bg-transparent border-b-2 border-purple-400 text-center w-full max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                  />
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.subtitle || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.subtitle', e.target.value)}
                    placeholder="Inspiring Subtitle"
                    className="text-2xl text-gray-600 bg-transparent border-b border-gray-300 text-center w-full max-w-2xl mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {portfolio?.templateLayout?.header?.title && (
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 leading-tight">
                      {portfolio.templateLayout.header.title}
                    </h1>
                  )}
                  {portfolio?.templateLayout?.header?.subtitle && (
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      {portfolio.templateLayout.header.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area with Creative Styling */}
        <main className={getMainLayoutClasses()}>
          <div className="container mx-auto px-4 relative z-10">
            {/* Creative section wrapper */}
            <div className="creative-sections-wrapper">
              {children}
            </div>
          </div>
        </main>

        {/* Creative Footer */}
        {structure.hasFooter !== false && (
          <div className="relative z-10 mt-20">
            <TemplateFooter
              config={{
                ...layoutConfig.components?.footer,
                style: 'gradient'
              }}
              data={portfolio?.templateLayout?.footer || {}}
              isEditing={isEditing}
              onDataChange={onDataChange}
              portfolio={portfolio}
            />
          </div>
        )}
      </div>

      {/* Creative Layout Specific Styles */}
      <style jsx>{`
        .creative-layout .creative-sections-wrapper > * {
          position: relative;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .creative-layout .creative-sections-wrapper > *:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </BaseLayout>
  );
};

export default CreativeLayout;