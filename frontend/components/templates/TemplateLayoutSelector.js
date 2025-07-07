// frontend/components/templates/TemplateLayoutSelector.js
import ModernLayout from './layouts/ModernLayout';
import CreativeLayout from './layouts/CreativeLayout';
import ProfessionalLayout from './layouts/ProfessionalLayout';
import PhotographyLayout from './layouts/PhotographyLayout';

const layoutComponents = {
  modern: ModernLayout,
  creative: CreativeLayout,
  professional: ProfessionalLayout,
  photography: PhotographyLayout,
  minimal: ModernLayout, // Use ModernLayout as fallback for minimal
};

export const getLayoutComponent = (layoutType = 'modern') => {
  return layoutComponents[layoutType] || ModernLayout;
};

export const getAvailableLayouts = () => {
  return Object.keys(layoutComponents);
};

export const getLayoutInfo = (layoutType = 'modern') => {
  const layoutInfo = {
    modern: {
      name: 'Modern',
      description: 'Clean, minimal design with focus on content',
      features: ['Sticky Navigation', 'Clean Typography', 'Responsive Grid'],
      preview: '/images/layouts/modern-preview.jpg'
    },
    creative: {
      name: 'Creative',
      description: 'Artistic layout with animations and bold colors',
      features: ['Animated Backgrounds', 'Glassmorphism', 'Gradient Effects'],
      preview: '/images/layouts/creative-preview.jpg'
    },
    professional: {
      name: 'Professional',
      description: 'Corporate-style layout perfect for business portfolios',
      features: ['Sidebar Navigation', 'Card Layout', 'Corporate Colors'],
      preview: '/images/layouts/professional-preview.jpg'
    },
    photography: {
      name: 'Photography',
      description: 'Dark, image-focused layout for visual portfolios',
      features: ['Full-screen Images', 'Dark Theme', 'Minimal Text'],
      preview: '/images/layouts/photography-preview.jpg'
    },
    minimal: {
      name: 'Minimal',
      description: 'Ultra-clean layout with maximum white space',
      features: ['Minimal Design', 'Typography Focus', 'Clean Lines'],
      preview: '/images/layouts/minimal-preview.jpg'
    }
  };

  return layoutInfo[layoutType] || layoutInfo.modern;
};

export default {
  getLayoutComponent,
  getAvailableLayouts,
  getLayoutInfo
};