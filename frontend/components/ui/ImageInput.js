// frontend/components/ui/ImageInput.js
import Image from 'next/image';
import { Input } from './Input';
import { Button } from './Button';
import { useCallback, useState } from 'react';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { ImagePlus, Trash2 } from 'lucide-react';

const ImageInput = ({ label, value, onChange, portfolioId, currentSection, imageKey, itemIndex }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // console.log(`[ImageInput Render] Label: '${label}', Section: '${currentSection}', ImageKey: '${imageKey}', ItemIndex: ${itemIndex}, Value:`, value);

  const handleImageSelected = useCallback((imageUrl) => {
    // console.log(`[ImageInput Callback] Image Selected:`, imageUrl);
    onChange(imageUrl); // This updates the parent's state
    setIsModalOpen(false); // Close modal after selection
  }, [onChange]);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      {value && (
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border">
          <Image
            key={value}
            src={value}
            alt="Image Preview"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Change Image
            </Button>
          </div>
        </div>
      )}
      {!value && (
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="w-full"
        >
          <ImagePlus className="h-4 w-4 mr-2" /> Upload / Select Image
        </Button>
      )}

      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')} // Call onChange to clear the image URL in parent
          className="text-red-500 hover:text-red-600 w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Remove Image
        </Button>
      )}

      {isModalOpen && (
        <MediaLibraryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portfolioId={portfolioId} // User's ID for general asset library
          currentSection={currentSection} // Section name (e.g., 'hero', 'projects')
          imageKey={imageKey} // Field name within the section data ('profileImage', 'image', 'avatar', 'logo')
          itemIndex={itemIndex} // Index for array items (e.g., 0, 1, 2)
          onSelectImage={handleImageSelected}
        />
      )}
    </div>
  );
};

export default ImageInput;