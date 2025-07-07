// frontend/components/portfolio-sections/ProcessSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PlusCircle, Trash2 } from 'lucide-react';

const ProcessSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const processSteps = Array.isArray(data) ? data : [];

  const handleStepChange = (index, field, value) => {
    const newSteps = [...processSteps];
    if (!newSteps[index]) newSteps[index] = {};
    newSteps[index] = { ...newSteps[index], [field]: value };
    onDataChange('process', newSteps); // 'process' is the data key
  };

  const addStep = () => {
    onDataChange('process', [...processSteps, { title: '', description: '', icon: '' }]);
  };

  const removeStep = (indexToRemove) => {
    onDataChange('process', processSteps.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="process" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Process
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addStep} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Step
          </Button>
        </div>
      )}

      {processSteps.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No process steps to display.</p>
      ) : processSteps.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first process step using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processSteps.map((step, index) => (
            <Card key={index} className="rounded-lg shadow-lg p-6 border border-border text-center">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeStep(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Step Title"
                    value={step.title || ''}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  />
                  <textarea
                    placeholder="Step Description"
                    value={step.description || ''}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[60px] bg-card text-card-foreground"
                  />
                  <Input
                    placeholder="Icon (e.g., Lucide icon name, or URL)"
                    value={step.icon || ''}
                    onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  {step.icon && <div className="text-primary text-4xl mb-4">{step.icon}</div>}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProcessSection;