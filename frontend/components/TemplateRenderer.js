// frontend/components/TemplateRenderer.js
// (This file was previously PortfolioRenderer.js - please rename it)

import React from 'react';
import HeroSection from './portfolio-sections/HeroSection';
import AboutSection from './portfolio-sections/AboutSection';
import ProjectsSection from './portfolio-sections/ProjectsSection';
import ContactSection from './portfolio-sections/ContactSection';
import SkillsSection from './portfolio-sections/SkillsSection';
import ExperienceSection from './portfolio-sections/ExperienceSection';
import EducationSection from './portfolio-sections/EducationSection';
import TestimonialsSection from './portfolio-sections/TestimonialsSection';
import ServicesSection from './portfolio-sections/ServicesSection';
import BlogSection from './portfolio-sections/BlogSection';
import AwardsSection from './portfolio-sections/AwardsSection';
import ProcessSection from './portfolio-sections/ProcessSection';
import ClientsSection from './portfolio-sections/ClientsSection';

// Import layout selector
import { getLayoutComponent } from './templates/TemplateLayoutSelector';
import SectionWrapper from './templates/SectionWrapper'; // New component
import { cn } from '@/lib/utils'; // Make sure cn is imported

const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection, // Ensure 'portfolio' type maps to ProjectsSection in backend template logic
  contact: ContactSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  testimonials: TestimonialsSection,
  services: ServicesSection,
  blog: BlogSection,
  awards: AwardsSection,
  process: ProcessSection,
  clients: ClientsSection,
  // Add other sections here as you create them
};

const getSectionDataKey = (sectionId) => {
  switch (sectionId) {
    case 'portfolio': // Template section ID
      return 'projects'; // Data key in customData
    default:
      return sectionId; // Otherwise, the section ID is the same as the data key
  }
};

const PlaceholderSection = ({ sectionId, isEditing }) => (
  <section className="py-8 text-center text-muted-foreground bg-gray-100 border-y border-dashed border-gray-300">
    {/* --- FIX: Escape apostrophes --- */}
    <p>Editor for &apos;{sectionId}&apos; section is coming soon!</p>
    {/* --- END FIX --- */}
    {isEditing && <p className="text-sm">Data Key: {getSectionDataKey(sectionId)}</p>}
  </section>
);

const TemplateRenderer = ({ 
  portfolio, 
  template, // Now explicitly pass template data
  isEditing = false, 
  onDataChange, 
  previewMode = false 
}) => {
  if (!portfolio || !portfolio.activeSections || !portfolio.customData || !portfolio.customStyling) {
    if (isEditing) {
      return (
        <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-md">
          <p>Error: Invalid portfolio data for rendering. Please ensure portfolio, activeSections, customData, and customStyling are available.</p>
        </div>
      );
    }
    return null; // Don't render anything if essential data is missing in public view
  }

  // Determine which layout to use based on the template
  const LayoutComponent = getLayoutComponent(template?.layout?.type);

  // If activeSections is empty, use sections defined in the template
  const sectionsToRender = portfolio.activeSections.length > 0
    ? portfolio.activeSections
    : template?.sections?.map(s => s.id) || [];

  return (
    <LayoutComponent
      template={template} // Pass the full template object to the layout
      portfolio={portfolio} // Pass full portfolio for template parts (navbar/footer data)
      isEditing={isEditing}
      onDataChange={onDataChange} // Allow layout to trigger changes if it has editable parts
    >
      {sectionsToRender.map(sectionId => {
        const SectionComponent = sectionComponents[sectionId] || (sectionId === 'portfolio' ? ProjectsSection : undefined);
        const dataKey = getSectionDataKey(sectionId); // Determine the actual data key for customData
        const sectionData = portfolio.customData[dataKey]; // Use dataKey to get data

        // Get styling specific to this section from template.sections or portfolio.customStyling
        const templateSectionConfig = template?.sections?.find(s => s.id === sectionId);
        const sectionStyling = { 
          ...portfolio.customStyling, // Apply global styling first
          ...(templateSectionConfig?.styling || {}), // Then apply template-specific section styling
          ...(portfolio.customStyling?.[sectionId] || {}) // Finally, allow user overrides
        };

        if (SectionComponent) {
          return (
            <SectionWrapper
              key={sectionId} // Use sectionId for unique key
              sectionId={sectionId}
              isEditing={isEditing}
              previewMode={previewMode}
              templateSectionConfig={templateSectionConfig} // Pass full template section config
              portfolioStyling={portfolio.customStyling} // Pass global portfolio styling to wrapper
            >
              <SectionComponent
                data={sectionData}
                styling={sectionStyling} // Pass combined styling
                isEditing={isEditing && !previewMode} // Only editable if not in pure preview
                onDataChange={(key, newData) => onDataChange(dataKey, newData)} // Ensure onDataChange uses dataKey
                portfolioId={portfolio._id}
                currentSection={dataKey} // Pass dataKey as currentSection
              />
            </SectionWrapper>
          );
        }
        if (isEditing) {
          return <PlaceholderSection key={sectionId} sectionId={sectionId} isEditing={isEditing} />;
        }
        return null;
      })}
    </LayoutComponent>
  );
};

export default TemplateRenderer;