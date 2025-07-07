// frontend/components/PortfolioRenderer.js
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

const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
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

const PlaceholderSection = ({ sectionId }) => (
  <section className="py-8 text-center text-muted-foreground bg-gray-100 border-y border-dashed border-gray-300">
    <p>Editor for '{sectionId}' section is coming soon!</p>
    <p className="text-sm">Data: {sectionId}</p>
  </section>
);

const PortfolioRenderer = ({ portfolio, isEditing = false, onDataChange, portfolioId }) => {
  if (!portfolio || !portfolio.activeSections || !portfolio.customData || !portfolio.customStyling) {
    return <div>Error: Invalid portfolio data.</div>;
  }

  const sectionsToRender = portfolio.activeSections.length > 0
    ? portfolio.activeSections
    : portfolio.templateId?.sections?.map(s => s.id) || [];

  return (
    <>
      {sectionsToRender.map(sectionId => {
        const SectionComponent = sectionComponents[sectionId] || (sectionId === 'portfolio' ? ProjectsSection : undefined);
        const dataKey = getSectionDataKey(sectionId); // Determine the actual data key for customData
        const sectionData = portfolio.customData[dataKey]; // Use dataKey to get data

        const sectionStyling = portfolio.customStyling[sectionId] || {};

        if (SectionComponent) {
          return (
            <SectionComponent
              key={sectionId} // Keep sectionId as key for React list rendering
              data={sectionData} // Pass data from customData[dataKey]
              styling={{ ...portfolio.customStyling, ...sectionStyling }}
              isEditing={isEditing}
              onDataChange={(key, newData) => onDataChange(dataKey, newData)} // Ensure onDataChange uses dataKey
              portfolioId={portfolioId}
              currentSection={dataKey} // <<<--- CRITICAL FIX: Pass dataKey as currentSection
            />
          );
        }
        if (isEditing) {
          return <PlaceholderSection key={sectionId} sectionId={sectionId} />;
        }
        return null;
      })}
    </>
  );
};

export default PortfolioRenderer;