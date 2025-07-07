// frontend/components/portfolio-sections/ExperienceSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // Assuming Button component

const ExperienceSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  // Ensure data is an array
  const experiences = Array.isArray(data) ? data : [];

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...experiences];
    if (!newExperiences[index]) newExperiences[index] = {};
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    onDataChange('experience', newExperiences);
  };

  const addExperience = () => {
    onDataChange('experience', [...experiences, { company: '', position: '', duration: '', description: '', startDate: '', endDate: '' }]);
  };

  const removeExperience = (indexToRemove) => {
    onDataChange('experience', experiences.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="experience" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Experience
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addExperience} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            Add New Experience
          </Button>
        </div>
      )}

      {experiences.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No experience to display.</p>
      ) : experiences.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first experience using the button above.</p>
      ) : (
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm p-6 border border-border">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeExperience(index)}>
                    Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  />
                  <Input
                    placeholder="Position"
                    value={exp.position || ''}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  />
                  <Input
                    placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                    value={exp.duration || ''}
                    onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                  />
                  <textarea
                    placeholder="Description / Responsibilities"
                    value={exp.description || ''}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[80px] bg-card text-card-foreground"
                  />
                  <Input
                    type="date"
                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    title="Start Date"
                  />
                  <Input
                    type="date"
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                    title="End Date (Optional)"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{exp.position} at {exp.company}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{exp.duration}</p>
                  <p className="text-base">{exp.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExperienceSection;