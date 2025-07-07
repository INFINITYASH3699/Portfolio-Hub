"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Loader2, TrendingUp, Eye, Users, Mail, Share2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import Link from 'next/link';

export default function PortfolioAnalyticsPage({ params }) {
  const { portfolioId } = params;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAnalytics = useCallback(async () => {
    if (!isAuthenticated || !portfolioId) return;

    setLoadingAnalytics(true);
    try {
      const response = await api.get(`/api/portfolios/${portfolioId}/analytics`);
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch analytics:", err);
      setError(err.response?.data?.message || "Failed to load portfolio analytics.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load analytics details.",
        variant: "destructive",
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [isAuthenticated, portfolioId, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (authLoading || loadingAnalytics || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        <p className="mt-4 text-xl text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Analytics</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
        <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Analytics Data</h2>
        <p className="text-lg text-muted-foreground mb-6">Could not retrieve analytics for this portfolio.</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { title, currentStats, historicalViews } = analyticsData;

  return (
    <div className="container mx-auto px-2 lg:px-24 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
        Analytics: {title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.views}</div>
            <p className="text-xs text-muted-foreground">Overall views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">Unique visitors overall</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.contactForms}</div>
            <p className="text-xs text-muted-foreground">Submissions via form</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.shares}</div>
            <p className="text-xs text-muted-foreground">Times shared</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Views Over Time (Last 30 Days)</CardTitle>
          <CardDescription>Daily views for your portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          {historicalViews && historicalViews.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalViews}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-muted-foreground border border-dashed">
              <p className="text-center text-muted-foreground">No historical view data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add more analytics cards here (e.g., Traffic Sources, Popular Pages) */}
      <div className="flex justify-end mt-8">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}