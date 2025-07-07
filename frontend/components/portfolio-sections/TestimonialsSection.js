// frontend/components/portfolio-sections/TestimonialsSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ImageInput from '@/components/ui/ImageInput';
import { PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image'; // Ensure Image is imported here if used in non-editing view

const TestimonialsSection = ({ data, styling, isEditing, onDataChange, portfolioId, currentSection }) => { // <<<--- Accept new props
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const testimonials = Array.isArray(data) ? data : [];

  const handleTestimonialChange = (index, field, value) => {
    const newTestimonials = [...testimonials];
    if (!newTestimonials[index]) newTestimonials[index] = {};
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onDataChange('testimonials', newTestimonials);
  };

  const addTestimonial = () => {
    onDataChange('testimonials', [...testimonials, { name: '', role: '', testimonial: '', avatar: '', rating: 5 }]);
  };

  const removeTestimonial = (indexToRemove) => {
    onDataChange('testimonials', testimonials.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="testimonials" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        What People Say
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addTestimonial} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Testimonial
          </Button>
        </div>
      )}

      {testimonials.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No testimonials to display.</p>
      ) : testimonials.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first testimonial using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, index) => (
            <Card key={index} className="rounded-lg shadow-lg p-6 border border-border">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-3">
                  <ImageInput
                    label="Avatar URL"
                    value={test.avatar}
                    onChange={(value) => handleTestimonialChange(index, 'avatar', value)}
                    portfolioId={portfolioId}     // <<<--- Pass to ImageInput
                    currentSection={currentSection} // <<<--- Pass to ImageInput
                  />
                  <Input
                    placeholder="Client Name"
                    value={test.name || ''}
                    onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Client Role/Title"
                    value={test.role || ''}
                    onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                  />
                  <textarea
                    placeholder="Testimonial text"
                    value={test.testimonial || ''}
                    onChange={(e) => handleTestimonialChange(index, 'testimonial', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[100px] bg-card text-card-foreground"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rating (1-5)"
                    value={test.rating || ''}
                    onChange={(e) => handleTestimonialChange(index, 'rating', parseInt(e.target.value))}
                  />
                </div>
              ) : (
                <div className="text-center">
                  {test.avatar && (
                    <Image
                      src={test.avatar}
                      alt={test.name}
                      width={80}
                      height={80}
                      className="rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <p className="italic text-lg mb-4">"{test.testimonial}"</p>
                  <p className="font-semibold">{test.name}</p>
                  <p className="text-sm text-muted-foreground">{test.role}</p>
                  {test.rating > 0 && (
                    <div className="flex justify-center mt-2">
                      {Array.from({ length: test.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;