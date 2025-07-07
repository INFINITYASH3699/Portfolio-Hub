// frontend/components/portfolio-sections/HeroSection.js
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import ImageInput from '@/components/ui/ImageInput';

const HeroSection = ({ data, styling, isEditing, onDataChange, portfolioId, currentSection }) => {
  if (!data && !isEditing) return null;

  const bgImageStyle = styling?.bgImage ? { backgroundImage: `url(${styling.bgImage})` } : {};
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const textAlign = styling?.textAlign || 'center';
  const bgColor = styling?.bgColor || 'var(--portfolio-background)';

  const handleFieldChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange('hero', newData);
  };

  const handleSocialLinkChange = (platform, value) => {
    const newSocialLinks = { ...data.socialLinks, [platform]: value };
    const newData = { ...data, socialLinks: newSocialLinks };
    onDataChange('hero', newData);
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center text-center p-8 text-white"
      style={{ ...bgImageStyle, color: textColor, textAlign: textAlign, backgroundColor: bgColor }}
    >
      {styling?.overlay && <div className="absolute inset-0 bg-black/50 z-0"></div>}

      <div className="relative z-10 space-y-4">
        {isEditing ? (
          <div className="mb-8">
            <ImageInput
              label="Profile Image URL"
              value={data.profileImage}
              onChange={(value) => handleFieldChange('profileImage', value)}
              portfolioId={portfolioId}
              currentSection={currentSection}
              imageKey="profileImage" // <<<--- NEW: Pass the specific key for Hero image
            />
          </div>
        ) : (
          data.profileImage && (
            <Image
              key={data.profileImage} // Ensure key is here for non-editing view too
              src={data.profileImage}
              alt={data.name || 'Profile'}
              width={120}
              height={120}
              className="rounded-full mx-auto shadow-lg"
            />
          )
        )}
        
        {isEditing ? (
          <Input 
            value={data.name || ''} 
            onChange={(e) => handleFieldChange('name', e.target.value)} 
            placeholder="Your Name" 
            className="text-4xl md:text-6xl font-bold leading-tight text-center bg-transparent border-b border-gray-400 focus:border-white"
            style={{ fontFamily: 'var(--portfolio-font-heading)', color: textColor }}
          />
        ) : (
          <h1 
            className="text-4xl md:text-6xl font-bold leading-tight" 
            style={{ fontFamily: 'var(--portfolio-font-heading)' }}
          >
            {data.name}
          </h1>
        )}

        {isEditing ? (
          <Input 
            value={data.title || ''} 
            onChange={(e) => handleFieldChange('title', e.target.value)} 
            placeholder="Your Title" 
            className="text-xl md:text-2xl text-center bg-transparent border-b border-gray-400 focus:border-white"
            style={{ fontFamily: 'var(--portfolio-font-body)', color: textColor }}
          />
        ) : (
          <p 
            className="text-xl md:text-2xl text-muted-foreground"
            style={{ fontFamily: 'var(--portfolio-font-body)' }}
          >
            {data.title}
          </p>
        )}

        {data.description && (
          isEditing ? (
            <textarea
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="A short description about yourself..."
              className="w-full max-w-3xl mx-auto text-lg md:text-xl text-center bg-transparent border-b border-gray-400 focus:border-white resize-y min-h-[80px]"
              style={{ fontFamily: 'var(--portfolio-font-body)', color: textColor }}
            />
          ) : (
            <p 
              className="max-w-3xl mx-auto text-lg md:text-xl"
              style={{ fontFamily: 'var(--portfolio-font-body)' }}
            >
              {data.description}
            </p>
          )
        )}

        {isEditing ? (
          <div className="flex flex-col items-center gap-2 mt-4">
            <h4 className="text-lg font-semibold">Social Links:</h4>
            <Input 
              value={data.socialLinks?.linkedin || ''} 
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} 
              placeholder="LinkedIn URL" 
              className="w-full max-w-md bg-transparent border-b border-gray-400 focus:border-white"
              style={{ color: textColor }}
            />
            <Input 
              value={data.socialLinks?.github || ''} 
              onChange={(e) => handleSocialLinkChange('github', e.target.value)} 
              placeholder="GitHub URL" 
              className="w-full max-w-md bg-transparent border-b border-gray-400 focus:border-white"
              style={{ color: textColor }}
            />
            {/* Add more social link inputs as needed */}
          </div>
        ) : (
          data.socialLinks && (
            <div className="flex justify-center gap-4 mt-4">
              {data.socialLinks.linkedin && <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors">LinkedIn</a>}
              {data.socialLinks.github && <a href={data.socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors">GitHub</a>}
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default HeroSection;