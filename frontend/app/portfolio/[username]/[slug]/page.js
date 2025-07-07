// frontend/app/portfolio/[username]/[slug]/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import TemplateRenderer from '@/components/TemplateRenderer'; 
import { applyGlobalStyling } from '@/lib/applyStyling';
import Head from 'next/head'; // For SEO metadata

export default function PublicPortfolioPage({ params }) {
  const { username, slug } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchPublicPortfolio = async () => {
      setLoading(true);
      try {
        console.log(`🌐 Fetching public portfolio: /api/portfolios/public/${username}/${slug}`);
        const response = await api.get(`/api/portfolios/public/${username}/${slug}`);
        
        if (isMounted) {
          const fetchedPortfolioData = response.data;
          
          // --- NEW: Apply migration logic for templateLayout and editorSettings for public view consistency ---
          const migratedPortfolio = { ...fetchedPortfolioData };
          if (!migratedPortfolio.templateLayout) {
            migratedPortfolio.templateLayout = {
              navbar: {
                logoText: migratedPortfolio.customData.hero?.name || migratedPortfolio.title || 'PortfolioHub',
                menuItems: migratedPortfolio.activeSections.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), href: `#${s}`, isActive: true })),
                ctaButton: { text: 'Contact', href: '#contact', style: 'primary' }
              },
              header: { title: migratedPortfolio.title, subtitle: '' },
              footer: {
                text: `© ${new Date().getFullYear()} ${migratedPortfolio.customData.hero?.name || migratedPortfolio.title}. All rights reserved.`,
                links: [],
                showSocial: true,
                showCopyright: true,
                customText: ''
              }
            };
          }
          if (!migratedPortfolio.editorSettings) {
              migratedPortfolio.editorSettings = { mode: 'visual', splitViewLayout: 'left-right' };
          }
          // --- END NEW ---

          setPortfolio(migratedPortfolio); // Use migrated data
          setError(null);
          // Apply dynamic styling from the fetched portfolio
          applyGlobalStyling(migratedPortfolio.customStyling); // Apply styling from migrated data
          console.log('✅ Public portfolio fetched successfully.');
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Failed to fetch public portfolio:", err);
          setError(err.response?.data?.message || "Portfolio not found or not published.");
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to load portfolio.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (username && slug) {
      fetchPublicPortfolio();
    } else {
      setLoading(false); // No username/slug to fetch
      setError("Invalid portfolio URL.");
    }

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [username, slug, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
        <p className="mt-4 text-xl text-muted-foreground">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Go to Home</button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-muted-foreground mb-4">Portfolio Not Found</h2>
        <p className="text-lg text-muted-foreground mb-6">The portfolio you are looking for does not exist or is not published.</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Go to Home</button>
      </div>
    );
  }

  // Ensure templateId is populated for rendering, or provide a fallback
  const templateForRendering = portfolio.templateId && typeof portfolio.templateId === 'object'
    ? portfolio.templateId
    : { sections: [], layout: { type: 'modern', structure: { hasNavbar: true, hasFooter: true } } }; // Basic fallback template structure

  // SEO metadata (optional, but good practice for public pages)
  const seoTitle = portfolio.seoSettings?.title || `${portfolio.title} by ${username}`;
  const seoDescription = portfolio.seoSettings?.description || `View ${portfolio.title}, a professional portfolio by ${username}.`;
  // Fallback to template thumbnail if ogImage is not set
  const seoOgImage = portfolio.seoSettings?.ogImage || templateForRendering?.thumbnail; 

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {seoOgImage && <meta property="og:image" content={seoOgImage} />}
        <meta name="keywords" content={portfolio.seoSettings?.keywords?.join(', ') || ''} />
      </Head>
      <main>
        {/* --- UPDATED TemplateRenderer usage --- */}
        <TemplateRenderer 
          portfolio={portfolio} 
          template={templateForRendering} // Pass the template object
          isEditing={false} // Public view, so not editing
        />
        {/* --- END UPDATED --- */}
      </main>
    </>
  );
}