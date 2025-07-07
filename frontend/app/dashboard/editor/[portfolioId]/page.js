// frontend/app/dashboard/editor/[portfolioId]/page.js (Enhanced)
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import Link from "next/link";
import PortfolioRenderer from "@/components/TemplateRenderer";
import { applyGlobalStyling } from "@/lib/applyStyling";
import {
  PlusCircle,
  Eye,
  Save,
  XCircle,
  ChevronUp,
  ChevronDown,
  Palette,
  Type,
  Paintbrush,
  FileText,
  Globe,
  Search,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  Layers,
  RotateCcw,
  RotateCw,
  Menu,
  X,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Zap,
  Moon,
  Sun,
  Download,
  Share2,
  History,
} from "lucide-react";

// Enhanced font list with categories
const fontCategories = {
  "Modern Sans": ["Inter", "Poppins", "Montserrat", "Roboto", "Open Sans", "Lato"],
  "Classic Serif": ["Merriweather", "Playfair Display", "Lora", "Source Serif Pro"],
  "Display": ["Oswald", "Raleway", "Dancing Script", "Pacifico"],
  "Monospace": ["Source Code Pro", "JetBrains Mono", "Fira Code"],
};

// Color presets for quick styling
const colorPresets = [
  { name: "Professional Blue", primary: "#3B82F6", background: "#FFFFFF", text: "#1F2937" },
  { name: "Creative Purple", primary: "#8B5CF6", background: "#FAFAFA", text: "#374151" },
  { name: "Modern Dark", primary: "#10B981", background: "#111827", text: "#F9FAFB" },
  { name: "Warm Orange", primary: "#F59E0B", background: "#FFFBEB", text: "#92400E" },
  { name: "Elegant Rose", primary: "#EC4899", background: "#FDF2F8", text: "#831843" },
];

// Device preview sizes
const deviceSizes = {
  desktop: { width: "100%", icon: Monitor, label: "Desktop" },
  tablet: { width: "768px", icon: Tablet, label: "Tablet" },
  mobile: { width: "375px", icon: Smartphone, label: "Mobile" },
};

