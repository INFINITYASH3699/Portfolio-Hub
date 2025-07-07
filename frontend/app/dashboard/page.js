"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { LayoutDashboard, Rocket, FileText, Settings, PlusCircle, ExternalLink, Trash2, Edit, User, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, initialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userPortfolios, setUserPortfolios] = useState([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Handle authentication redirect - only once when initialized
  useEffect(() => {
    if (initialized && !authLoading && !isAuthenticated && !redirectHandled) {
      setRedirectHandled(true);
      router.push('/auth/signin');
    }
  }, [initialized, authLoading, isAuthenticated, router, redirectHandled]);

  // Fetch portfolios - only when authenticated and user data is available
  useEffect(() => {
    let isCancelled = false;

    const fetchPortfolios = async () => {
      if (!isAuthenticated || !user || !initialized) {
        return;
      }

      setPortfoliosLoading(true);
      
      try {
        const response = await api.get('/api/portfolios/my-portfolios');
        
        if (!isCancelled) {
          setUserPortfolios(response.data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("❌ Failed to fetch portfolios:", error);
          toast({
            title: "Error",
            description: "Failed to load your portfolios.",
            variant: "destructive",
          });
        }
      } finally {
        if (!isCancelled) {
          setPortfoliosLoading(false);
        }
      }
    };

    if (initialized && isAuthenticated && user) {
      fetchPortfolios();
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, user, initialized, toast]); // Only depend on essential auth states

  const handleTogglePublish = async (portfolioId, currentStatus) => {
    try {
      const response = await api.post(`/api/portfolios/${portfolioId}/toggle-publish`);
      toast({
        title: "Success!",
        description: response.data.message,
        variant: "success",
      });

      // Handle state update based on user plan
      if (user?.subscription?.plan === 'free' && !currentStatus) {
        // Free user publishing - refresh all portfolios
        const updatedResponse = await api.get('/api/portfolios/my-portfolios');
        setUserPortfolios(updatedResponse.data);
      } else {
        // Premium user or unpublishing - simple state update
        setUserPortfolios(prev => prev.map(p => 
          p._id === portfolioId 
            ? { ...p, settings: { ...p.settings, isPublished: !currentStatus } } 
            : p
        ));
      }
    } catch (error) {
      console.error("❌ Toggle publish failed:", error);
      toast({
        title: "Action Failed",
        description: error.response?.data?.message || "Failed to change publish status.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) {
      return;
    }
    
    try {
      await api.delete(`/api/portfolios/${portfolioId}`);
      toast({
        title: "Deleted!",
        description: "Portfolio successfully deleted.",
        variant: "success",
      });
      setUserPortfolios(prev => prev.filter(p => p._id !== portfolioId));
    } catch (error) {
      console.error("❌ Delete portfolio failed:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete portfolio.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while authentication is being determined
  if (!initialized || authLoading || (!isAuthenticated && !redirectHandled)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <LayoutDashboard className="h-16 w-16 text-muted-foreground animate-bounce" />
        <p className="mt-4 text-xl text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // Don't render dashboard content if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-1 lg:px-24 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          Dashboard
        </h1>
        <Link href="/templates">
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Create New Portfolio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Welcome, {user?.fullName || user?.username}!
            </CardTitle>
            <CardDescription>
              Manage your profile and account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" /> Profile Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" /> Your Plan
            </CardTitle>
            <CardDescription>
              You are currently on the{" "}
              <span className="font-semibold text-primary capitalize">
                {user?.subscription?.plan}
              </span>{" "}
              plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            {user?.subscription?.plan === 'free' ? (
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white" size="sm">
                  Upgrade to Premium
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Premium Active
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Total Portfolios
            </CardTitle>
            <CardDescription>
              You have created {userPortfolios.length} portfolio(s).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/templates">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" /> New Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Your Portfolios</h2>
      {portfoliosLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="relative aspect-video w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : userPortfolios.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">You haven't created any portfolios yet.</p>
          <Link href="/templates">
            <Button className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Start Building Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPortfolios.map((portfolio) => (
            <Card key={portfolio._id}>
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                {portfolio.templateId?.thumbnail ? (
                  <Image
                    src={portfolio.templateId.thumbnail}
                    alt={portfolio.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-200 to-indigo-200 flex items-center justify-center text-muted-foreground">
                    No Thumbnail
                  </div>
                )}
                {portfolio.templateId?.isPremium && (
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-yellow-500 text-white hover:bg-yellow-600">
                    Premium
                  </Badge>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge 
                    variant={portfolio.settings.isPublished ? "default" : "secondary"} 
                    className={portfolio.settings.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                  >
                    {portfolio.settings.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{portfolio.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Template: {portfolio.templateId?.name || 'N/A'}
                </p>
                
                {/* Primary Action Buttons */}
                <div className="flex justify-between items-center mt-4 mb-3">
                  <Link href={`/dashboard/editor/${portfolio._id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/analytics/${portfolio._id}`} passHref>
                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                      <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                    </Button>
                  </Link>
                </div>

                {/* Secondary Action Buttons */}
                <div className="flex justify-between items-center">
                  {portfolio.settings.isPublished ? (
                    <a href={`/portfolio/${user.username}/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" /> View Live
                      </Button>
                    </a>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      <ExternalLink className="h-4 w-4 mr-1" /> View Live
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={portfolio.settings.isPublished ? "destructive" : "secondary"} 
                      size="sm"
                      onClick={() => handleTogglePublish(portfolio._id, portfolio.settings.isPublished)}
                    >
                      {portfolio.settings.isPublished ? (
                        <><Rocket className="h-4 w-4 mr-1" /> Unpublish</>
                      ) : (
                        <><Rocket className="h-4 w-4 mr-1" /> Publish</>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeletePortfolio(portfolio._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}