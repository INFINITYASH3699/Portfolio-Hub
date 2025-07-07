"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { PlusCircle, Edit, Search } from 'lucide-react';

export default function TemplatesPage() {
  const { user, isAuthenticated, loading: authLoading, initialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPremium, setSelectedPremium] = useState('all');
  const [categories, setCategories] = useState([]);
  const fetchedCategoriesRef = useRef(false); // To ensure categories are fetched only once
  const fetchTemplatesTimeoutRef = useRef(null); // For debouncing search

  // Function to fetch categories - designed to run only once
  const fetchCategories = useCallback(async () => {
    if (fetchedCategoriesRef.current) return;
    try {
      const categoriesResponse = await api.get('/api/templates/categories');
      setCategories(categoriesResponse.data);
      fetchedCategoriesRef.current = true;
      console.log('✅ Categories fetched successfully.');
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Main function to fetch templates with filters
  const fetchTemplates = useCallback(async () => {
    if (!initialized || authLoading) { // Wait for auth to be initialized
      return;
    }

    setLoadingTemplates(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPremium !== 'all') params.append('isPremium', selectedPremium);
      if (searchTerm) params.append('search', searchTerm);

      const endpoint = isAuthenticated ? `/api/templates/with-usage?${params.toString()}` : `/api/templates?${params.toString()}`;
      console.log(`🌐 Fetching templates from: ${endpoint}`);
      const templatesResponse = await api.get(endpoint);
      setTemplates(templatesResponse.data);
      console.log(`✅ Loaded ${templatesResponse.data.length} templates.`);

    } catch (error) {
      console.error("❌ Failed to fetch templates:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  }, [initialized, authLoading, selectedCategory, selectedPremium, searchTerm, isAuthenticated, toast]);

  // Effect to fetch categories once on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Runs once because fetchCategories is stable

  // Effect to fetch templates when filters or auth state changes
  useEffect(() => {
    // Clear any existing timeout to debounce calls
    if (fetchTemplatesTimeoutRef.current) {
      clearTimeout(fetchTemplatesTimeoutRef.current);
    }
    
    // Debounce template fetching to prevent excessive calls, especially on search
    fetchTemplatesTimeoutRef.current = setTimeout(() => {
      fetchTemplates();
    }, 300); // 300ms debounce
    
    // Cleanup timeout on unmount or re-run
    return () => {
      if (fetchTemplatesTimeoutRef.current) {
        clearTimeout(fetchTemplatesTimeoutRef.current);
      }
    };
  }, [fetchTemplates]); // fetchTemplates depends on filters, auth, etc., correctly triggers this

  const handleUseTemplate = async (templateId, templateName, isPremiumTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to use a template.",
        variant: "destructive",
        action: <Link href="/auth/signin"><Button variant="default">Sign In</Button></Link>
      });
      return;
    }

    if (isPremiumTemplate && user?.subscription?.plan !== 'premium') {
      toast({
        title: "Premium Template",
        description: "This is a premium template. Please upgrade your plan to use it.",
        variant: "destructive",
        action: <Link href="/pricing"><Button variant="default">Upgrade Now</Button></Link>
      });
      return;
    }

    setCreatingPortfolio(true);
    try {
      const response = await api.post('/api/portfolios/create-from-template', {
        templateId,
        title: `My ${templateName} Portfolio`,
      });
      toast({
        title: "Success!",
        description: `"${templateName}" portfolio created.`,
        variant: "success",
      });
      router.push(`/dashboard/editor/${response.data._id}`); // Redirect to editor
    } catch (error) {
      console.error("❌ Failed to create portfolio:", error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setCreatingPortfolio(false);
      // Re-fetch templates to update 'used' status for the newly created portfolio
      fetchTemplates(); 
    }
  };

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    // No need to call fetchTemplates here directly, useEffect will handle debounce
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
  }, []);

  const handlePremiumChange = useCallback((value) => {
    setSelectedPremium(value);
  }, []);

  if (authLoading || !initialized) { // Use initialized to ensure AuthProvider is ready
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
        <p className="mt-4 text-xl text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-24 py-8 md:py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          Choose Your Perfect Portfolio Template
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our collection of professional, customizable templates. Start building your online presence today!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:px-24">
        <form onSubmit={(e) => { e.preventDefault(); fetchTemplates(); }} className="flex-grow flex gap-2">
          <Input
            type="text"
            placeholder="Search templates by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select value={selectedCategory} onValueChange={handleCategoryChange} className="w-full sm:w-[180px]">
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPremium} onValueChange={handlePremiumChange} className="w-full sm:w-[150px]">
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="false">Free</SelectItem>
            <SelectItem value="true">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="relative aspect-video w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card key={template._id} className="group overflow-hidden relative">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={template.thumbnail}
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
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground capitalize mb-2">
                  {template.category}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    {template.isPremium ? `$${template.price}` : 'Free'}
                  </span>
                  {template.isUsedByUser ? (
                    <Link href={`/dashboard/editor/${template.userPortfolioId}`} passHref>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" /> Edit Portfolio
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      onClick={() => handleUseTemplate(template._id, template.name, template.isPremium)}
                      disabled={creatingPortfolio}
                    >
                      {creatingPortfolio ? 'Using...' : <><PlusCircle className="h-4 w-4 mr-2" /> Use Template</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}