export default function EnhancedPortfolioEditor({ params }) {
  const { portfolioId } = params;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Core state
  const [portfolio, setPortfolio] = useState(null);
  const [editablePortfolio, setEditablePortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [showGrid, setShowGrid] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // History state for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;

  // Refs
  const initialLoadRef = useRef(true);
  const saveTimeoutRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Auto-save with debouncing
  const debouncedSave = useCallback(
    (data) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      setSaveStatus("pending");
      saveTimeoutRef.current = setTimeout(async () => {
        if (!data || isSaving) return;
        
        setIsSaving(true);
        setSaveStatus("saving");
        
        try {
          const updatePayload = {
            customData: data.customData,
            customStyling: data.customStyling,
            activeSections: data.activeSections,
            title: data.title,
            slug: data.slug,
            seoSettings: data.seoSettings,
            settings: data.settings,
          };

          await api.put(`/api/portfolios/${portfolioId}/customize`, updatePayload);
          setSaveStatus("saved");
          toast({
            title: "Auto-saved",
            description: "Your changes have been saved.",
            variant: "success",
            duration: 2000,
          });
        } catch (err) {
          setSaveStatus("error");
          console.error("Auto-save failed:", err);
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
    [portfolioId, isSaving, toast]
  );

  // History management
  const addToHistory = useCallback((newState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newState)));
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setEditablePortfolio(previousState);
      setHistoryIndex(prev => prev - 1);
      toast({
        title: "Undone",
        description: "Previous change has been undone.",
        variant: "default",
        duration: 2000,
      });
    }
  }, [history, historyIndex, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEditablePortfolio(nextState);
      setHistoryIndex(prev => prev + 1);
      toast({
        title: "Redone",
        description: "Change has been restored.",
        variant: "default",
        duration: 2000,
      });
    }
  }, [history, historyIndex, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveChanges();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'p':
            e.preventDefault();
            // Toggle preview mode
            break;
          case '1':
            e.preventDefault();
            setPreviewDevice("desktop");
            break;
          case '2':
            e.preventDefault();
            setPreviewDevice("tablet");
            break;
          case '3':
            e.preventDefault();
            setPreviewDevice("mobile");
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [undo, redo]);

  // Existing useEffect hooks (authentication, portfolio fetching, styling, etc.)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    let isMounted = true;

    const fetchPortfolio = async () => {
      if (isAuthenticated && portfolioId) {
        setLoadingPortfolio(true);
        try {
          const response = await api.get(`/api/portfolios/${portfolioId}`);
          if (isMounted) {
            const fetchedPortfolioData = response.data;
            const normalizedPortfolioData = {
              ...fetchedPortfolioData,
              userId: fetchedPortfolioData.userId && typeof fetchedPortfolioData.userId === 'object' 
                ? { _id: fetchedPortfolioData.userId._id, username: fetchedPortfolioData.userId.username }
                : (user ? { _id: user._id, username: user.username } : null)
            };

            setPortfolio(normalizedPortfolioData);
            const editableData = {
              ...normalizedPortfolioData,
              customData: JSON.parse(JSON.stringify(normalizedPortfolioData.customData || {})),
              customStyling: JSON.parse(JSON.stringify(normalizedPortfolioData.customStyling || {})),
              seoSettings: JSON.parse(JSON.stringify(normalizedPortfolioData.seoSettings || {})),
              settings: JSON.parse(JSON.stringify(normalizedPortfolioData.settings || {})),
              activeSections: [...(normalizedPortfolioData.activeSections || [])],
            };
            
            setEditablePortfolio(editableData);
            setHistory([JSON.parse(JSON.stringify(editableData))]);
            setHistoryIndex(0);
            setError(null);
            applyGlobalStyling(normalizedPortfolioData.customStyling);
            initialLoadRef.current = true;
            setSaveStatus("saved");
          }
        } catch (err) {
          if (isMounted) {
            setError(err.response?.data?.message || "Failed to load portfolio.");
            toast({
              title: "Error",
              description: err.response?.data?.message || "Failed to load portfolio details.",
              variant: "destructive",
            });
          }
        } finally {
          if (isMounted) {
            setLoadingPortfolio(false);
          }
        }
      }
    };

    fetchPortfolio();
    return () => { isMounted = false; };
  }, [isAuthenticated, portfolioId, toast, authLoading, user]);

  // Apply styling and trigger auto-save
  useEffect(() => {
    if (editablePortfolio) {
      applyGlobalStyling(editablePortfolio.customStyling);
      
      if (!initialLoadRef.current) {
        addToHistory(editablePortfolio);
        debouncedSave(editablePortfolio);
      } else {
        initialLoadRef.current = false;
      }
    }
  }, [editablePortfolio, addToHistory, debouncedSave]);

  // Enhanced handlers
  const handlePortfolioChange = useCallback((path, value) => {
    setEditablePortfolio((prev) => {
      const newPortfolio = JSON.parse(JSON.stringify(prev));
      let current = newPortfolio;
      const pathParts = path.split(".");
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) {
          current[part] = {};
        }
        current = current[part];
      }
      current[pathParts[pathParts.length - 1]] = value;
      return newPortfolio;
    });
  }, []);

  const handleSectionDataChange = useCallback((sectionType, newData) => {
    setEditablePortfolio((prev) => ({
      ...prev,
      customData: {
        ...prev.customData,
        [sectionType]: newData,
      },
    }));
  }, []);

  const handleToggleSection = useCallback((sectionId, isRequired = false) => {
    setEditablePortfolio((prev) => {
      let newActiveSections;
      if (prev.activeSections.includes(sectionId)) {
        if (isRequired) {
          toast({
            title: "Cannot Remove",
            description: `The "${sectionId}" section is required by this template.`,
            variant: "destructive",
          });
          return prev;
        }
        newActiveSections = prev.activeSections.filter(id => id !== sectionId);
        toast({
          title: "Section Hidden",
          description: `"${sectionId}" section has been hidden.`,
          variant: "default",
        });
      } else {
        newActiveSections = [...prev.activeSections, sectionId];
        toast({
          title: "Section Added",
          description: `"${sectionId}" section has been added.`,
          variant: "default",
        });
      }
      return { ...prev, activeSections: newActiveSections };
    });
  }, [toast]);

  const handleReorderSection = useCallback((sectionId, direction) => {
    setEditablePortfolio((prev) => {
      const currentSections = [...prev.activeSections];
      const index = currentSections.indexOf(sectionId);
      
      if (index === -1) return prev;
      
      let newIndex = index;
      if (direction === "up" && index > 0) {
        newIndex = index - 1;
      } else if (direction === "down" && index < currentSections.length - 1) {
        newIndex = index + 1;
      } else {
        return prev;
      }
      
      const [movedSection] = currentSections.splice(index, 1);
      currentSections.splice(newIndex, 0, movedSection);
      
      toast({
        title: "Section Reordered",
        description: `"${sectionId}" section has been moved.`,
        variant: "default",
      });
      
      return { ...prev, activeSections: currentSections };
    });
  }, [toast]);

  const handleSaveChanges = useCallback(async () => {
    if (!editablePortfolio || isSaving) return;

    setIsSaving(true);
    setSaveStatus("saving");
    
    try {
      const updatePayload = {
        customData: editablePortfolio.customData,
        customStyling: editablePortfolio.customStyling,
        activeSections: editablePortfolio.activeSections,
        title: editablePortfolio.title,
        slug: editablePortfolio.slug,
        seoSettings: editablePortfolio.seoSettings,
        settings: editablePortfolio.settings,
      };

      const response = await api.put(`/api/portfolios/${portfolioId}/customize`, updatePayload);
      setPortfolio(response.data);
      setEditablePortfolio(JSON.parse(JSON.stringify(response.data)));

      toast({
        title: "Saved Successfully!",
        description: "All your changes have been saved.",
        variant: "success",
      });
      setSaveStatus("saved");
    } catch (err) {
      toast({
        title: "Save Failed",
        description: err.response?.data?.message || "Failed to save changes.",
        variant: "destructive",
      });
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [editablePortfolio, portfolioId, toast, isSaving]);

  const applyColorPreset = useCallback((preset) => {
    const newStyling = {
      ...editablePortfolio.customStyling,
      colors: {
        ...editablePortfolio.customStyling?.colors,
        primary: preset.primary,
        background: preset.background,
        text: preset.text,
      }
    };
    
    handlePortfolioChange("customStyling", newStyling);
    toast({
      title: "Color Preset Applied",
      description: `${preset.name} theme has been applied.`,
      variant: "success",
    });
  }, [editablePortfolio, handlePortfolioChange, toast]);

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    const allSections = portfolio?.templateId?.sections?.map(s => s.id) || [];
    if (!searchQuery) return allSections;
    return allSections.filter(sectionId => 
      sectionId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [portfolio?.templateId?.sections, searchQuery]);

  // Loading and error states
  if (authLoading || loadingPortfolio || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full mb-4"></div>
        </div>
        <p className="text-xl text-gray-600 font-medium">Loading your editor...</p>
        <p className="text-sm text-gray-500 mt-2">Preparing your creative workspace</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Editor</h2>
          <p className="text-gray-600 mb-6">{error || "Portfolio not found or access denied."}</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const allTemplateSectionIds = portfolio.templateId?.sections?.map(s => s.id) || [];
  const requiredTemplateSectionIds = portfolio.templateId?.sections?.filter(s => s.isRequired).map(s => s.id) || [];

  return (
    <div className={`flex min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Enhanced Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-lg flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Portfolio Editor</h2>
              <p className="text-xs text-gray-500">Professional Design Tools</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200 space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || saveStatus === "saved"}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                >
                  {isSaving ? (
                    <>Saving... <div className="animate-spin ml-2 w-3 h-3 border border-white border-t-transparent rounded-full"></div></>
                  ) : (
                    <><Save className="w-3 h-3 mr-1" />Save</>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <RotateCw className="w-3 h-3" />
                </Button>
              </div>
              
              <div className={`text-xs text-center px-2 py-1 rounded-full ${
                saveStatus === "saved" ? "bg-green-100 text-green-800" :
                saveStatus === "saving" ? "bg-blue-100 text-blue-800" :
                saveStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {saveStatus === "saved" && "✓ All changes saved"}
                {saveStatus === "saving" && "💾 Saving changes..."}
                {saveStatus === "pending" && "⏳ Auto-save pending..."}
                {saveStatus === "error" && "⚠️ Save failed"}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              {[
                { id: "content", label: "Content", icon: Layers },
                { id: "design", label: "Design", icon: Palette },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                    activeTab === tab.id
                      ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "content" && (
                <div className="p-4 space-y-6">
                  {/* Section Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sections Management */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Page Sections
                    </h3>
                    <div className="space-y-2">
                      {filteredSections.map((sectionId) => {
                        const isActive = editablePortfolio.activeSections.includes(sectionId);
                        const isRequired = requiredTemplateSectionIds.includes(sectionId);
                        const canMoveUp = isActive && editablePortfolio.activeSections.indexOf(sectionId) > 0;
                        const canMoveDown = isActive && editablePortfolio.activeSections.indexOf(sectionId) < editablePortfolio.activeSections.length - 1;

                        return (
                          <Card key={sectionId} className={`p-3 ${isActive ? 'ring-2 ring-violet-500 ring-opacity-20 bg-violet-50' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isActive && <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />}
                                <span className="text-sm font-medium capitalize">
                                  {sectionId}
                                </span>
                                {isRequired && (
                                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                                    Required
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {isActive && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReorderSection(sectionId, "up")}
                                      disabled={!canMoveUp}
                                      className="p-1 h-6 w-6"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReorderSection(sectionId, "down")}
                                      disabled={!canMoveDown}
                                      className="p-1 h-6 w-6"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                
                                <Button
                                  variant={isActive ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleSection(sectionId, isRequired)}
                                  disabled={isRequired && isActive}
                                  className="p-1 h-6 w-6"
                                >
                                  {isActive ? <XCircle className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "design" && (
                <div className="p-4 space-y-6">
                  {/* Color Presets */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Quick Themes
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                        >
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.background }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.text }}></div>
                          </div>
                          <span className="text-sm font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Custom Colors
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: "primary", label: "Primary Color", default: "#6366f1" },
                        { key: "background", label: "Background", default: "#ffffff" },
                        { key: "text", label: "Text Color", default: "#1f2937" },
                      ].map((color) => (
                        <div key={color.key}>
                          <Label className="text-xs text-gray-600 mb-2 block">{color.label}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                                                            type="color"
                              value={editablePortfolio.customStyling?.colors?.[color.key] || color.default}
                              onChange={(e) => handlePortfolioChange(`customStyling.colors.${color.key}`, e.target.value)}
                              className="w-12 h-12 p-1 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={editablePortfolio.customStyling?.colors?.[color.key] || color.default}
                              onChange={(e) => handlePortfolioChange(`customStyling.colors.${color.key}`, e.target.value)}
                              placeholder={color.default}
                              className="flex-1 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Typography
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(fontCategories).map(([category, fonts]) => (
                        <div key={category}>
                          <Label className="text-xs text-gray-500 mb-2 block">{category}</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={editablePortfolio.customStyling?.fonts?.heading || "Inter"}
                              onValueChange={(value) => handlePortfolioChange("customStyling.fonts.heading", value)}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Heading" />
                              </SelectTrigger>
                              <SelectContent>
                                {fonts.map((font) => (
                                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Select
                              value={editablePortfolio.customStyling?.fonts?.body || "Inter"}
                              onValueChange={(value) => handlePortfolioChange("customStyling.fonts.body", value)}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Body" />
                              </SelectTrigger>
                              <SelectContent>
                                {fonts.map((font) => (
                                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spacing & Layout */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Paintbrush className="w-4 h-4" />
                      Layout Options
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">Show Grid</Label>
                        <Switch
                          checked={showGrid}
                          onCheckedChange={setShowGrid}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">Dark Mode Preview</Label>
                        <Switch
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="p-4 space-y-6">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      General
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Portfolio Title</Label>
                        <Input
                          value={editablePortfolio.title || ""}
                          onChange={(e) => handlePortfolioChange("title", e.target.value)}
                          placeholder="My Awesome Portfolio"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">URL Slug</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">/{portfolio.userId?.username || "you"}/</span>
                          <Input
                            value={editablePortfolio.slug || ""}
                            onChange={(e) => handlePortfolioChange("slug", e.target.value)}
                            placeholder="my-portfolio"
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Publish Portfolio</Label>
                          <p className="text-xs text-gray-500">Make your portfolio visible to everyone</p>
                        </div>
                        <Switch
                          checked={editablePortfolio.settings?.isPublished || false}
                          onCheckedChange={(checked) => {
                            // Handle publish toggle logic here
                            handlePortfolioChange("settings.isPublished", checked);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      SEO & Social
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">SEO Title</Label>
                        <Input
                          value={editablePortfolio.seoSettings?.title || ""}
                          onChange={(e) => handlePortfolioChange("seoSettings.title", e.target.value)}
                          placeholder="Professional Portfolio - Your Name"
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Appears in browser tabs and search results</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Meta Description</Label>
                        <textarea
                          value={editablePortfolio.seoSettings?.description || ""}
                          onChange={(e) => handlePortfolioChange("seoSettings.description", e.target.value)}
                          placeholder="A brief description of your portfolio and expertise..."
                          className="w-full p-2 text-sm border rounded-md resize-none h-20 bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Shown in search results under your title</p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Keywords</Label>
                        <Input
                          value={(editablePortfolio.seoSettings?.keywords || []).join(", ")}
                          onChange={(e) => handlePortfolioChange("seoSettings.keywords", e.target.value.split(",").map(k => k.trim()))}
                          placeholder="developer, designer, react, portfolio"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Social Share Image</Label>
                        <Input
                          value={editablePortfolio.seoSettings?.ogImage || ""}
                          onChange={(e) => handlePortfolioChange("seoSettings.ogImage", e.target.value)}
                          placeholder="https://example.com/share-image.jpg"
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Image shown when shared on social media</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      {portfolio.userId && portfolio.userId.username && portfolio.slug && (
                        <Link
                          href={`/portfolio/${portfolio.userId.username}/${portfolio.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Eye className="w-4 h-4 mr-2" />
                            View Live Portfolio
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        Export Portfolio
                        <span className="ml-auto text-xs text-gray-400">Coming Soon</span>
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <History className="w-4 h-4 mr-2" />
                        Version History
                        <span className="ml-auto text-xs text-gray-400">Coming Soon</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-gray-100">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {editablePortfolio.title || "Untitled Portfolio"}
            </h1>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Editing as</span>
              <span className="font-medium">{user?.fullName || user?.username}</span>
            </div>
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {Object.entries(deviceSizes).map(([device, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                      previewDevice === device
                        ? "bg-white text-violet-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title={`${config.label} Preview`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Additional toolbar actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? "bg-violet-50 text-violet-600 border-violet-200" : ""}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current opacity-30"></div>
                  <div className="bg-current opacity-30"></div>
                  <div className="bg-current opacity-30"></div>
                  <div className="bg-current opacity-30"></div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode ? "bg-gray-900 text-white" : ""}
              >
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4" ref={previewContainerRef}>
          <div
            className={`mx-auto transition-all duration-300 ease-in-out ${
              previewDevice === "mobile" 
                ? "w-[375px] border-8 border-gray-800 rounded-[2rem] shadow-2xl bg-white" 
                : previewDevice === "tablet"
                ? "w-[768px] border-4 border-gray-600 rounded-xl shadow-xl bg-white"
                : "w-full max-w-none bg-white rounded-lg shadow-sm"
            }`}
            style={{
              minHeight: previewDevice === "mobile" ? "667px" : previewDevice === "tablet" ? "1024px" : "auto"
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* Portfolio Content */}
            <div className={`relative ${darkMode ? 'dark' : ''}`}>
              <PortfolioRenderer
                portfolio={editablePortfolio}
                isEditing={true}
                onDataChange={handleSectionDataChange}
                portfolioId={portfolioId}
              />
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              Sections: {editablePortfolio.activeSections.length} active
            </span>
            <span>
              History: {historyIndex + 1}/{history.length}
            </span>
            <span>
              Device: {deviceSizes[previewDevice].label}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Last saved: Just now</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
              <span>Save</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Z</kbd>
              <span>Undo</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}