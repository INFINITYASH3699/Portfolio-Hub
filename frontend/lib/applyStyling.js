// frontend/lib/applyStyling.js
export const applyGlobalStyling = (customStyling) => {
  if (typeof document === 'undefined' || !customStyling) return;

  const root = document.documentElement; // This targets the <html> element

  // Apply colors as CSS variables
  if (customStyling.colors) {
    root.style.setProperty('--portfolio-primary', customStyling.colors.primary || '#6366f1');
    root.style.setProperty('--portfolio-secondary', customStyling.colors.secondary || '#8b5cf6');
    root.style.setProperty('--portfolio-accent', customStyling.colors.accent || '#10b981');
    
    // NEW: Apply background and text colors
    root.style.setProperty('--portfolio-background', customStyling.colors.background || '#ffffff');
    root.style.setProperty('--portfolio-text', customStyling.colors.text || '#1f2937');
    
    root.style.setProperty('--portfolio-muted', customStyling.colors.muted || '#6b7280');
  }

  // Apply fonts as CSS variables
  if (customStyling.fonts) {
    root.style.setProperty('--portfolio-font-heading', `'${customStyling.fonts.heading || 'Inter'}', sans-serif`);
    root.style.setProperty('--portfolio-font-body', `'${customStyling.fonts.body || 'Inter'}', sans-serif`);
    root.style.setProperty('--portfolio-font-accent', `'${customStyling.fonts.accent || 'Inter'}', sans-serif`);
  }

  // Spacing and other complex styling would typically be handled within individual components
  // using conditional Tailwind classes or inline styles based on props.
};