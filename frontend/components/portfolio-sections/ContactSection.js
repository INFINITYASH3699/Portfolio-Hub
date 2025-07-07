// frontend/components/portfolio-sections/ContactSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // Assuming Button is available

const ContactSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const handleFieldChange = (field, value) => {
    onDataChange('contact', { ...data, [field]: value });
  };

  const handleSocialLinkChange = (platform, value) => {
    onDataChange('contact', { 
      ...data, 
      socialLinks: { 
        ...data.socialLinks, 
        [platform]: value 
      } 
    });
  };

  return (
    <section 
      id="contact" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        Get In Touch
      </h2>
      <div className="max-w-2xl mx-auto text-center space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-left">Email:</label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-card text-card-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Phone:</label>
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-card text-card-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Location:</label>
              <Input
                value={data.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="City, Country"
                className="w-full bg-card text-card-foreground"
              />
            </div>
            <div className="space-y-2 pt-4">
              <label className="block text-sm font-medium text-left">Social Links:</label>
              <Input
                value={data.socialLinks?.linkedin || ''}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="LinkedIn URL"
                className="w-full bg-card text-card-foreground"
              />
              <Input
                value={data.socialLinks?.github || ''}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="GitHub URL"
                className="w-full bg-card text-card-foreground"
              />
              <Input
                value={data.socialLinks?.twitter || ''}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="Twitter URL"
                className="w-full bg-card text-card-foreground"
              />
              <Input
                value={data.socialLinks?.instagram || ''}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="Instagram URL"
                className="w-full bg-card text-card-foreground"
              />
            </div>
          </div>
        ) : (
          <>
            {data.email && (
              <p className="text-lg">Email: <a href={`mailto:${data.email}`} className="text-primary hover:underline">{data.email}</a></p>
            )}
            {data.phone && (
              <p className="text-lg">Phone: <a href={`tel:${data.phone}`} className="text-primary hover:underline">{data.phone}</a></p>
            )}
            {data.location && (
              <p className="text-lg">Location: {data.location}</p>
            )}
            {data.socialLinks && (
              <div className="flex justify-center gap-6 mt-6">
                {data.socialLinks.linkedin && <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-75 transition-opacity">LinkedIn</a>}
                {data.socialLinks.github && <a href={data.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-75 transition-opacity">GitHub</a>}
                {data.socialLinks.twitter && <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-75 transition-opacity">Twitter</a>}
                {data.socialLinks.instagram && <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-75 transition-opacity">Instagram</a>}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ContactSection;