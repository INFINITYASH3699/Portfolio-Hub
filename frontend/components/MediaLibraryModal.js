// frontend/components/MediaLibraryModal.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import api from '@/lib/axios';
import { Upload, Image as ImageIcon, XCircle, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MediaLibraryModal = ({ isOpen, onClose, portfolioId, currentSection, imageKey, itemIndex, onSelectImage }) => { // NEW: imageKey, itemIndex
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('upload');
      setSelectedFile(null);
      setSelectedLibraryImage(null);
      fetchLibraryImages();
    }
  }, [isOpen]);

  const fetchLibraryImages = useCallback(async () => {
    if (!portfolioId) {
      console.warn("[MediaLibraryModal] fetchLibraryImages: User ID (portfolioId prop) is missing.");
      return;
    }
    setLoadingLibrary(true);
    try {
      // The category param to backend's /api/user/images
      // This maps to the subfolder in Cloudinary.
      // E.g., 'hero', 'projects', 'profile-avatar'
      const categoryParam = currentSection; 
      
      const response = await api.get(`/api/user/images`, {
        params: {
          category: categoryParam,
        }
      });
      
      setLibraryImages(response.data.images);
    } catch (error) {
      console.error('❌ Failed to fetch library images:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load image library. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingLibrary(false);
    }
  }, [portfolioId, currentSection, toast]);


  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !portfolioId || !currentSection) {
      toast({
        title: 'Missing Info',
        description: 'Please select a file and ensure portfolio ID and section are provided.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('images', selectedFile);
    formData.append('section', currentSection); // Main section name (e.g., 'hero', 'projects')
    if (imageKey !== undefined && imageKey !== null) {
      formData.append('imageKey', imageKey); // The specific key within the section data (e.g., 'profileImage', 'image', 'avatar')
    }
    if (itemIndex !== undefined && itemIndex !== null) {
      formData.append('itemIndex', itemIndex); // The array index if it's an item in a list
    }

    try {
      const response = await api.post(`/api/portfolios/${portfolioId}/upload-section-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSelectedFile(null);
      
      toast({
        title: 'Upload Successful',
        description: `Image uploaded successfully.`, 
        variant: 'success',
      });
      
      onSelectImage(response.data.uploadedUrl); // Send the newly uploaded URL back to ImageInput
      
      fetchLibraryImages(); // Refresh library after upload
      onClose(); // Close the modal immediately after successful upload and selection
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectFromLibrary = () => {
    if (selectedLibraryImage) {
      onSelectImage(selectedLibraryImage.url);
      onClose();
    } else {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image from the library.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (imageToDelete) => {
    if (!window.confirm(`Are you sure you want to delete this image? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/portfolios/${portfolioId}/delete-image/${imageToDelete.publicId}`, {
        data: { section: currentSection, imageKey: imageKey, itemIndex: itemIndex } // Pass relevant info for deletion
      });
      setLibraryImages(prev => prev.filter(img => img.publicId !== imageToDelete.publicId));
      setSelectedLibraryImage(null);
      toast({
        title: 'Image Deleted',
        description: 'Image removed successfully.',
        variant: 'success',
      });
    } catch (error) {
      console.error('❌ Delete failed:', error);
      toast({
        title: 'Deletion Failed',
        description: error.response?.data?.message || 'Failed to delete image.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Media Library" size="lg">
      <div className="flex border-b">
        <Button
          variant={activeTab === 'upload' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('upload')}
          className="rounded-none border-r"
        >
          <Upload className="h-4 w-4 mr-2" /> Upload New
        </Button>
        <Button
          variant={activeTab === 'library' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('library')}
          className="rounded-none"
        >
          <ImageIcon className="h-4 w-4 mr-2" /> My Library
        </Button>
      </div>

      <div className="p-4 min-h-[300px]">
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Image</h3>
            <Label htmlFor="image-upload" className="block cursor-pointer p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground hover:border-primary transition-colors">
              {selectedFile ? selectedFile.name : 'Click to select an image'}
              <Input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </Label>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            >
              {isUploading ? (
                <>Uploading... <Loader2 className="h-4 w-4 ml-2 animate-spin" /></>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select from Library ({libraryImages.length})</h3>
            {loadingLibrary ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {libraryImages.length === 0 ? (
                  <p className="text-center text-muted-foreground">No images in your library. Upload some!</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {libraryImages.map((img, index) => (
                      <div
                        key={img.publicId || img.url || index}
                        className={cn(
                          "relative aspect-square border rounded-md overflow-hidden cursor-pointer",
                          selectedLibraryImage?.publicId === img.publicId && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => setSelectedLibraryImage(img)}
                      >
                        <Image src={img.url} alt={img.alt || 'Library Image'} fill style={{ objectFit: 'cover' }} />
                        {selectedLibraryImage?.publicId === img.publicId && (
                           <div className="absolute inset-0 flex items-center justify-center bg-primary/50 text-white">
                             <CheckCircle className="h-8 w-8" />
                           </div>
                        )}
                         <Button
                          size="icon"
                          variant="ghost"
                          className="absolute bottom-1 right-1 bg-white rounded-full p-1 opacity-80 hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); handleDeleteImage(img); }}
                          title="Delete this image"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSelectFromLibrary}
                    disabled={!selectedLibraryImage}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                  >
                    Select Image
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MediaLibraryModal;