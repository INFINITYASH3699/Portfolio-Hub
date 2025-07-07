// frontend/components/templates/layouts/ProfessionalLayout.js
import React from 'react';
import BaseLayout from './BaseLayout';
import TemplateNavbar from '../template-parts/TemplateNavbar';
import TemplateFooter from '../template-parts/TemplateFooter';
import { cn } from '@/lib/utils';

const ProfessionalLayout = ({ 
  children, 
  template, 
  portfolio, 
  isEditing = false,
  onDataChange 
}) => {
  const layoutConfig = template?.layout || {};
  const structure = layoutConfig.structure || {};
  
  // Professional layout specific classes - clean, corporate look
  const professionalClasses = "professional-layout bg-gray-50 text-gray-900";
  
  const getMainLayoutClasses = () => {
    const mainLayout = structure.mainLayout || 'single-column';
    const baseClasses = "main-content flex-1";
    
    switch (mainLayout) {
      case 'single-column':
        return cn(baseClasses, "w-full max-w-4xl mx-auto");
      case 'two-column':
        return cn(baseClasses, "grid grid-cols-1 lg:grid-cols-3 gap-12");
      case 'masonry':
        return cn(baseClasses, "columns-1 md:columns-2 gap-8");
      case 'grid':
        return cn(baseClasses, "grid grid-cols-1 md:grid-cols-2 gap-8");
      case 'fullwidth':
        return cn(baseClasses, "w-full max-w-7xl mx-auto");
      default:
        return cn(baseClasses, "w-full max-w-5xl mx-auto");
    }
  };

  const hasSidebar = structure.hasSidebar;

  return (
    <BaseLayout
      template={template}
      portfolio={portfolio}
      isEditing={isEditing}
      className={professionalClasses}
      containerWidth={structure.containerWidth}
    >
      <div className="flex flex-col min-h-screen bg-white shadow-sm">
        {/* Professional Navigation Bar */}
        {structure.hasNavbar !== false && (
          <TemplateNavbar
            config={{
              ...layoutConfig.components?.navbar,
              style: 'solid',
              position: 'sticky'
            }}
            data={portfolio?.templateLayout?.navbar || {}}
            isEditing={isEditing}
            template={template}
            onDataChange={onDataChange}
          />
        )}

        {/* Professional Header with subtle styling */}
        {structure.hasHeader && (
          <header className="template-header bg-white border-b-2 border-gray-100 py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.title || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.title', e.target.value)}
                    placeholder="Professional Title"
                    className="text-4xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-600 text-center w-full"
                  />
                  <input
                    type="text"
                    value={portfolio?.templateLayout?.header?.subtitle || ''}
                    onChange={(e) => onDataChange && onDataChange('templateLayout.header.subtitle', e.target.value)}
                    placeholder="Professional Subtitle"
                    className="text-xl text-gray-600 bg-transparent border-b border-gray-300 text-center w-full"
                  />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  {portfolio?.templateLayout?.header?.title && (
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {portfolio.templateLayout.header.title}
                    </h1>
                  )}
                  {portfolio?.templateLayout?.header?.subtitle && (
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      {portfolio.templateLayout.header.subtitle}
                    </p>
                  )}
                  <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area with Professional Layout */}
        <div className="flex-1 flex">
          {/* Sidebar (if enabled) */}
          {hasSidebar && (
            <aside className="w-64 bg-gray-800 text-white p-6 hidden lg:block">
              <div className="space-y-6">
                {isEditing ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Sidebar content will appear here in professional layouts</p>
                    <textarea
                      placeholder="Add sidebar content..."
                      className="w-full p-2 bg-gray-700 text-white rounded border-none resize-none h-32"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Quick Navigation</h3>
                    <nav className="space-y-2">
                      {portfolio?.activeSections?.map((section, index) => (
                        <a
                          key={index}
                          href={`#${section}`}
                          className="block text-gray-300 hover:text-white transition-colors capitalize"
                        >
                          {section}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={cn(getMainLayoutClasses(), hasSidebar ? "flex-1" : "w-full")}>
            <div className="container mx-auto px-4 py-12">
              {/* Professional sections wrapper */}
              <div className="professional-sections-wrapper space-y-16">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Professional Footer */}
        {structure.hasFooter !== false && (
          <TemplateFooter
            config={{
              ...layoutConfig.components?.footer,
              style: 'solid'
            }}
            data={portfolio?.templateLayout?.footer || {}}
            isEditing={isEditing}
            onDataChange={onDataChange}
            portfolio={portfolio}
          />
        )}
      </div>

      {/* Professional Layout Specific Styles */}
      <style jsx>{`
        .professional-layout .professional-sections-wrapper > section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        
        .professional-layout .professional-sections-wrapper > section:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #d1d5db;
        }

        .professional-layout h2 {
          color: #1f2937;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 0.5rem;
        }

        .professional-layout .section-content {
          padding: 2rem;
        }
      `}</style>
    </BaseLayout>
  );
};

export default ProfessionalLayout;