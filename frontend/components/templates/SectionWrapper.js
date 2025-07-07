// frontend/components/templates/SectionWrapper.js
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card'; // Assuming you have these UI components

const SectionWrapper = ({ 
  children, 
  sectionId, 
  isEditing = false, 
  previewMode = false,
  templateSectionConfig = {}, // From the template's sections array
  portfolioStyling = {} // Global styling from the portfolio
}) => {
  // Apply template-defined section layout styles
  const sectionLayoutClass = templateSectionConfig?.layout || ''; // e.g., 'centered', 'full-width'

  // Apply default padding/margin unless explicitly overridden by template or section styling
  const defaultPaddingClass = 'py-16'; 
  const defaultMarginClass = 'mb-0'; // Sections manage their own spacing usually

  // Determine background color and text color from global styling or section-specific styling
  const sectionBgColor = templateSectionConfig?.styling?.bgColor || portfolioStyling?.colors?.background || 'white';
  const sectionTextColor = templateSectionConfig?.styling?.textColor || portfolioStyling?.colors?.text || 'black';

  const commonSectionClasses = cn(
    "section",
    `section-${sectionId}`, // e.g., "section-hero"
    sectionLayoutClass, // Apply layout from template section config
    defaultPaddingClass,
    defaultMarginClass
  );

  // Styling for the editor experience
  const editorOverlayClasses = isEditing && !previewMode 
    ? "relative group border-2 border-dashed border-transparent hover:border-violet-400 focus-within:border-violet-500 transition-all duration-200" 
    : "";

  const editorLabelClasses = isEditing && !previewMode
    ? "absolute top-2 left-2 z-20 text-xs px-2 py-1 bg-violet-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
    : "hidden";

  return (
    <section 
      id={sectionId} 
      className={cn(commonSectionClasses, editorOverlayClasses)}
      style={{
        backgroundColor: sectionBgColor,
        color: sectionTextColor
      }}
    >
      {isEditing && !previewMode && (
        <span className={editorLabelClasses}>
          {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section
        </span>
      )}
      {children}
    </section>
  );
};

export default SectionWrapper;