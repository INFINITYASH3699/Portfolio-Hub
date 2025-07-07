// frontend/components/portfolio-sections/ServicesSection.js
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PlusCircle, Trash2 } from 'lucide-react';

const ServicesSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const services = Array.isArray(data) ? data : [];

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    if (!newServices[index]) newServices[index] = {};
    newServices[index] = { ...newServices[index], [field]: value };
    onDataChange('services', newServices);
  };

  const addService = () => {
    onDataChange('services', [...services, { title: '', description: '', icon: '', price: '' }]);
  };

  const removeService = (indexToRemove) => {
    onDataChange('services', services.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="services" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Services
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addService} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Service
          </Button>
        </div>
      )}

      {services.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No services to display.</p>
      ) : services.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first service using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="rounded-lg shadow-lg p-6 border border-border">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeService(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Service Title (e.g., Web Design)"
                    value={service.title || ''}
                    onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                  />
                  <textarea
                    placeholder="Service Description"
                    value={service.description || ''}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[80px] bg-card text-card-foreground"
                  />
                  <Input
                    placeholder="Icon (e.g., Lucide icon name, or URL)"
                    value={service.icon || ''}
                    onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                  />
                  <Input
                    placeholder="Price (e.g., \$500, Contact for quote)"
                    value={service.price || ''}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  />
                </div>
              ) : (
                <div className="text-center">
                  {/* For actual icons, you'd dynamically import/render based on `icon` field */}
                  {service.icon && <div className="text-primary text-4xl mb-4">{service.icon}</div>} 
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  {service.price && <p className="text-lg font-bold">{service.price}</p>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ServicesSection;