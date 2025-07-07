"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, Instagram,
  Briefcase, GraduationCap, Award, Languages, Trash2, Loader2, ImagePlus
} from 'lucide-react'; // Added Languages, Loader2, ImagePlus
import Image from 'next/image';
import MediaLibraryModal from '@/components/MediaLibraryModal'; // Import Media Library Modal

export default function ProfilePage() {
  const { user, isAuthenticated, loading, refreshUser, logout } = useAuth(); // Added logout for account deletion
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState(() => {
    // Initialize formData once, using user if available.
    // This is called only on the first render.
    if (user) {
      return {
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: user.socialLinks || { linkedin: '', github: '', twitter: '', instagram: '' },
        professionalInfo: {
          title: user.professionalInfo?.title || '',
          company: user.professionalInfo?.company || '',
          experience: user.professionalInfo?.experience || '',
          skills: user.professionalInfo?.skills || [],
          education: user.professionalInfo?.education || [],
          certifications: user.professionalInfo?.certifications || [],
          awards: user.professionalInfo?.awards || [],
          languages: user.professionalInfo?.languages || []
        },
        profilePicture: user.profilePicture || ''
      };
    }
    return {
      fullName: '', username: '', email: '', bio: '', phone: '', location: '', website: '',
      socialLinks: { linkedin: '', github: '', twitter: '', instagram: '' },
      professionalInfo: { title: '', company: '', experience: '', skills: [], education: [], certifications: [], awards: [], languages: [] },
      profilePicture: ''
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // State for media modal
  
  // Use a ref to track if it's the very first time `user` is set,
  // to avoid re-initializing formData on every user object change (e.g., from refreshUser)
  const initialUserLoadRef = useRef(true); 

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

  // Effect to re-populate formData when 'user' object from AuthContext changes
  // This ensures the form data is always synced with the latest user data after a refreshUser call.
  useEffect(() => {
    if (user && (initialUserLoadRef.current || JSON.stringify(formData.email) !== JSON.stringify(user.email))) { // Simple check to avoid deep compare on every render
      console.log("ProfilePage: Syncing formData with user object.");
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: user.socialLinks || { linkedin: '', github: '', twitter: '', instagram: '' },
        professionalInfo: {
          title: user.professionalInfo?.title || '',
          company: user.professionalInfo?.company || '',
          experience: user.professionalInfo?.experience || '',
          skills: user.professionalInfo?.skills || [],
          education: user.professionalInfo?.education || [],
          certifications: user.professionalInfo?.certifications || [],
          awards: user.professionalInfo?.awards || [],
          languages: user.professionalInfo?.languages || []
        },
        profilePicture: user.profilePicture || ''
      });
      initialUserLoadRef.current = false;
    }
  }, [user]); 


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Handle nested properties like 'socialLinks.linkedin'
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        if (prev[parent] && typeof prev[parent] === 'object' && !Array.isArray(prev[parent])) {
          return {
            ...prev,
            [parent]: { ...prev[parent], [child]: value }
          };
        }
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleArrayChange = useCallback((arrayName, index, field, value) => {
    setFormData(prev => {
      const currentArray = prev.professionalInfo[arrayName] || [];
      const newArray = [...currentArray];
      if (!newArray[index]) newArray[index] = {}; // Initialize if new item
      newArray[index] = { ...newArray[index], [field]: value };
      
      // Special handling for date types to ensure consistent format if needed by backend
      if (['startDate', 'endDate', 'issueDate'].includes(field)) {
        newArray[index][field] = value ? new Date(value) : null;
      }

      return {
        ...prev,
        professionalInfo: {
          ...prev.professionalInfo,
          [arrayName]: newArray
        }
      };
    });
  }, []);

  const addArrayItem = useCallback((arrayName, emptyObject) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        [arrayName]: [...(prev.professionalInfo[arrayName] || []), emptyObject]
      }
    }));
  }, []);

  const removeArrayItem = useCallback((arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        [arrayName]: (prev.professionalInfo[arrayName] || []).filter((_, i) => i !== index)
      }
    }));
  }, []);

  const handleSkillsChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
      }
    }));
  }, []);

  const handleProfilePicSelect = useCallback(async (imageUrl) => {
    setFormData(prev => ({ ...prev, profilePicture: imageUrl }));
    // No need to setProfilePicFile, as this is coming from the library, not a direct file upload
    
    // Immediately update the backend with the new profile picture URL
    setIsSaving(true);
    try {
      await api.put('/api/user/profile', { profilePicture: imageUrl });
      await refreshUser(); // Refresh AuthContext to reflect new profile pic
      toast({ title: "Profile Picture Updated!", description: "Your profile picture has been saved.", variant: "success" });
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      toast({ title: "Update Failed", description: error.response?.data?.message || "Failed to update profile picture.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [refreshUser, toast]);

  const handleProfilePicRemove = useCallback(async () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    setIsSaving(true);
    try {
      await api.put('/api/user/profile', { profilePicture: '' }); // Send empty string to clear
      await refreshUser();
      toast({ title: "Profile Picture Removed!", description: "Your profile picture has been cleared.", variant: "success" });
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast({ title: "Removal Failed", description: error.response?.data?.message || "Failed to remove profile picture.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [refreshUser, toast]);


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("ProfilePage: Submitting update. formData:", formData);

    try {
      // Send the entire formData directly, backend handles updates/merges
      const res = await api.put('/api/user/profile', formData);
      console.log("ProfilePage: Backend update response:", res.data);

      await refreshUser(); // CRUCIAL: Re-fetch user data to update AuthContext and re-populate form
      console.log("ProfilePage: refreshUser() completed after update.");
      toast({ title: "Profile Updated!", description: "Your profile information has been saved.", variant: "success" });
    } catch (error) {
      console.error("ProfilePage: Failed to update profile:", error);
      toast({ title: "Update Failed", description: error.response?.data?.message || "An unexpected error occurred while saving profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be lost.")) {
      return;
    }
    setIsDeletingAccount(true);
    try {
      await api.delete('/api/user/account');
      await logout(); // Clear frontend auth state and cookies
      toast({ title: "Account Deleted", description: "Your account has been successfully deleted. We're sad to see you go!", variant: "default" });
      router.push('/'); // Redirect to home or sign-up page
    } catch (error) {
      console.error("ProfilePage: Failed to delete account:", error);
      toast({ title: "Deletion Failed", description: error.response?.data?.message || "An unexpected error occurred while deleting account.", variant: "destructive" });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Render loading skeleton if user data is still loading
  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <User className="h-16 w-16 text-muted-foreground animate-bounce" />
        <p className="mt-4 text-xl text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-24 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
        Edit Your Profile
      </h1>

      <form onSubmit={handleUpdateProfile} className="grid gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Basic Information</CardTitle>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-foreground flex-shrink-0">
                  <Image
                    src={formData.profilePicture || "https://via.placeholder.com/150"}
                    alt="Profile Picture"
                    fill
                    style={{objectFit: 'cover'}}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-grow">
                  <Button type="button" variant="outline" onClick={() => setIsMediaModalOpen(true)} disabled={isSaving}>
                    <ImagePlus className="h-4 w-4 mr-2" /> Upload / Select Image
                  </Button>
                  {formData.profilePicture && (
                    <Button type="button" variant="ghost" onClick={handleProfilePicRemove} disabled={isSaving} className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact Information</CardTitle>
            <CardDescription>Provide ways for others to reach you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={formData.website} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Social Links</CardTitle>
            <CardDescription>Link to your professional social profiles.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="linkedin"><Linkedin className="inline h-4 w-4 mr-1" /> LinkedIn</Label>
              <Input id="linkedin" name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="github"><Github className="inline h-4 w-4 mr-1" /> GitHub</Label>
              <Input id="github" name="socialLinks.github" value={formData.socialLinks.github} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter"><Twitter className="inline h-4 w-4 mr-1" /> Twitter</Label>
              <Input id="twitter" name="socialLinks.twitter" value={formData.socialLinks.twitter} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram"><Instagram className="inline h-4 w-4 mr-1" /> Instagram</Label>
              <Input id="instagram" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Professional Information</CardTitle>
            <CardDescription>Details about your career and expertise.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input id="title" name="professionalInfo.title" value={formData.professionalInfo.title} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="professionalInfo.company" value={formData.professionalInfo.company} onChange={handleChange} />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="experience">Experience Summary</Label>
              <textarea
                id="experience"
                name="professionalInfo.experience"
                value={formData.professionalInfo.experience}
                onChange={handleChange}
                rows="3"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Skills */}
            <div className="grid gap-2 col-span-full border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Skills</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('skills', '')}> {/* Skills are simple strings */}
                  Add Skill
                </Button>
              </div>
              {formData.professionalInfo.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    id={`skill-${index}`}
                    name={`professionalInfo.skills.${index}`}
                    value={skill} // Direct string value
                    onChange={(e) => handleArrayChange('skills', index, null, e.target.value)} // Pass null for field as it's a string array
                    placeholder="e.g. React.js"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeArrayItem('skills', index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>


            {/* Education */}
            <div className="grid gap-4 col-span-full border-t pt-4">
              <div className="flex items-center justify-between">
                <Label><GraduationCap className="inline h-4 w-4 mr-1" /> Education</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('education', { degree: '', institution: '', startDate: '', endDate: '', description: '' })}>
                  Add Education
                </Button>
              </div>
              {formData.professionalInfo.education.map((edu, index) => (
                <Card key={index} className="p-4 bg-muted/20 border-dotted">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                      <Input id={`edu-degree-${index}`} value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                      <Input id={`edu-institution-${index}`} value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-startDate-${index}`}>Start Date</Label>
                      <Input id={`edu-startDate-${index}`} type="date" value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-endDate-${index}`}>End Date</Label>
                      <Input id={`edu-endDate-${index}`} type="date" value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)} />
                    </div>
                    <div className="grid gap-2 col-span-full">
                      <Label htmlFor={`edu-description-${index}`}>Description</Label>
                      <textarea
                        id={`edu-description-${index}`}
                        value={edu.description}
                        onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                        rows="2"
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('education', index)}>Remove</Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Certifications */}
            <div className="grid gap-4 col-span-full border-t pt-4">
              <div className="flex items-center justify-between">
                <Label><Award className="inline h-4 w-4 mr-1" /> Certifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('certifications', { name: '', issuer: '', issueDate: '', credentialUrl: '' })}>
                  Add Certification
                </Button>
              </div>
              {formData.professionalInfo.certifications.map((cert, index) => (
                <Card key={index} className="p-4 bg-muted/20 border-dotted">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`cert-name-${index}`}>Name</Label>
                      <Input id={`cert-name-${index}`} value={cert.name} onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`cert-issuer-${index}`}>Issuer</Label>
                      <Input id={`cert-issuer-${index}`} value={cert.issuer} onChange={(e) => handleArrayChange('certifications', index, 'issuer', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`cert-issueDate-${index}`}>Issue Date</Label>
                      <Input id={`cert-issueDate-${index}`} type="date" value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''} onChange={(e) => handleArrayChange('certifications', index, 'issueDate', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`cert-credentialUrl-${index}`}>Credential URL</Label>
                      <Input id={`cert-credentialUrl-${index}`} value={cert.credentialUrl} onChange={(e) => handleArrayChange('certifications', index, 'credentialUrl', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('certifications', index)}>Remove</Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Languages */}
            <div className="grid gap-4 col-span-full border-t pt-4">
              <div className="flex items-center justify-between">
                <Label><Languages className="inline h-4 w-4 mr-1" /> Languages</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('languages', { name: '', proficiency: 'conversational' })}>
                  Add Language
                </Button>
              </div>
              {formData.professionalInfo.languages.map((lang, index) => (
                <Card key={index} className="p-4 bg-muted/20 border-dotted">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`lang-name-${index}`}>Language</Label>
                      <Input id={`lang-name-${index}`} value={lang.name} onChange={(e) => handleArrayChange('languages', index, 'name', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`lang-proficiency-${index}`}>Proficiency</Label>
                      <select
                        id={`lang-proficiency-${index}`}
                        value={lang.proficiency}
                        onChange={(e) => handleArrayChange('languages', index, 'proficiency', e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('languages', index)}>Remove</Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardFooter>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5" /> Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all your portfolios. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
              {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {isMediaModalOpen && (
        <MediaLibraryModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          portfolioId={user?._id} // Using user's ID for general assets
          currentSection="profile-avatar" // A distinct category for profile images
          onSelectImage={handleProfilePicSelect}
        />
      )}
    </div>
  );
}