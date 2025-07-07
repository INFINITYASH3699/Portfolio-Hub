// frontend/components/portfolio-sections/ProjectsSection.js
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ImageInput from '@/components/ui/ImageInput';
import { PlusCircle, Trash2 } from 'lucide-react';

const ProjectsSection = ({ data, styling, isEditing, onDataChange, portfolioId, currentSection }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const projects = Array.isArray(data) ? data : [];

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...projects];
    if (!newProjects[index]) newProjects[index] = {};
    newProjects[index] = { ...newProjects[index], [field]: value };
    onDataChange('projects', newProjects); // 'projects' is the data key
  };

  const handleTechnologiesChange = (index, e) => {
    const value = e.target.value;
    const newTechnologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    handleProjectChange(index, 'technologies', newTechnologies);
  };

  const addProject = () => {
    // When adding a new project, ensure it has an 'image' field, even if empty,
    // so the ImageInput can bind to it.
    const newProject = {
      title: '',
      description: '',
      image: '', // Initialize image field
      technologies: [],
      liveUrl: '',
      githubUrl: '',
    };
    onDataChange('projects', [...projects, newProject]);
  };

  const removeProject = (indexToRemove) => {
    const newProjects = projects.filter((_, index) => index !== indexToRemove);
    onDataChange('projects', newProjects);
  };

  return (
    <section 
      id="projects" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Projects
      </h2>
      
      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addProject} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Project
          </Button>
        </div>
      )}

      {projects.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No projects to display.</p>
      ) : projects.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first project using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="rounded-lg shadow-lg overflow-hidden border border-border">
              {isEditing && (
                <div className="flex justify-end p-2 bg-gray-50 border-b">
                  <Button variant="destructive" size="sm" onClick={() => removeProject(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <ImageInput
                    label="Project Image URL"
                    value={project.image} // Pass current project image URL
                    onChange={(value) => handleProjectChange(index, 'image', value)} // Update specific project image
                    portfolioId={portfolioId}
                    currentSection={currentSection}
                    imageKey="image" // The field name within the project object
                    itemIndex={index} // <<<--- CRITICAL: Pass the index of this project in the array
                  />
                  <Input
                    placeholder="Project Title"
                    value={project.title || ''}
                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                  />
                  <textarea
                    placeholder="Project Description"
                    value={project.description || ''}
                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[80px] bg-card text-card-foreground"
                  />
                  <Input
                    placeholder="Technologies (comma-separated)"
                    value={(project.technologies || []).join(', ')}
                    onChange={(e) => handleTechnologiesChange(index, e)}
                  />
                  <Input
                    placeholder="Live URL (e.g., https://example.com)"
                    value={project.liveUrl || ''}
                    onChange={(e) => handleProjectChange(index, 'liveUrl', e.target.value)}
                  />
                  <Input
                    placeholder="GitHub URL (e.g., https://github.com/user/repo)"
                    value={project.githubUrl || ''}
                    onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)}
                  />
                </div>
              ) : (
                <>
                  {project.image && (
                    <div className="relative aspect-video w-full">
                      <Image key={project.image} src={project.image} alt={project.title || 'Project Image'} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: headingColor }}>{project.title}</h3>
                    {project.description && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies && project.technologies.map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full">{tech}</span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary border px-3 py-1 rounded-full hover:underline text-sm">
                          View Live
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary border px-3 py-1 rounded-full hover:underline text-sm">
                          GitHub
                        </a>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectsSection;