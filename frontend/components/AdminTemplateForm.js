// frontend/components/AdminTemplateForm.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import ImageInput from '@/components/ui/ImageInput';
import api from '@/lib/axios';
import { Loader2, PlusCircle, Save, XCircle } from 'lucide-react';
import NextImage from 'next/image'; // Aliased to NextImage to avoid conflict

// Template categories from your backend/models/Template.js
const templateCategories = ['developer', 'designer', 'photographer', 'writer', 'architect', 'artist', 'other'];

const AdminTemplateForm = ({ template = null, onSaveSuccess, onCancel, user }) => { // <<<--- NEW: Accept user prop
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    _id: template?._id || null,
    name: template?.name || '',
    slug: template?.slug || '',
    category: template?.category || templateCategories[0],
    isPremium: template?.isPremium || false,
    price: template?.price || 0,
    thumbnail: template?.thumbnail || '',
    previewImages: template?.previewImages || [],
    sections: template?.sections || [],
    customizationOptions: template?.customizationOptions || {},
    tags: template?.tags?.join(', ') || '',
    isActive: template?.isActive ?? true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewImageFiles, setPreviewImageFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        _id: template._id,
        name: template.name || '',
        slug: template.slug || '',
        category: template.category || templateCategories[0],
        isPremium: template.isPremium || false,
        price: template.isPremium ? (template.price || 0) : 0,
        thumbnail: template.thumbnail || '',
        previewImages: template.previewImages || [],
        sections: JSON.stringify(template.sections || []),
        customizationOptions: JSON.stringify(template.customizationOptions || {}),
        tags: template.tags?.join(', ') || '',
        isActive: template.isActive ?? true,
      });
      setThumbnailFile(null);
      setPreviewImageFiles([]);
    } else {
      setFormData({
        _id: null,
        name: '', slug: '', category: templateCategories[0], isPremium: false, price: 0,
        thumbnail: '', previewImages: [], sections: '[]', customizationOptions: '{}',
        tags: '', isActive: true,
      });
      setThumbnailFile(null);
      setPreviewImageFiles([]);
    }
  }, [template]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageFileChange = useCallback((file, type) => {
    if (type === 'thumbnail') {
      setThumbnailFile(file);
      setFormData(prev => ({ ...prev, thumbnail: file ? URL.createObjectURL(file) : '' }));
    } else if (type === 'previewImages') {
      if (file) {
          setPreviewImageFiles(prev => [...prev, file]);
      }
    }
  }, []);

  const handleRemovePreviewImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    for (const key in formData) {
      if (key !== '_id' && key !== 'thumbnail' && key !== 'previewImages' && key !== 'tags' && key !== 'sections' && key !== 'customizationOptions') {
        data.append(key, formData[key]);
      }
    }
    data.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)));
    try {
        JSON.parse(formData.sections);
        data.append('sections', formData.sections);
    } catch (error) {
        toast({ title: "Validation Error", description: "Sections must be valid JSON.", variant: "destructive" });
        setIsSaving(false);
        return;
    }
    try {
        JSON.parse(formData.customizationOptions);
        data.append('customizationOptions', formData.customizationOptions);
    } catch (error) {
        toast({ title: "Validation Error", description: "Customization Options must be valid JSON.", variant: "destructive" });
        setIsSaving(false);
        return;
    }


    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    } else if (formData.thumbnail === '' && template) {
      data.append('thumbnail', '');
    }

    previewImageFiles.forEach(file => {
      data.append('previewImages', file);
    });
    
    if (formData.previewImages.length > 0) {
        data.append('existingPreviewImages', JSON.stringify(formData.previewImages));
    } else if (template && template.previewImages.length > 0 && formData.previewImages.length === 0 && previewImageFiles.length === 0) {
        data.append('existingPreviewImages', '[]');
    }
    
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      let res;
      if (formData._id) {
        res = await api.put(`/api/templates/${formData._id}`, data, config);
        toast({ title: "Template Updated", description: `${res.data.name} updated successfully.`, variant: "success" });
      } else {
        res = await api.post('/api/templates', data, config);
        toast({ title: "Template Created", description: `${res.data.name} created successfully.`, variant: "success" });
      }
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to save template:", error.response?.data || error);
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || "An error occurred while saving the template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, thumbnailFile, previewImageFiles, onSaveSuccess, toast, template]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{template ? `Edit Template: ${template.name}` : 'Create New Template'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Unique URL identifier)</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Is Premium */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                name="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
              />
              <Label htmlFor="isPremium">Premium Template</Label>
            </div>
            {/* Price (only if premium) */}
            {formData.isPremium && (
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required={formData.isPremium}
                  min="0"
                />
              </div>
            )}
            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active (Visible to users)</Label>
            </div>
          </div>

          <hr />

          {/* Thumbnail Image */}
          <div className="space-y-2">
            <Label>Thumbnail Image</Label>
            <p className="text-sm text-muted-foreground">This is the main image shown in the template gallery.</p>
            <ImageInput
                label="Thumbnail URL"
                value={formData.thumbnail}
                onChange={(url) => {
                    setFormData(prev => ({ ...prev, thumbnail: url }));
                    setThumbnailFile(null);
                }}
                portfolioId={user?._id} // <<<--- NOW `user` IS DEFINED
                currentSection="template-thumbnail"
            />
            <Label htmlFor="thumbnailFileInput" className="block text-sm font-medium text-gray-700 mt-2">Or upload directly:</Label>
            <Input
              id="thumbnailFileInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageFileChange(e.target.files[0], 'thumbnail')}
              className="file:text-primary file:bg-primary-foreground file:border-none file:rounded-md file:py-1 file:px-3 file:mr-2 cursor-pointer"
            />
          </div>

          <hr />

          {/* Preview Images */}
          <div className="space-y-2">
            <Label>Preview Images</Label>
            <p className="text-sm text-muted-foreground">Additional images showing different aspects or sections of the template.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Existing preview images */}
              {formData.previewImages.map((imgUrl, index) => (
                <div key={`existing-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
                  <NextImage src={imgUrl} alt={`Preview ${index}`} fill objectFit="cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemovePreviewImage(index)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {/* New files to be uploaded */}
              {previewImageFiles.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
                  <NextImage src={URL.createObjectURL(file)} alt={`New Preview ${index}`} fill objectFit="cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => setPreviewImageFiles(prev => prev.filter((_, i) => i !== index))}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="relative aspect-video rounded-md overflow-hidden border-2 border-dashed flex items-center justify-center p-4">
                <Label htmlFor="previewImageUpload" className="cursor-pointer text-muted-foreground text-center">
                  <PlusCircle className="h-8 w-8 mx-auto mb-2" />
                  Add Image
                </Label>
                <Input
                  id="previewImageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files[0], 'previewImages')}
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Sections (JSON editor for now) */}
          <div className="space-y-2">
            <Label htmlFor="sections">Sections (JSON Array)</Label>
            <p className="text-sm text-muted-foreground">Define the structure of the template sections as a JSON array.</p>
            <textarea
              id="sections"
              name="sections"
              value={formData.sections}
              onChange={handleChange}
              rows="10"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
              placeholder='[{"id":"hero", "type":"hero", "isRequired":true, "fields":["name", "title"]}]'
              required
            />
          </div>

          {/* Customization Options (JSON editor for now) */}
          <div className="space-y-2">
            <Label htmlFor="customizationOptions">Customization Options (JSON Object)</Label>
            <p className="text-sm text-muted-foreground">Define available colors, fonts, layouts for this template as a JSON object.</p>
            <textarea
              id="customizationOptions"
              name="customizationOptions"
              value={formData.customizationOptions}
              onChange={handleChange}
              rows="10"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
              placeholder='{"colors":["#color1", "#color2"], "fonts":["Font1", "Font2"]}'
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., modern, portfolio, dark-theme"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {isSaving ? (
                <>Saving... <Loader2 className="h-4 w-4 ml-2 animate-spin" /></>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Template</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminTemplateForm;