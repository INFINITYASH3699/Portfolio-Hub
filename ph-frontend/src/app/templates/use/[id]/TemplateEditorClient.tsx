"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import TemplateRenderer from "@/components/template-renderer/TemplateRenderer";
import SidebarEditor from "./SidebarEditor";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { FetchProfileButton } from "@/components/ui/fetch-profile-button";
import {
  Expand,
  Shrink,
  Laptop,
  Tablet,
  Smartphone,
  Eye,
  ArrowLeft,
  Save,
  Share,
  Sparkles,
  Zap,
} from "lucide-react";

interface TemplateEditorClientProps {
  template: any;
  user: any;
  id: string;
}

export default function TemplateEditorClient({
  template,
  user,
  id,
}: TemplateEditorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioIdParam = searchParams.get("portfolioId");

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [updatedTemplate, setUpdatedTemplate] = useState(template);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for UI interactions
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [viewportMode, setViewportMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  // State for editor view
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // New state for section ordering
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(template);

  // Enhanced customization state
  const [selectedSectionVariants, setSelectedSectionVariants] = useState<
    Record<string, string>
  >({});
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [selectedStylePreset, setSelectedStylePreset] =
    useState<string>("modern");

  // New state for advanced mode
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  // Set isClient to true when component mounts and check authentication
  useEffect(() => {
    setIsClient(true);

    // Check authentication status
    const checkAuthentication = async () => {
      const token = apiClient.getToken?.();
      const currentUser = apiClient.getUser?.();

      if ((user && user.id) || (token && currentUser && currentUser._id)) {
        setIsAuthenticated(true);
      } else {
        try {
          const response = await apiClient.user.getProfile();
          if (response && response.user && response.user._id) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            toast.error(
              "You are not logged in. Please log in to save or publish your portfolio."
            );
          }
        } catch (error) {
          console.error("Failed to refresh authentication:", error);
          setIsAuthenticated(false);
          toast.error("Authentication check failed. Please log in again.");
        }
      }
    };

    checkAuthentication();
  }, [user]);

  // Initialize portfolio data on mount, only if authenticated
  useEffect(() => {
    if (!isClient) return;

    try {
      if (!template) {
        setError("Template data is missing");
        setLoading(false);
        return;
      }

      const initializePortfolio = async () => {
        if (portfolioIdParam) {
          try {
            const token = apiClient.getToken?.();

            const response = await apiClient.request<{
              success: boolean;
              portfolio: any;
            }>(`/portfolios/${portfolioIdParam}`, "GET");

            if (response && response.success && response.portfolio) {
              const currentUser = apiClient.getUser?.();
              const isPremiumUser =
                currentUser?.subscriptionPlan?.type === "premium" ||
                currentUser?.subscriptionPlan?.type === "professional" ||
                (currentUser?.subscriptionPlan &&
                  ["premium", "professional"].includes(
                    currentUser.subscriptionPlan.type
                  ));

              const updatedPortfolio = {
                ...response.portfolio,
                userType: isPremiumUser ? "premium" : "free",
              };

              setPortfolio(updatedPortfolio);
              setSavedPortfolioId(response.portfolio._id);

              const portfolioSectionOrder =
                response.portfolio.sectionOrder || [];
              if (portfolioSectionOrder.length > 0) {
                setSectionOrder(portfolioSectionOrder);
                setActiveSection(portfolioSectionOrder[0]);
              } else {
                const templateSections =
                  template.layouts?.[0]?.structure?.sections ||
                  template.defaultStructure?.layout?.sections ||
                  [];
                setSectionOrder(templateSections);
                setActiveSection(templateSections[0]);
              }

              if (response.portfolio.sectionVariants) {
                setSelectedSectionVariants(response.portfolio.sectionVariants);
              }
              if (typeof response.portfolio.animationsEnabled === "boolean") {
                setAnimationsEnabled(response.portfolio.animationsEnabled);
              }
              if (response.portfolio.stylePreset) {
                setSelectedStylePreset(response.portfolio.stylePreset);
              }

              setLoading(false);
              return;
            } else {
              toast.error(
                "Failed to load your existing portfolio. Creating a new one instead."
              );
            }
          } catch (err) {
            toast.error(
              "Failed to load your existing portfolio. Creating a new one instead."
            );
          }
        }

        const currentUser = apiClient.getUser?.();
        const generateSubdomain = () => {
          const username =
            user?.username ||
            currentUser?.username ||
            user?.name?.toLowerCase().replace(/\s+/g, "") ||
            "";
          return username || `user-${Date.now().toString().slice(-4)}`;
        };

        let defaultSectionOrder: string[] = [];
        if (template.layouts && template.layouts.length > 0) {
          const mainLayout = template.layouts[0];
          defaultSectionOrder = mainLayout?.structure?.sections || [];
        } else if (template.defaultStructure?.layout?.sections) {
          defaultSectionOrder = template.defaultStructure.layout.sections;
        }

        const initialContent: Record<string, any> = {
          header: {
            title: user?.name || "Your Name",
            subtitle:
              template.category === "developer"
                ? "Software Developer"
                : template.category === "designer"
                  ? "Creative Designer"
                  : template.category === "photographer"
                    ? "Professional Photographer"
                    : "Professional Portfolio",
            profileImage: "",
            navigation: ["About", "Projects", "Experience", "Contact"],
          },
          about: {
            title: "About Me",
            bio: "Welcome to my portfolio. Here you can share your professional background, experience, and what makes you unique.",
            variant:
              template.category === "designer"
                ? "with-image"
                : template.category === "developer"
                  ? "with-highlights"
                  : "standard",
            highlights: [
              {
                title: "My Expertise",
                description: "Describe your main area of expertise.",
              },
              {
                title: "Experience",
                description:
                  "Highlight your years of experience or key skills.",
              },
              {
                title: "Education",
                description: "Share your educational background.",
              },
            ],
          },
          seo: {
            title: "My Portfolio | Professional Website",
            description:
              "Welcome to my professional portfolio showcasing my work and experience.",
            keywords: "portfolio, professional, skills, projects",
          },
          socialLinks: {
            github: "",
            linkedin: "",
            twitter: "",
            instagram: "",
          },
        };

        if (template.sectionDefinitions) {
          Object.entries(template.sectionDefinitions).forEach(
            ([sectionType, definition]) => {
              if (!initialContent[sectionType] && definition.defaultData) {
                initialContent[sectionType] = { ...definition.defaultData };
              }
            }
          );
        }

        const isPremiumUser =
          currentUser?.subscriptionPlan?.type === "premium" ||
          currentUser?.subscriptionPlan?.type === "professional" ||
          (currentUser?.subscriptionPlan &&
            ["premium", "professional"].includes(
              currentUser.subscriptionPlan.type
            ));

        const initialPortfolioData = {
          _id: "new-portfolio",
          title: "My New Portfolio",
          subtitle: "Created with Portfolio Hub",
          subdomain: generateSubdomain(),
          templateId: template._id,
          userId: user?.id || "guest-user",
          content: initialContent,
          activeLayout: template.layouts?.[0]?.id || "default",
          activeColorScheme:
            template.themeOptions?.colorSchemes?.[0]?.id || "default",
          activeFontPairing:
            template.themeOptions?.fontPairings?.[0]?.id || "default",
          customColors: null,
          sectionOrder: defaultSectionOrder,
          userType: isPremiumUser ? "premium" : "free",
          subdomainLocked: !isPremiumUser,
          sectionVariants: {},
          animationsEnabled: true,
          stylePreset: "modern",
        };

        setPortfolio(initialPortfolioData);
        setSectionOrder(defaultSectionOrder);
        if (defaultSectionOrder.length > 0) {
          setActiveSection(defaultSectionOrder[0]);
        }
        setSelectedSectionVariants({});
        setAnimationsEnabled(true);
        setSelectedStylePreset("modern");
        setLoading(false);
      };

      initializePortfolio();
    } catch (err) {
      setError("Failed to initialize template editor.");
      setLoading(false);
    }
  }, [template, user, isClient, portfolioIdParam]);

  useEffect(() => {
    if (!isClient || !template || !portfolio) return;

    const activeLayoutId =
      portfolio.activeLayout || template.layouts?.[0]?.id || "default";
    const activeLayout =
      template.layouts?.find((l: any) => l.id === activeLayoutId) ||
      template.layouts?.[0];

    const layoutSections =
      activeLayout?.structure?.sections ||
      template.defaultStructure?.layout?.sections ||
      [];

    if (portfolio.sectionOrder && portfolio.sectionOrder.length > 0) {
      setSectionOrder(portfolio.sectionOrder);

      if (!activeSection && portfolio.sectionOrder.length > 0) {
        setActiveSection(portfolio.sectionOrder[0]);
      }
    } else if (layoutSections.length > 0) {
      setSectionOrder(layoutSections);

      if (!activeSection && layoutSections.length > 0) {
        setActiveSection(layoutSections[0]);
      }

      setPortfolio((prev: any) => ({
        ...prev,
        sectionOrder: layoutSections,
      }));
    }

    if (portfolio.sectionVariants) {
      setSelectedSectionVariants(portfolio.sectionVariants);
    }
    if (typeof portfolio.animationsEnabled === "boolean") {
      setAnimationsEnabled(portfolio.animationsEnabled);
    }
    if (portfolio.stylePreset) {
      setSelectedStylePreset(portfolio.stylePreset);
    }
  }, [isClient, template, portfolio, activeSection]);

  const handleSectionUpdate = (sectionId: string, data: any) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => {
      // Make sure we have a content object
      const currentContent = prev.content || {};

      // Create new portfolio state with updated section content
      const updatedPortfolio = {
        ...prev,
        content: {
          ...currentContent,
          [sectionId]: data,
        },
      };

      return updatedPortfolio;
    });

    setIsSaved(false);
  };

  const handleThemeSelect = (colorSchemeId: string, fontPairingId: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      activeColorScheme: colorSchemeId,
      activeFontPairing: fontPairingId,
    }));

    setIsSaved(false);
  };

  const handleLayoutSelect = (layoutId: string) => {
    if (!portfolio) return;

    const newLayout = template.layouts?.find((l: any) => l.id === layoutId);
    const newSectionOrder = newLayout?.structure?.sections || [];

    setPortfolio((prev: any) => ({
      ...prev,
      activeLayout: layoutId,
      sectionOrder: newSectionOrder,
    }));

    setSectionOrder(newSectionOrder);

    if (newSectionOrder.length > 0) {
      setActiveSection(newSectionOrder[0]);
    }

    setIsSaved(false);
  };

  const handleCustomCssUpdate = (css: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        customCss: css,
      },
    }));

    setIsSaved(false);
  };

  const handleSectionReorder = (newOrder: string[]) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);
    setIsSaved(false);
  };

  const handleAddSection = (sectionId: string) => {
    if (!portfolio || sectionOrder.includes(sectionId)) return;

    const newOrder = [...sectionOrder, sectionId];

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);
    setActiveSection(sectionId);
    setIsSaved(false);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!portfolio) return;

    const newOrder = sectionOrder.filter((id) => id !== sectionId);

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);

    if (activeSection === sectionId && newOrder.length > 0) {
      setActiveSection(newOrder[0]);
    }

    setIsSaved(false);
  };

  // Enhanced customization handlers
  const handleSectionVariantUpdate = (sectionId: string, variantId: string) => {
    setSelectedSectionVariants((prev) => ({
      ...prev,
      [sectionId]: variantId,
    }));
    setIsSaved(false);
  };

  const handleStylePresetUpdate = (presetId: string) => {
    setSelectedStylePreset(presetId);
    setIsSaved(false);
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    setIsSaved(false);
  };

  // Updated save draft function to include customization options and better handle auth errors
  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      toast.error(
        "You must be logged in to save your portfolio. Please log out and log back in."
      );
      return;
    }

    if (!portfolio) {
      toast.error("No portfolio data to save");
      return;
    }

    setIsSaving(true);
    setIsSaved(false);

    try {
      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        try {
          const response = await apiClient.user.getProfile();
          if (response && response.user && response.user._id) {
            const refreshedUserId = response.user._id;

            const portfolioToSave = {
              ...portfolio,
              userId: refreshedUserId,
              templateId: template._id,
              title: portfolio.title || "My Portfolio",
              subtitle: portfolio.subtitle || "",
              subdomain:
                portfolio.subdomain ||
                currentUser?.username ||
                user?.username ||
                `user-${Date.now().toString().slice(-8)}`,
              isPublished: false,
              activeLayout:
                portfolio.activeLayout ||
                template.layouts?.[0]?.id ||
                "default",
              activeColorScheme:
                portfolio.activeColorScheme ||
                template.themeOptions?.colorSchemes?.[0]?.id ||
                "default",
              activeFontPairing:
                portfolio.activeFontPairing ||
                template.themeOptions?.fontPairings?.[0]?.id ||
                "default",
              sectionOrder: sectionOrder,
              sectionVariants: selectedSectionVariants,
              animationsEnabled: animationsEnabled,
              stylePreset: selectedStylePreset,
            };

            if (process.env.NODE_ENV === "development") {
              await new Promise((resolve) => setTimeout(resolve, 800));
            }

            const saveResponse =
              await apiClient.portfolios.saveDraft(portfolioToSave);

            if (saveResponse && saveResponse.portfolio) {
              setSavedPortfolioId(saveResponse.portfolio._id);
              setPortfolio((prev: any) => ({
                ...prev,
                _id: saveResponse.portfolio._id,
              }));
              setIsSaved(true);
              toast.success("Portfolio saved as draft!");
              return;
            }
          } else {
            throw new Error("User ID is missing");
          }
        } catch (error) {
          throw new Error("User ID is missing");
        }
      }

      const portfolioToSave = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || "My Portfolio",
        subtitle: portfolio.subtitle || "",
        subdomain:
          portfolio.subdomain ||
          currentUser?.username ||
          user?.username ||
          `user-${Date.now().toString().slice(-8)}`,
        isPublished: false,
        activeLayout:
          portfolio.activeLayout || template.layouts?.[0]?.id || "default",
        activeColorScheme:
          portfolio.activeColorScheme ||
          template.themeOptions?.colorSchemes?.[0]?.id ||
          "default",
        activeFontPairing:
          portfolio.activeFontPairing ||
          template.themeOptions?.fontPairings?.[0]?.id ||
          "default",
        sectionOrder: sectionOrder,
        sectionVariants: selectedSectionVariants,
        animationsEnabled: animationsEnabled,
        stylePreset: selectedStylePreset,
      };

      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Add enhanced template handling for specific templates
      const templateName = template.name || "";

      // Map of templates with special requirements and their required sections
      const specialTemplates = {
        "Modern Developer": {
          requiredSections: [
            "header",
            "about",
            "projects",
            "skills",
            "experience",
            "education",
            "contact",
          ],
          defaultContent: {
            header: {
              title: portfolioToSave.title || "My Portfolio",
              subtitle: portfolioToSave.subtitle || "Software Developer",
            },
            about: {
              title: "About Me",
              bio: "Professional developer with experience in building web applications.",
              variant: "with-highlights",
              highlights: [
                {
                  title: "My Expertise",
                  description:
                    "Full-stack development with modern technologies.",
                },
                {
                  title: "Experience",
                  description: "Several years of industry experience.",
                },
                {
                  title: "Education",
                  description: "Computer Science background.",
                },
              ],
            },
            projects: {
              title: "Projects",
              items: [
                {
                  title: "Sample Project",
                  description: "Description of your project",
                  tags: ["React", "Node.js"],
                },
              ],
            },
            skills: {
              title: "Skills",
              categories: [
                {
                  name: "Frontend",
                  skills: [
                    {
                      name: "React",
                      proficiency: 80,
                    },
                  ],
                },
              ],
            },
            experience: {
              title: "Experience",
              items: [
                {
                  title: "Software Developer",
                  company: "Company Name",
                  startDate: "2020-01-01",
                  current: true,
                  description: "Working on various web projects.",
                },
              ],
            },
            education: {
              title: "Education",
              items: [
                {
                  degree: "Computer Science",
                  institution: "University Name",
                  startDate: "2016-01-01",
                  endDate: "2020-01-01",
                  description:
                    "Studied computer science and software engineering.",
                },
              ],
            },
            contact: {
              title: "Contact",
              email: "",
              phone: "",
            },
          },
        },
        "Creative Studio": {
          requiredSections: [
            "header",
            "about",
            "work",
            "clients",
            "testimonials",
            "gallery",
            "contact",
          ],
          defaultContent: {
            header: {
              title: portfolioToSave.title || "My Portfolio",
              subtitle: portfolioToSave.subtitle || "Creative Professional",
            },
            about: {
              title: "About Me",
              bio: "Creative professional with expertise in design and visual arts.",
              variant: "with-image",
            },
            work: {
              title: "My Work",
              items: [
                {
                  title: "Sample Project",
                  description: "Description of your creative work",
                  imageUrl: "",
                },
              ],
            },
            clients: {
              title: "Clients",
              items: [
                {
                  name: "Sample Client",
                  logo: "",
                },
              ],
            },
            testimonials: {
              title: "Testimonials",
              items: [
                {
                  name: "John Doe",
                  position: "CEO",
                  company: "Company Name",
                  testimonial: "Sample testimonial text",
                },
              ],
            },
            gallery: {
              title: "Gallery",
              items: [],
            },
            contact: {
              title: "Contact",
              email: "",
              phone: "",
            },
          },
        },
        "Photo Gallery": {
          requiredSections: [
            "header",
            "about",
            "gallery",
            "categories",
            "services",
            "pricing",
            "contact",
          ],
          defaultContent: {
            header: {
              title: portfolioToSave.title || "My Photography Portfolio",
              subtitle:
                portfolioToSave.subtitle || "Photographer & Visual Artist",
            },
            about: {
              title: "About Me",
              bio: "Professional photographer with a passion for capturing unique moments.",
              variant: "with-image",
            },
            gallery: {
              title: "Gallery",
              items: [
                {
                  title: "Sample Photo",
                  description: "Description of your photo",
                  imageUrl: "",
                  category: "Sample",
                },
              ],
            },
            categories: {
              title: "Categories",
              items: [
                { name: "Portraits", description: "Portrait photography" },
                { name: "Landscapes", description: "Landscape photography" },
              ],
            },
            services: {
              title: "Services",
              items: [
                {
                  title: "Wedding Photography",
                  description: "Complete wedding photography services",
                  price: "Contact for pricing",
                },
                {
                  title: "Portrait Sessions",
                  description: "Professional portrait photography",
                  price: "Contact for pricing",
                },
              ],
            },
            pricing: {
              title: "Pricing",
              packages: [
                {
                  name: "Basic",
                  price: "$200",
                  features: ["2 hour session", "20 digital images"],
                },
                {
                  name: "Standard",
                  price: "$400",
                  features: ["4 hour session", "50 digital images"],
                },
              ],
            },
            contact: {
              title: "Contact",
              email: "",
              phone: "",
            },
          },
        },
        "Code Craft": {
          requiredSections: [
            "header",
            "about",
            "projects",
            "technologies",
            "experience",
            "education",
            "testimonials",
            "contact",
          ],
          defaultContent: {
            header: {
              title: portfolioToSave.title || "My Developer Portfolio",
              subtitle: portfolioToSave.subtitle || "Software Engineer",
            },
            about: {
              title: "About Me",
              bio: "Passionate software engineer with a focus on building elegant and efficient solutions.",
              variant: "with-highlights",
              highlights: [
                {
                  title: "Specialization",
                  description: "Full stack development",
                },
                {
                  title: "Experience",
                  description: "5+ years of professional coding",
                },
              ],
            },
            projects: {
              title: "Projects",
              items: [
                {
                  title: "Sample Project",
                  description: "A brief description of a coding project",
                  tags: ["React", "Node.js", "MongoDB"],
                },
              ],
            },
            technologies: {
              title: "Technologies",
              categories: [
                { name: "Frontend", items: ["React", "Vue", "Angular"] },
                { name: "Backend", items: ["Node.js", "Python", "Java"] },
                { name: "Database", items: ["MongoDB", "PostgreSQL"] },
              ],
            },
            experience: {
              title: "Experience",
              items: [
                {
                  title: "Senior Developer",
                  company: "Tech Company",
                  startDate: "2020-01-01",
                  current: true,
                  description: "Leading development of web applications",
                },
              ],
            },
            education: {
              title: "Education",
              items: [
                {
                  degree: "Computer Science",
                  institution: "Tech University",
                  startDate: "2015-01-01",
                  endDate: "2019-01-01",
                  description: "Specialized in software engineering",
                },
              ],
            },
            testimonials: {
              title: "Testimonials",
              items: [
                {
                  name: "Jane Smith",
                  position: "CTO",
                  company: "Tech Company",
                  testimonial:
                    "Excellent developer, delivered projects on time",
                },
              ],
            },
            contact: {
              title: "Contact",
              email: "",
              phone: "",
            },
          },
        },
        "Design Lab": {
          requiredSections: [
            "header",
            "about",
            "portfolio",
            "process",
            "skills",
            "clients",
            "contact",
          ],
          defaultContent: {
            header: {
              title: portfolioToSave.title || "My Design Portfolio",
              subtitle: portfolioToSave.subtitle || "UX/UI Designer",
            },
            about: {
              title: "About Me",
              bio: "Creative designer with expertise in user interface and experience design.",
              variant: "with-image",
            },
            portfolio: {
              title: "Portfolio",
              items: [
                {
                  title: "Sample Design",
                  description: "Description of your design work",
                  imageUrl: "",
                  category: "UI Design",
                },
              ],
            },
            process: {
              title: "My Process",
              steps: [
                { title: "Research", description: "Understanding user needs" },
                { title: "Ideation", description: "Brainstorming solutions" },
                { title: "Design", description: "Creating visual solutions" },
                { title: "Testing", description: "Validating with users" },
              ],
            },
            skills: {
              title: "Skills",
              categories: [
                {
                  name: "Design",
                  skills: [
                    { name: "UI/UX Design", proficiency: 90 },
                    { name: "Figma", proficiency: 85 },
                  ],
                },
              ],
            },
            clients: {
              title: "Clients",
              items: [
                {
                  name: "Sample Client",
                  logo: "",
                  testimonial: "Great design work!",
                },
              ],
            },
            contact: {
              title: "Contact",
              email: "",
              phone: "",
            },
          },
        },
      };

      // Check if this is a template that needs special handling
      const specialTemplate = specialTemplates[templateName];

      if (specialTemplate) {
        // Ensure portfolio has all required content sections
        portfolioToSave.content = {
          ...portfolioToSave.content,
        };

        // Ensure each required section exists with at least minimal content
        specialTemplate.requiredSections.forEach((section) => {
          if (!portfolioToSave.content[section]) {
            portfolioToSave.content[section] = specialTemplate.defaultContent[
              section
            ] || {
              title: section.charAt(0).toUpperCase() + section.slice(1),
            };
          }
        });

        // Make sure all necessary sections are in the section order
        portfolioToSave.sectionOrder = Array.from(
          new Set([
            ...portfolioToSave.sectionOrder,
            ...specialTemplate.requiredSections.filter(
              (section) => !portfolioToSave.sectionOrder.includes(section)
            ),
          ])
        );
      }

      const response = await apiClient.portfolios.saveDraft(portfolioToSave);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
        }));
        setIsSaved(true);
        toast.success("Portfolio saved as draft!");
      } else {
        throw new Error("Failed to save portfolio");
      }
    } catch (err: any) {
      // Enhanced error logging with better debugging information
      console.error("Save draft error details:", {
        error: err.message || "Unknown error",
        stack: err.stack || "No stack trace",
        responseData: err.response?.data || "No response data",
        status: err.status || "No status code",
        templateId: template?._id || "Unknown template ID",
        templateName: template?.name || "Unknown template",
        templateCategory: template?.category || "Unknown category",
        portfolioData: {
          id: portfolio?._id || "No ID",
          title: portfolio?.title || "No title",
          hasContent: portfolio?.content
            ? Object.keys(portfolio?.content).length > 0
            : false,
          hasSections: sectionOrder?.length || 0,
          sectionTypes: sectionOrder?.join(", ") || "No sections",
          subdomain: portfolio?.subdomain || "No subdomain",
          activeLayout: portfolio?.activeLayout || "No layout",
          activeColorScheme: portfolio?.activeColorScheme || "No color scheme",
        },
      });

      // Display more helpful error message to the user based on error type
      let errorMessage = "Failed to save portfolio";

      if (
        err.message?.includes("already have a portfolio with this template")
      ) {
        errorMessage = err.message;
      } else if (err.status === 400) {
        // Bad request - likely validation error
        errorMessage =
          err.response?.data?.message ||
          "Portfolio validation failed. Please check all required fields.";
      } else if (err.status === 401 || err.status === 403) {
        // Authentication issues
        errorMessage = "Authentication error. Please sign in again.";
        // Consider redirecting to login page
        console.warn(
          "Authentication error detected, user may need to re-login"
        );
      } else if (err.status === 500) {
        // Server error with special handling for Creative Studio template
        if (template?.name === "Creative Studio") {
          errorMessage =
            "We're having trouble saving this Creative Studio template. Try adding some basic content to the 'Work', 'Clients' and 'Testimonials' sections before saving.";
        } else {
          errorMessage =
            "Server error during portfolio creation. Please try with a different template or contact support.";
        }

        // Log detailed error information for debugging
        console.error("Server error details:", {
          url: err.response?.url || "Unknown URL",
          status: err.status || "Unknown status",
          message: err.message || "No message",
          template: template?.name || "Unknown template",
          templateId: template?._id || "Unknown ID",
          sectionCount: sectionOrder?.length || 0,
          sectionOrder: sectionOrder || [],
        });
      } else if (err.message?.includes("Failed to fetch") || !err.status) {
        // Connection issues
        errorMessage =
          "Could not connect to the server. Please check your internet connection and try again.";
      } else if (err.message?.includes("User ID is missing")) {
        // User ID issues
        errorMessage =
          "Unable to determine your user account. Please sign out and sign in again.";
      }

      // Provide more information about the template in case it's template-specific
      if (errorMessage.includes("Server error")) {
        toast.error(errorMessage, {
          duration: 5000,
          description: `Problem occurred with template: ${template?.name || "Unknown"}`,
        });
      } else {
        toast.error(errorMessage);
      }

      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error(
        "You must be logged in to publish your portfolio. Please log out and log back in."
      );

      setTimeout(() => {
        router.push(
          "/auth/signin?redirectTo=" +
            encodeURIComponent(`/templates/use/${id}`)
        );
      }, 3000);
      return;
    }

    try {
      setIsPublishing(true);

      if (!savedPortfolioId) {
        await handleSaveDraft();

        if (!savedPortfolioId) {
          throw new Error("Failed to save portfolio before publishing");
        }
      }

      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        try {
          const response = await apiClient.user.getProfile();
          if (!response || !response.user || !response.user._id) {
            throw new Error("User ID is missing");
          }
        } catch (error) {
          throw new Error("User ID is missing");
        }
      }

      const isPremiumUser =
        currentUser?.subscriptionPlan?.type === "premium" ||
        currentUser?.subscriptionPlan?.type === "professional" ||
        (currentUser?.subscriptionPlan &&
          ["premium", "professional"].includes(
            currentUser.subscriptionPlan.type
          ));

      const username = currentUser?.username || user?.username || "";

      let subdomain = "";

      if (!isPremiumUser) {
        subdomain = username;
        if (!subdomain) {
          subdomain = `user-${Date.now().toString().slice(-8)}`;
        }
      } else {
        subdomain = portfolio.subdomain;

        if (
          !subdomain ||
          subdomain.includes("user-") ||
          subdomain === "undefined" ||
          subdomain === "null"
        ) {
          subdomain = username;
          if (!subdomain) {
            subdomain = `user-${Date.now().toString().slice(-8)}`;
          }
        }
      }

      const portfolioToPublish = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || "My Portfolio",
        subtitle: portfolio.subtitle || "",
        subdomain: subdomain,
        subdomainLocked: !isPremiumUser,
        userType: isPremiumUser ? "premium" : "free",
        isPublished: true,
        activeLayout:
          portfolio.activeLayout || template.layouts?.[0]?.id || "default",
        activeColorScheme:
          portfolio.activeColorScheme ||
          template.themeOptions?.colorSchemes?.[0]?.id ||
          "default",
        activeFontPairing:
          portfolio.activeFontPairing ||
          template.themeOptions?.fontPairings?.[0]?.id ||
          "default",
        sectionOrder: sectionOrder,
        sectionVariants: selectedSectionVariants,
        animationsEnabled: animationsEnabled,
        stylePreset: selectedStylePreset,
      };

      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const response = await apiClient.portfolios.publish(portfolioToPublish);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
          isPublished: true,
          activeLayout: response.portfolio.activeLayout || prev.activeLayout,
          activeColorScheme:
            response.portfolio.activeColorScheme || prev.activeColorScheme,
          activeFontPairing:
            response.portfolio.activeFontPairing || prev.activeFontPairing,
          sectionOrder: response.portfolio.sectionOrder || sectionOrder,
          sectionVariants:
            response.portfolio.sectionVariants || selectedSectionVariants,
          stylePreset: response.portfolio.stylePreset || selectedStylePreset,
          animationsEnabled:
            response.portfolio.animationsEnabled !== undefined
              ? response.portfolio.animationsEnabled
              : animationsEnabled,
        }));

        toast.success("Portfolio published successfully!");

        setTimeout(() => {
          router.push(`/portfolio/${response.portfolio.subdomain}`);
        }, 1500);
      } else {
        throw new Error("Failed to publish portfolio");
      }
    } catch (err: any) {
      console.error("Publish error details:", {
        error: err.message,
        stack: err.stack,
        responseData: err.response?.data,
        templateId: template._id,
        templateName: template.name,
        portfolioData: {
          id: portfolio?._id,
          title: portfolio?.title,
          hasContent: portfolio?.content
            ? Object.keys(portfolio?.content).length > 0
            : false,
          hasSections: sectionOrder.length,
        },
      });

      let errorMessage = "Failed to publish portfolio. Please try again.";

      if (
        err.message?.includes("User ID is missing") ||
        err.message?.includes("user information")
      ) {
        errorMessage =
          "Your user information could not be found. Please try logging out and logging back in.";

        setTimeout(() => {
          if (typeof apiClient.logout === "function") {
            apiClient.logout();
          }
          router.push(
            "/auth/signin?redirectTo=" +
              encodeURIComponent(`/templates/use/${id}`)
          );
        }, 3000);
      } else if (err.message) {
        errorMessage = `Failed to publish portfolio: ${err.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error("You must be logged in to preview your portfolio.");
      return;
    }

    setIsPreviewing(true);

    try {
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      if (savedPortfolioId) {
        window.open(`/portfolio/preview/${savedPortfolioId}`, "_blank");
      } else {
        throw new Error("Failed to generate preview");
      }
    } catch (err) {
      toast.error("Failed to generate preview. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const fetchProfileData = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to fetch your profile data.");
      return;
    }

    try {
      const response = await apiClient.user.getProfile();

      if (!response || !response.user) {
        throw new Error("Failed to fetch profile data: Invalid API response");
      }

      const profileData = response.user;

      if (
        !profileData.profile ||
        Object.keys(profileData.profile).length === 0
      ) {
        toast.warning(
          "Your profile is empty. Please add information to your profile first."
        );
        return;
      }

      let updatedFields: string[] = [];

      setPortfolio((prev) => {
        if (!prev) return prev;
        let updatedPortfolio = { ...prev };

        if (profileData.fullName) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              title: profileData.fullName,
            },
          };
          updatedFields.push("name");
        }

        if (profileData.profile?.profileImage) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              profileImage: profileData.profile.profileImage,
            },
          };
          if (updatedPortfolio.content?.about) {
            updatedPortfolio.content = {
              ...updatedPortfolio.content,
              about: {
                ...updatedPortfolio.content.about,
                image: profileData.profile.profileImage,
              },
            };
          }
          updatedFields.push("profileImage");
        }

        if (profileData.profile?.bio) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            about: {
              ...updatedPortfolio.content?.about,
              bio: profileData.profile.bio,
            },
          };
          updatedFields.push("bio");
        }

        if (
          profileData.profile?.skills &&
          profileData.profile.skills.length > 0
        ) {
          const mappedSkills = profileData.profile.skills.map((skill: any) => ({
            name: skill.name,
            level: skill.level || 80,
            category: skill.category || "Technical",
          }));

          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            skills: {
              title: updatedPortfolio.content?.skills?.title || "Skills",
              items: mappedSkills,
            },
          };
          updatedFields.push("skills");
        }

        if (
          profileData.profile?.experience &&
          profileData.profile.experience.length > 0
        ) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            experience: {
              title:
                updatedPortfolio.content?.experience?.title || "Experience",
              items: profileData.profile.experience.map((exp: any) => ({
                title: exp.title,
                company: exp.company,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current,
                description: exp.description,
              })),
            },
          };
          updatedFields.push("experience");
        }

        if (
          profileData.profile?.education &&
          profileData.profile.education.length > 0
        ) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            education: {
              title: updatedPortfolio.content?.education?.title || "Education",
              items: profileData.profile.education.map((edu: any) => ({
                degree: edu.degree,
                institution: edu.institution,
                location: edu.location,
                startDate: edu.startDate,
                endDate: edu.endDate,
                current: edu.current,
                description: edu.description,
              })),
            },
          };
          updatedFields.push("education");
        }

        if (
          profileData.profile?.projects &&
          profileData.profile.projects.length > 0
        ) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            projects: {
              title: updatedPortfolio.content?.projects?.title || "Projects",
              items: profileData.profile.projects.map((project: any) => ({
                title: project.title,
                description: project.description,
                image: project.image,
                link: project.link,
                tags: project.tags,
              })),
            },
          };
          updatedFields.push("projects");
        }

        if (profileData.email || profileData.profile?.socialLinks) {
          const existingContact = updatedPortfolio.content?.contact || {
            title: "Contact Me",
            subtitle: "Get in touch",
            message:
              "I'd love to hear from you! Feel free to reach out using the contact information below.",
            showContactForm: true,
            variant: "simple",
          };

          if (profileData.email) {
            existingContact.email = profileData.email;
            updatedFields.push("email");
          }

          if (profileData.profile?.location) {
            existingContact.location = profileData.profile.location;
            existingContact.address = profileData.profile.location;
            updatedFields.push("location");
          }

          if (profileData.profile?.socialLinks) {
            existingContact.socialLinks = profileData.profile.socialLinks;
            updatedFields.push("socialLinks");
          }

          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            contact: existingContact,
          };
        }

        if (profileData.profile?.title) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              subtitle: profileData.profile.title,
            },
          };
          updatedFields.push("title");
        }

        const username =
          profileData.username ||
          profileData.fullName?.toLowerCase().replace(/\s+/g, "") ||
          "";

        const isPremiumUser =
          profileData.subscriptionPlan?.type === "premium" ||
          profileData.subscriptionPlan?.type === "professional" ||
          (profileData.subscriptionPlan &&
            ["premium", "professional"].includes(
              profileData.subscriptionPlan.type
            ));

        updatedPortfolio.userType = isPremiumUser ? "premium" : "free";

        if (!isPremiumUser) {
          updatedPortfolio.subdomain = username;
          updatedPortfolio.subdomainLocked = true;
          updatedFields.push("subdomain");
        } else if (isPremiumUser && !updatedPortfolio.customSubdomain) {
          updatedPortfolio.subdomain = username;
          updatedPortfolio.subdomainLocked = false;
          updatedFields.push("subdomain");
        } else if (!updatedPortfolio.subdomain) {
          updatedPortfolio.subdomain =
            username || `user-${Date.now().toString().slice(-8)}`;
          updatedPortfolio.subdomainLocked = !isPremiumUser;
          updatedFields.push("subdomain");
        }

        setIsSaved(false);

        return updatedPortfolio;
      });

      if (updatedFields.length > 0) {
        toast.success(
          `Profile data imported successfully! Updated: ${updatedFields.join(
            ", "
          )}.`
        );
      } else {
        toast.warning(
          "No new profile data was imported. Your profile may be missing key information."
        );
      }
    } catch (error: any) {
      if (
        error?.message &&
        error.message.includes(
          "Failed to fetch profile data: Invalid API response"
        )
      ) {
        toast.error(
          "Failed to fetch profile data from the server. Please try again later."
        );
      } else if (error?.response && error.response.status === 401) {
        toast.error("You are not authorized. Please log in again.");
      } else {
        toast.error(
          error?.message
            ? `Failed to fetch profile data: ${error.message}`
            : "Failed to fetch profile data. Please try again."
        );
      }
    }
  };

  const getAllAvailableSections = () => {
    const sections = new Set<string>();

    if (template?.sectionDefinitions) {
      Object.keys(template.sectionDefinitions).forEach((section) =>
        sections.add(section)
      );
    }

    template?.layouts?.forEach((layout: any) => {
      if (layout.structure?.sections) {
        layout.structure.sections.forEach((section: string) =>
          sections.add(section)
        );
      }
    });

    return Array.from(sections);
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading template editor...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading template editor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          You must be logged in to use the template editor.
        </p>
        <Button
          onClick={() =>
            (window.location.href =
              "/auth/signin?redirectTo=" +
              encodeURIComponent(`/templates/use/${id}`))
          }
        >
          Sign In
        </Button>
        <Button variant="outline" onClick={() => router.push("/templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push("/templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden w-full">
      {/* Top navigation bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              Back to Templates
            </Link>
            <h1 className="text-xl font-bold hidden md:block">
              {updatedTemplate.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <FetchProfileButton
                onFetch={fetchProfileData}
                variant="outline"
                size="sm"
                fetchText="Auto-fill"
                fetchingText="Fetching..."
                className="hidden md:flex"
              />
            )}
            <Button
              variant={advancedMode ? "default" : "outline"}
              size="sm"
              onClick={() => setAdvancedMode(!advancedMode)}
              className="flex items-center gap-1 mr-1"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden md:inline">
                {advancedMode ? "Advanced Mode" : "Advanced Mode"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex items-center gap-1"
              disabled={isPreviewing}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">
                {isPreviewing ? "Opening Preview..." : "Open Preview"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              <span className="hidden md:inline">
                {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
              </span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePublish}
              className="flex items-center gap-1"
              disabled={isPublishing}
            >
              <Share className="h-4 w-4" />
              <span className="hidden md:inline">
                {isPublishing ? "Publishing..." : "Publish"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and editor content */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* SidebarEditor */}
        <SidebarEditor
          template={template}
          portfolio={portfolio}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sectionOrder={sectionOrder}
          onSectionReorder={handleSectionReorder}
          onAddSection={handleAddSection}
          onRemoveSection={handleRemoveSection}
          onUpdateSection={handleSectionUpdate}
          onUpdateTheme={handleThemeSelect}
          onUpdateLayout={handleLayoutSelect}
          onUpdateCustomCss={handleCustomCssUpdate}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
          onFetchProfile={isAuthenticated ? fetchProfileData : undefined}
          draftSaving={isSaving}
          draftSaved={isSaved}
          previewLoading={isPreviewing}
          publishLoading={isPublishing}
          showPreview={showPreview}
          selectedSectionVariants={selectedSectionVariants}
          onSectionVariantUpdate={handleSectionVariantUpdate}
          animationsEnabled={animationsEnabled}
          onAnimationsToggle={handleAnimationsToggle}
          selectedStylePreset={selectedStylePreset}
          onStylePresetUpdate={handleStylePresetUpdate}
          viewportMode={viewportMode}
          setViewportMode={setViewportMode}
          advancedMode={advancedMode}
        />

        {/* Content Preview */}
        <div
          className={`flex-1 transition-all duration-300 ${
            showPreview ? "opacity-100" : "opacity-95"
          }`}
        >
          <div
            className={`w-full h-full flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900 ${
              viewportMode === "tablet"
                ? "items-center pt-8"
                : viewportMode === "mobile"
                  ? "items-center pt-8"
                  : ""
            }`}
          >
            {/* Viewport wrapper */}
            <div
              className={`${
                viewportMode === "tablet"
                  ? "w-[768px] h-[1024px] scale-75 origin-top shadow-xl rounded-xl overflow-hidden"
                  : viewportMode === "mobile"
                    ? "w-[390px] h-[844px] scale-75 origin-top shadow-xl rounded-xl overflow-hidden"
                    : "w-full h-full"
              }`}
            >
              <div className="w-full h-full bg-white dark:bg-black overflow-auto">
                {portfolio && (
                  <TemplateRenderer
                    template={updatedTemplate}
                    portfolio={portfolio}
                    editable={false}
                    customColors={portfolio.customColors}
                    sectionOrder={sectionOrder}
                    animation={animationsEnabled}
                    stylePreset={selectedStylePreset}
                    sectionVariants={selectedSectionVariants}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
