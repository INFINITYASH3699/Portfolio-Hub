// frontend/components/portfolio-sections/BlogSection.js
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ImageInput from '@/components/ui/ImageInput'; // For blog post image
import { PlusCircle, Trash2 } from 'lucide-react';

const BlogSection = ({ data, styling, isEditing, onDataChange }) => {
  if (!data && !isEditing) return null;

  const bgColor = styling?.bgColor || 'var(--portfolio-background)';
  const textColor = styling?.textColor || 'var(--portfolio-text)';
  const headingColor = styling?.headingColor || 'var(--portfolio-primary)';

  const blogPosts = Array.isArray(data) ? data : [];

  const handlePostChange = (index, field, value) => {
    const newPosts = [...blogPosts];
    if (!newPosts[index]) newPosts[index] = {};
    newPosts[index] = { ...newPosts[index], [field]: value };
    onDataChange('blog', newPosts);
  };

  const addPost = () => {
    onDataChange('blog', [...blogPosts, { title: '', excerpt: '', image: '', publishDate: '', readTime: '', tags: [], url: '' }]);
  };

  const removePost = (indexToRemove) => {
    onDataChange('blog', blogPosts.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section 
      id="blog" 
      className="py-16 px-8 container mx-auto" 
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: 'var(--portfolio-font-body)' }}
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ color: headingColor, fontFamily: 'var(--portfolio-font-heading)' }}
      >
        My Blog
      </h2>

      {isEditing && (
        <div className="mb-8 text-center">
          <Button onClick={addPost} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Post
          </Button>
        </div>
      )}

      {blogPosts.length === 0 && !isEditing ? (
        <p className="text-center text-muted-foreground">No blog posts to display.</p>
      ) : blogPosts.length === 0 && isEditing ? (
        <p className="text-center text-muted-foreground">Add your first blog post using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="rounded-lg shadow-lg overflow-hidden border border-border">
              {isEditing && (
                <div className="flex justify-end p-2 bg-gray-50 border-b">
                  <Button variant="destructive" size="sm" onClick={() => removePost(index)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <ImageInput
                    label="Post Image URL"
                    value={post.image}
                    onChange={(value) => handlePostChange(index, 'image', value)}
                  />
                  <Input
                    placeholder="Post Title"
                    value={post.title || ''}
                    onChange={(e) => handlePostChange(index, 'title', e.target.value)}
                  />
                  <textarea
                    placeholder="Excerpt"
                    value={post.excerpt || ''}
                    onChange={(e) => handlePostChange(index, 'excerpt', e.target.value)}
                    className="w-full p-2 border rounded resize-y min-h-[80px] bg-card text-card-foreground"
                  />
                  <Input
                    type="date"
                    placeholder="Publish Date"
                    value={post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handlePostChange(index, 'publishDate', e.target.value)}
                  />
                  <Input
                    placeholder="Read Time (e.g., 5 min read)"
                    value={post.readTime || ''}
                    onChange={(e) => handlePostChange(index, 'readTime', e.target.value)}
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={(post.tags || []).join(', ')}
                    onChange={(e) => handlePostChange(index, 'tags', e.target.value.split(',').map(tag => tag.trim()))}
                  />
                  <Input
                    placeholder="Post URL"
                    value={post.url || ''}
                    onChange={(e) => handlePostChange(index, 'url', e.target.value)}
                  />
                </div>
              ) : (
                <>
                  {post.image && (
                    <div className="relative aspect-video w-full">
                      <Image src={post.image} alt={post.title || 'Blog Post Image'} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString() : ''}</span>
                      <span>{post.readTime}</span>
                    </div>
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-4 block text-sm">
                        Read More
                      </a>
                    )}
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

export default BlogSection;