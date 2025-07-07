// frontend/app/admin/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Users, LayoutTemplate, Briefcase, DollarSign, Loader2, BarChart2, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const hasCheckedAuthAndRedirected = useRef(false);

  const [stats, setStats] = useState({
    users: null,
    templates: null,
    portfolios: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !hasCheckedAuthAndRedirected.current) {
      if (!isAuthenticated) {
        console.log("AdminDashboardPage: Not authenticated, redirecting to signin.");
        router.push('/auth/signin');
        hasCheckedAuthAndRedirected.current = true;
      } else if (user && !user.isAdmin) {
        console.log("AdminDashboardPage: Authenticated but not admin, showing toast and redirecting.");
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
  }, [isAuthenticated, authLoading, user, router, toast]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user?.isAdmin) return;

    setLoadingStats(true);
    try {
      const [userStatsRes, templateStatsRes, portfolioStatsRes] = await Promise.all([
        api.get('/api/user/stats'),
        api.get('/api/templates/stats'),
        api.get('/api/portfolios/stats'),
      ]);

      setStats({
        users: userStatsRes.data,
        templates: templateStatsRes.data,
        portfolios: portfolioStatsRes.data,
      });
      console.log("AdminDashboardPage: Fetched stats successfully.");
    } catch (error) {
      console.error("Frontend: Failed to fetch admin stats:", error.response?.data?.message || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load admin dashboard stats. Please check backend console for details.",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  }, [isAuthenticated, user, toast]);

  useEffect(() => {
    if (hasCheckedAuthAndRedirected.current && isAuthenticated && user?.isAdmin) {
        fetchStats();
    }
  }, [isAuthenticated, user, fetchStats]);


  if (authLoading || (!hasCheckedAuthAndRedirected.current && (!isAuthenticated || !user?.isAdmin))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        <p className="mt-4 text-xl text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!user?.isAdmin && hasCheckedAuthAndRedirected.current) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
        Admin Dashboard
      </h1>

      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-8 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users?.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users?.totalAdmins} Admins, {stats.users?.totalPremiumUsers} Premium
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">Manage Users</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Template Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templates?.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.templates?.activeTemplates} Active, {stats.templates?.premiumTemplates} Premium
              </p>
              {stats.templates?.totalDownloads !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.templates?.totalDownloads} Total Downloads
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/admin/templates">
                <Button variant="outline" size="sm">Manage Templates</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Portfolio Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.portfolios?.totalPortfolios}</div>
              <p className="text-xs text-muted-foreground">
                {stats.portfolios?.publishedPortfolios} Published, {stats.portfolios?.draftPortfolios} Draft
              </p>
              {stats.portfolios?.totalViews !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.portfolios?.totalViews} Total Views
                </p>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" disabled>View Portfolios (Coming Soon)</Button>
            </CardFooter>
          </Card>

          {/* Additional Analytics / Popular Categories */}
          {stats.templates?.popularCategories && stats.templates.popularCategories.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Popular Template Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.templates.popularCategories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium capitalize">{cat._id}</span>
                      <span className="text-sm text-muted-foreground">{cat.count} templates</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

           {/* Most Viewed Portfolios (FIXED CARD) */}
           {stats.portfolios?.mostViewedPortfolios && stats.portfolios.mostViewedPortfolios.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Most Viewed Portfolios</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.portfolios.mostViewedPortfolios.map((p, index) => (
                        <div key={p._id} className="flex items-center justify-between mb-2">
                            {p.userId?.username && p.slug ? ( // Ensure username and slug exist
                                <Link href={`/portfolio/${p.userId.username}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> {p.title}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                    <FileText className="h-3 w-3" /> {p.title} (Owner/Slug Missing)
                                </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {p.stats.views} views
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>
           )}

          {/* Example of a Revenue Card (Future) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$ --.--</div>
              <p className="text-xs text-muted-foreground">
                Based on Premium subscriptions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}