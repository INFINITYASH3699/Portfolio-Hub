// frontend/components/templates/template-parts/TemplateFooter.js
import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TemplateFooter = ({ 
  config = {}, 
  data = {}, 
  isEditing = false,
  onDataChange,
  portfolio = {}
}) => {
  const currentYear = new Date().getFullYear();
  const userName = portfolio?.customData?.hero?.name || 'Portfolio Owner';

  const defaultFooterData = {
    text: `© ${currentYear} ${userName}. All rights reserved.`,
    links: [],
    showSocial: true,
    showCopyright: true,
    customText: ''
  };

  const footerData = { ...defaultFooterData, ...data };

  const handleFooterDataChange = (field, value) => {
    if (onDataChange) {
      const newFooterData = { ...footerData, [field]: value };
      onDataChange('templateLayout.footer', newFooterData);
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...(footerData.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleFooterDataChange('links', newLinks);
  };

  const addLink = () => {
    const newLink = { text: 'New Link', href: '#' };
    handleFooterDataChange('links', [...(footerData.links || []), newLink]);
  };

  const removeLink = (index) => {
    const newLinks = (footerData.links || []).filter((_, i) => i !== index);
    handleFooterDataChange('links', newLinks);
  };

  const getSocialLinks = () => {
    const heroSocial = portfolio?.customData?.hero?.socialLinks || {};
    const contactSocial = portfolio?.customData?.contact?.socialLinks || {};
    return { ...heroSocial, ...contactSocial };
  };

  const footerStyle = config?.style || 'minimal';

  const getFooterClasses = () => {
    const baseClasses = "template-footer w-full mt-auto";
    const styleClasses = {
      minimal: "bg-gray-50 border-t",
      solid: "bg-white border-t shadow-sm",
      dark: "bg-gray-900 text-white",
      gradient: "bg-gradient-to-r from-primary to-secondary text-white"
    };

    return cn(baseClasses, styleClasses[footerStyle]);
  };

  if (isEditing) {
    return (
      <div className="template-footer-editor bg-gray-50 border-t-2 border-dashed border-gray-300 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Copyright Text */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Copyright Text</Label>
              <Input
                value={footerData.text}
                onChange={(e) => handleFooterDataChange('text', e.target.value)}
                placeholder={`© ${currentYear} ${userName}. All rights reserved.`}
              />
            </div>

            {/* Custom Footer Text */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Additional Text (Optional)</Label>
              <textarea
                value={footerData.customText || ''}
                onChange={(e) => handleFooterDataChange('customText', e.target.value)}
                placeholder="Add any additional footer text here..."
                className="w-full p-2 border rounded-md resize-y min-h-[60px] bg-white"
              />
            </div>

            {/* Footer Links */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Footer Links</Label>
                <Button size="sm" onClick={addLink}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
              </div>
              <div className="space-y-2">
                {(footerData.links || []).map((link, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-white rounded border">
                    <Input
                      value={link.text}
                      onChange={(e) => handleLinkChange(index, 'text', e.target.value)}
                      placeholder="Link Text"
                      className="flex-1"
                    />
                    <Input
                      value={link.href}
                      onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
                      placeholder="URL or #section"
                      className="flex-1"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Social Links</Label>
                <Switch
                  checked={footerData.showSocial}
                  onCheckedChange={(checked) => handleFooterDataChange('showSocial', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Copyright</Label>
                <Switch
                  checked={footerData.showCopyright}
                  onCheckedChange={(checked) => handleFooterDataChange('showCopyright', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = getSocialLinks();

  return (
    <footer className={getFooterClasses()}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left Side - Copyright and Custom Text */}
          <div className="text-center md:text-left">
            {footerData.showCopyright && (
              <p className="text-sm text-muted-foreground">
                {footerData.text}
              </p>
            )}
            {footerData.customText && (
              <p className="text-sm text-muted-foreground mt-1">
                {footerData.customText}
              </p>
            )}
          </div>

          {/* Center - Footer Links */}
          {footerData.links && footerData.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {footerData.links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}

          {/* Right Side - Social Links */}
          {footerData.showSocial && Object.keys(socialLinks).length > 0 && (
            <div className="flex space-x-4">
              {Object.entries(socialLinks).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors capitalize"
                  >
                    {platform}
                  </a>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default TemplateFooter;