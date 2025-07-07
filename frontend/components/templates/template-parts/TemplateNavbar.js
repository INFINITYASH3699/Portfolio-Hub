// frontend/components/templates/template-parts/TemplateNavbar.js
import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TemplateNavbar = ({ 
  config = {}, 
  data = {}, 
  isEditing = false, 
  template = {},
  onDataChange 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navbarStyle = config?.style || 'minimal';
  const position = config?.position || 'sticky';
  const background = config?.background || 'transparent';

  const defaultMenuItems = [
    { label: 'About', href: '#about', isActive: true },
    { label: 'Projects', href: '#projects', isActive: true },
    { label: 'Contact', href: '#contact', isActive: true }
  ];

  const menuItems = data?.menuItems || defaultMenuItems;
  const logoText = data?.logoText || '';
  const ctaButton = data?.ctaButton || { text: '', href: '', style: 'primary' };

  const handleNavbarDataChange = (field, value) => {
    if (onDataChange) {
      const newNavbarData = { ...data, [field]: value };
      onDataChange('templateLayout.navbar', newNavbarData);
    }
  };

  const handleMenuItemChange = (index, field, value) => {
    const newMenuItems = [...menuItems];
    newMenuItems[index] = { ...newMenuItems[index], [field]: value };
    handleNavbarDataChange('menuItems', newMenuItems);
  };

  const addMenuItem = () => {
    const newMenuItem = { label: 'New Item', href: '#new', isActive: true };
    handleNavbarDataChange('menuItems', [...menuItems, newMenuItem]);
  };

  const removeMenuItem = (index) => {
    const newMenuItems = menuItems.filter((_, i) => i !== index);
    handleNavbarDataChange('menuItems', newMenuItems);
  };

  const getNavbarClasses = () => {
    const baseClasses = "template-navbar w-full z-50 transition-all duration-300";
    const positionClasses = {
      top: "relative",
      fixed: "fixed top-0 left-0 right-0",
      sticky: "sticky top-0"
    };
    const styleClasses = {
      minimal: "bg-white/80 backdrop-blur-md border-b border-gray-200",
      solid: "bg-white shadow-sm",
      transparent: "bg-transparent",
      dark: "bg-gray-900 text-white"
    };

    return cn(
      baseClasses,
      positionClasses[position],
      styleClasses[navbarStyle]
    );
  };

  if (isEditing) {
    return (
      <div className="template-navbar-editor bg-gray-50 border-b-2 border-dashed border-gray-300 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Navigation Bar Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo/Brand Text */}
            <div>
              <label className="block text-sm font-medium mb-2">Logo/Brand Text</label>
              <Input
                value={logoText}
                onChange={(e) => handleNavbarDataChange('logoText', e.target.value)}
                placeholder="Your Brand Name"
              />
            </div>

            {/* Menu Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Menu Items</label>
                <Button size="sm" onClick={addMenuItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-white rounded border">
                    <Input
                      value={item.label}
                      onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                      placeholder="Menu Label"
                      className="flex-1"
                    />
                    <Input
                      value={item.href}
                      onChange={(e) => handleMenuItemChange(index, 'href', e.target.value)}
                      placeholder="#section"
                      className="flex-1"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeMenuItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <label className="block text-sm font-medium mb-2">Call-to-Action Button</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={ctaButton.text}
                  onChange={(e) => handleNavbarDataChange('ctaButton', { ...ctaButton, text: e.target.value })}
                  placeholder="Button Text"
                />
                <Input
                  value={ctaButton.href}
                  onChange={(e) => handleNavbarDataChange('ctaButton', { ...ctaButton, href: e.target.value })}
                  placeholder="#contact"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <nav className={getNavbarClasses()}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="navbar-logo">
            {logoText && (
              <span className="font-bold text-xl text-primary">
                {logoText}
              </span>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.filter(item => item.isActive).map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="nav-link text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {ctaButton.text && (
              <Button 
                className="navbar-cta"
                onClick={() => {
                  if (ctaButton.href.startsWith('#')) {
                    document.querySelector(ctaButton.href)?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  } else {
                    window.open(ctaButton.href, '_blank');
                  }
                }}
              >
                {ctaButton.text}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              {menuItems.filter(item => item.isActive).map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {ctaButton.text && (
                <Button 
                  className="mt-2 w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (ctaButton.href.startsWith('#')) {
                      document.querySelector(ctaButton.href)?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }
                  }}
                >
                  {ctaButton.text}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TemplateNavbar;