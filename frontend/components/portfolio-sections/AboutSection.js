// frontend/components/portfolio-sections/AboutSection.js
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button'; // Assuming you have Button component

const AboutSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const handleFieldChange = (field, value) => {
    onDataChange('about', { ...data, [field]: value });
  };

  // Simplified handler for skills array (for demonstration)
  // In a full editor, this would be a more complex list editor.
  const handleSkillsChange = (e) => {
    const value = e.target.value;
    onDataChange('about', { ...data, skills: value.split(',').map(s => s.trim()) });
  };

  // Simplified handler for education array (for demonstration)
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(data.education || [])];
    if (!newEducation[index]) newEducation[index] = {};
    newEducation[index] = { ...newEducation[index], [field]: value };
    onDataChange('about', { ...data, education: newEducation });
  };

  const addEducationEntry = () => {
    onDataChange('about', { 
      ...data, 
      education: [...(data.education || []), { degree: '', institution: '', startDate: '', endDate: '', description: '' }] 
    });
  };

  const removeEducationEntry = (indexToRemove) => {
    onDataChange('about', { 
      ...data, 
      education: (data.education || []).filter((_, index) => index !== indexToRemove) 
    });
  };

  return (
    <section 
      id="about" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-8 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        About Me
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {data.description && (
          isEditing ? (
            <textarea
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full p-2 border rounded resize-y min-h-[120px] bg-card text-card-foreground"
            />
          ) : (
            <p className="text-lg">{data.description}</p>
          )
        )}
        
        {data.experience && (
          isEditing ? (
            <Input
              value={data.experience || ''}
              onChange={(e) => handleFieldChange('experience', e.target.value)}
              placeholder="Your professional experience summary"
              className="w-full p-2 border rounded bg-card text-card-foreground"
            />
          ) : (
            <p className="text-lg font-semibold">Experience: {data.experience}</p>
          )
        )}
        
        {data.skills && (
          <div>
            <h3 className="text-2xl font-bold mt-8 mb-4">Skills</h3>
            {isEditing ? (
              <Input
                value={(data.skills || []).join(', ')}
                onChange={handleSkillsChange}
                placeholder="Comma-separated skills (e.g., React, Node.js, MongoDB)"
                className="w-full p-2 border rounded bg-card text-card-foreground"
              />
            ) : (
              data.skills.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>
        )}
        
        {data.education && (
          <div>
            <h3 className="text-2xl font-bold mt-8 mb-4">Education</h3>
            {isEditing ? (
              <div className="space-y-4">
                {(data.education || []).map((edu, index) => (
                  <Card key={index} className="p-4 border rounded">
                    <div className="space-y-2">
                      <Input
                        value={edu.degree || ''}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        placeholder="Degree (e.g., B.Tech in CS)"
                      />
                      <Input
                        value={edu.institution || ''}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        placeholder="Institution"
                      />
                      <Input
                        type="date"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        placeholder="Start Date"
                      />
                      <Input
                        type="date"
                        value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        placeholder="End Date (Optional)"
                      />
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                        placeholder="Description of studies..."
                        className="w-full p-2 border rounded resize-y min-h-[60px] bg-card text-card-foreground"
                      />
                      <Button variant="destructive" size="sm" onClick={() => removeEducationEntry(index)}>
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button onClick={addEducationEntry} variant="outline" className="w-full">
                  Add Education
                </Button>
              </div>
            ) : (
              data.education.length > 0 && (
                data.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-lg font-semibold">{edu.degree} from {edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </p>
                    <p className="text-base">{edu.description}</p>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;