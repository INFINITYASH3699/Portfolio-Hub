// frontend/components/portfolio-sections/ClientsSection.js
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ImageInput from '@/components/ui/ImageInput'; // For client logo
import { PlusCircle, Trash2 } from 'lucide-react';

const ClientsSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const clients = Array.isArray(data) ? data : [];

  const handleClientChange = (index, field, value) => {
    const newClients = [...clients];
    if (!newClients[index]) newClients[index] = {};
    newClients[index] = { ...newClients[index], [field]: value };
    onDataChange('clients', newClients); // 'clients' is the data key
  };

  const addClient = () => {
    onDataChange('clients', [...clients, { name: '', logo: '', industry: '', testimonial: '' }]);
  };

  const removeClient = (indexToRemove) => {
    onDataChange('clients', clients.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="clients" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Clients
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addClient} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Client
          </Button>
        </div>
      )}

      {clients.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No clients to display.</p>
      ) : clients.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first client using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.map((client, index) => (
            <Card key={index} className="rounded-lg shadow-lg p-6 border border-border text-center">
              {isEditing && (
                <div className="flex justify-end mb-2">
                  <Button variant="destructive" size="sm" onClick={() => removeClient(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="space-y-3">
                  <ImageInput
                    label="Client Logo URL"
                    value={client.logo}
                    onChange={(value) => handleClientChange(index, 'logo', value)}
                  />
                  <Input
                    placeholder="Client Name"
                    value={client.name || ''}
                    onChange={(e) => handleClientChange(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Industry (optional)"
                    value={client.industry || ''}
                    onChange={(e) => handleClientChange(index, 'industry', e.target.value)}
                  />
                  <textarea
                    placeholder="Testimonial (optional)"
                    value={client.testimonial || ''}
                    onChange={(e) => handleClientChange(index, 'testimonial', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[60px] bg-card text-card-foreground"
                  />
                </div>
              ) : (
                <div>
                  {client.logo && (
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image src={client.logo} alt={client.name || 'Client Logo'} fill className="object-contain" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
                  {client.industry && <p className="text-sm text-muted-foreground mb-2">{client.industry}</p>}
                  {/* --- FIX: Use HTML entities for quotes --- */}
                  {client.testimonial && <p className="text-sm italic">&ldquo;{client.testimonial}&rdquo;</p>}
                  {/* --- END FIX --- */}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ClientsSection;