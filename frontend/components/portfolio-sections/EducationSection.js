// frontend/components/portfolio-sections/EducationSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // Assuming Button component

const EducationSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  // Ensure data is an array
  const educationEntries = Array.isArray(data) ? data : [];

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...educationEntries];
    if (!newEducation[index]) newEducation[index] = {};
    newEducation[index] = { ...newEducation[index], [field]: value };
    onDataChange('education', newEducation);
  };

  const addEducation = () => {
    onDataChange('education', [...educationEntries, { degree: '', institution: '', startDate: '', endDate: '', description: '' }]);
  };

  const removeEducation = (indexToRemove) => {
    onDataChange('education', educationEntries.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="education" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Education
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addEducation} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            Add New Education
          </Button>
        </div>
      )}

      {educationEntries.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No education to display.</p>
      ) : educationEntries.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first education entry using the button above.</p>
      ) : (
        <div className="space-y-8">
          {educationEntries.map((edu, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm p-6 border border-border">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeEducation(index)}>
                    Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Degree (e.g., B.Tech in CS)"
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  />
                  <Input
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                    title="Start Date"
                  />
                  <Input
                    type="date"
                    value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                    title="End Date (Optional)"
                  />
                  <textarea
                    placeholder="Description of studies..."
                    value={edu.description || ''}
                    onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[60px] bg-card text-card-foreground"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{edu.degree} from {edu.institution}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </p>
                  <p className="text-base">{edu.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default EducationSection;