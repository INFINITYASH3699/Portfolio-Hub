// frontend/components/portfolio-sections/AwardsSection.js
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ImageInput from '@/components/ui/ImageInput'; // For award image/badge
import { PlusCircle, Trash2 } from 'lucide-react';

const AwardsSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const awards = Array.isArray(data) ? data : [];

  const handleAwardChange = (index, field, value) => {
    const newAwards = [...awards];
    if (!newAwards[index]) newAwards[index] = {};
    newAwards[index] = { ...newAwards[index], [field]: value };
    onDataChange('awards', newAwards);
  };

  const addAward = () => {
    onDataChange('awards', [...awards, { title: '', organization: '', year: '', category: '', image: '', description: '' }]);
  };

  const removeAward = (indexToRemove) => {
    onDataChange('awards', awards.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="awards" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        Awards & Recognition
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addAward} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Award
          </Button>
        </div>
      )}

      {awards.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No awards to display.</p>
      ) : awards.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first award using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((award, index) => (
            <Card key={index} className="rounded-lg shadow-lg p-6 border border-border text-center">
              {isEditing && (
                <div className="flex justify-end p-2 bg-gray-50 border-b">
                  <Button variant="destructive" size="sm" onClick={() => removeAward(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <ImageInput
                    label="Award Image/Badge URL"
                    value={award.image}
                    onChange={(value) => handleAwardChange(index, 'image', value)}
                  />
                  <Input
                    placeholder="Award Title"
                    value={award.title || ''}
                    onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Organization"
                    value={award.organization || ''}
                    onChange={(e) => handleAwardChange(index, 'organization', e.target.value)}
                  />
                  <Input
                    placeholder="Year"
                    value={award.year || ''}
                    onChange={(e) => handleAwardChange(index, 'year', e.target.value)}
                  />
                  <Input
                    placeholder="Category (optional)"
                    value={award.category || ''}
                    onChange={(e) => handleAwardChange(index, 'category', e.target.value)}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={award.description || ''}
                    onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[60px] bg-card text-card-foreground"
                  />
                </div>
              ) : (
                <>
                  {award.image && (
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image src={award.image} alt={award.title || 'Award Image'} fill className="object-contain" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-1">{award.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{award.organization} - {award.year}</p>
                  {award.category && <p className="text-xs text-primary-light mb-2">{award.category}</p>}
                  {award.description && <p className="text-sm line-clamp-3">{award.description}</p>}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default AwardsSection;