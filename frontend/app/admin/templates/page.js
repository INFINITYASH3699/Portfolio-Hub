// frontend/app/admin/templates/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { PlusCircle, Trash2, Edit, Loader2, Award as AwardIcon } from 'lucide-react';
import Image from 'next/image';
import AdminTemplateForm from '@/components/AdminTemplateForm';
import { Badge } from '@/components/ui/Badge';

export default function AdminTemplatesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Get user here
  const router = useRouter();
  const { toast } = useToast();
  
  const hasCheckedAuthAndRedirected = useRef(false);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    if (!authLoading && !hasCheckedAuthAndRedirected.current) {
      if (!isAuthenticated) {
        console.log("AdminTemplatesPage: Not authenticated, redirecting to signin.");
        router.push('/auth/signin');
        hasCheckedAuthAndRedirected.current = true;
      } else if (user && !user.isAdmin) {
        console.log("AdminTemplatesPage: Authenticated but not admin, showing toast and redirecting.");
        toast({
          title: "Unauthorized",
          description: "You do not have administrative access.",
          variant: "destructive",
        });
        router.push('/dashboard');
        hasCheckedAuthAndRedirected.current = true;
      } else if (user && user.isAdmin) {
        hasCheckedAuthAndRedirected.current = true;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchTemplates = useCallback(async () => {
    if (!authLoading && isAuthenticated && user?.isAdmin && hasCheckedAuthAndRedirected.current) {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/api/templates');
        setTemplates(response.data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingTemplates(false);
      }
    } else if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLoadingTemplates(false);
    }
  }, [isAuthenticated, authLoading, user, toast]);


  useEffect(() => {
    if (hasCheckedAuthAndRedirected.current && isAuthenticated && user?.isAdmin) {
        fetchTemplates();
    }
  }, [isAuthenticated, user, fetchTemplates]);


  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`Are you sure you want to delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/templates/${templateId}`);
      toast({
        title: "Template Deleted",
        description: `"${templateName}" has been deleted.`,
        variant: "success",
      });
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleFormSaveSuccess = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  if (authLoading || (!hasCheckedAuthAndRedirected.current && (!isAuthenticated || !user?.isAdmin))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        <p className="mt-4 text-xl text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!user?.isAdmin && hasCheckedAuthAndRedirected.current) {
      return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          Admin: Templates
        </h1>
        <Button onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Add New Template
        </Button>
      </div>

      {isFormOpen ? (
        <AdminTemplateForm
          template={editingTemplate}
          onSaveSuccess={handleFormSaveSuccess}
          onCancel={handleFormCancel}
          user={user}
        />
      ) : (
        loadingTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="relative aspect-video w-full rounded-t-lg bg-gray-200" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="flex justify-between pt-2">
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-lg text-muted-foreground">No templates found. Add one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template._id} className="group overflow-hidden relative">
                <div className="relative aspect-video w-full rounded-t-lg">
                  <Image
                    src={template.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <h3 className="text-lg font-semibold text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      {template.name}
                    </h3>
                  </div>
                  {template.isPremium && (
                    <Badge variant="secondary" className="absolute top-2 left-2 bg-yellow-500 text-white hover:bg-yellow-600">
                      Premium
                    </Badge>
                  )}
                  {!template.isActive && (
                    <Badge variant="destructive" className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600">
                      Inactive
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-muted-foreground capitalize mb-2">
                    {template.category}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                      {template.isPremium ? `$${template.price}` : 'Free'}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template._id, template.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}