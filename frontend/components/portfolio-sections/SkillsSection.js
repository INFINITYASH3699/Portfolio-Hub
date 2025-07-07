// frontend/components/portfolio-sections/SkillsSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // Assuming Button component

const SkillsSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  // Ensure data is an array, especially when initializing
  const skills = Array.isArray(data) ? data : [];

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...skills];
    if (!newSkills[index]) newSkills[index] = {}; // Initialize if new
    newSkills[index] = { ...newSkills[index], [field]: value };
    onDataChange('skills', newSkills);
  };

  const addSkill = () => {
    onDataChange('skills', [...skills, { skillName: '', proficiency: 'Intermediate', icon: '' }]);
  };

  const removeSkill = (indexToRemove) => {
    onDataChange('skills', skills.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="skills" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Skills
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addSkill} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            Add New Skill
          </Button>
        </div>
      )}

      {skills.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No skills to display.</p>
      ) : skills.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first skill using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm p-6 border border-border">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeSkill(index)}>
                    Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Skill Name (e.g., React)"
                    value={skill.skillName || ''}
                    onChange={(e) => handleSkillChange(index, 'skillName', e.target.value)}
                  />
                  <Input
                    placeholder="Proficiency (e.g., Expert, Intermediate)"
                    value={skill.proficiency || ''}
                    onChange={(e) => handleSkillChange(index, 'proficiency', e.target.value)}
                  />
                  <Input
                    placeholder="Icon URL (optional)"
                    value={skill.icon || ''}
                    onChange={(e) => handleSkillChange(index, 'icon', e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {skill.icon && <img src={skill.icon} alt={skill.skillName} className="h-8 w-8 object-contain" />}
                  <div>
                    <h3 className="text-lg font-semibold">{skill.skillName}</h3>
                    <p className="text-muted-foreground text-sm">{skill.proficiency}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SkillsSection;