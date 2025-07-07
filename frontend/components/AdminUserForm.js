// frontend/components/AdminUserForm.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/axios';
import { Loader2, Save } from 'lucide-react';
import Image from 'next/image';

const AdminUserForm = ({ user = null, onSaveSuccess, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    _id: user?._id || null,
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    isAdmin: user?.isAdmin ?? false,
    isActive: user?.isActive ?? true,
    profilePicture: user?.profilePicture || '',
    subscription: {
      plan: user?.subscription?.plan || 'free',
      status: user?.subscription?.status || 'active',
    },
    professionalInfo: { // Include professionalInfo to prevent backend merge issues
        skills: user?.professionalInfo?.skills || [],
        education: user?.professionalInfo?.education || [],
        certifications: user?.professionalInfo?.certifications || [],
        awards: user?.professionalInfo?.awards || [],
        languages: user?.professionalInfo?.languages || [],
        title: user?.professionalInfo?.title || '',
        company: user?.professionalInfo?.company || '',
        experience: user?.professionalInfo?.experience || '',
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id,
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        isAdmin: user.isAdmin ?? false,
        isActive: user.isActive ?? true,
        profilePicture: user.profilePicture || '',
        subscription: {
          plan: user.subscription?.plan || 'free',
          status: user.subscription?.status || 'active',
        },
        professionalInfo: {
            skills: user.professionalInfo?.skills || [],
            education: user.professionalInfo?.education || [],
            certifications: user.professionalInfo?.certifications || [],
            awards: user.professionalInfo?.awards || [],
            languages: user.professionalInfo?.languages || [],
            title: user.professionalInfo?.title || '',
            company: user.professionalInfo?.company || '',
            experience: user.professionalInfo?.experience || '',
        }
      });
    } else {
      setFormData({
        _id: null,
        username: '', email: '', fullName: '', isAdmin: false, isActive: true, profilePicture: '',
        subscription: { plan: 'free', status: 'active' },
        professionalInfo: { skills: [], education: [], certifications: [], awards: [], languages: [], title: '', company: '', experience: ''}
      });
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    // Handle nested subscription fields
    if (name.startsWith('subscription.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        subscription: { ...prev.subscription, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let res;
      if (formData._id) {
        // Update existing user
        res = await api.put(`/api/user/${formData._id}`, formData); // Send complete formData
        toast({ title: "User Updated", description: `${res.data.username} updated successfully.`, variant: "success" });
      } else {
        // Create new user (Not implemented in backend currently)
        toast({ title: "Error", description: "Creating new users from admin panel is not yet implemented.", variant: "destructive" });
        setIsSaving(false);
        return;
      }
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to save user:", error.response?.data || error);
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || "An error occurred while saving user.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSaveSuccess, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{user ? `Edit User: ${user.username}` : 'Create New User (Not Implemented)'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username & Full Name */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required disabled={!!formData._id} />
              {formData._id && <p className="text-xs text-muted-foreground">Username cannot be changed after creation.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            {/* Email */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            {/* Profile Picture Preview (Read-only, update via user's own profile page) */}
            {formData.profilePicture && (
                <div className="space-y-2 col-span-full">
                    <Label>Profile Picture</Label>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                        <Image src={formData.profilePicture} alt="Profile Picture" fill objectFit="cover" />
                    </div>
                    <p className="text-xs text-muted-foreground">Update profile picture from user's own profile settings.</p>
                </div>
            )}
          </div>

          <hr />

          {/* Admin & Active Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAdmin: checked }))}
              />
              <Label htmlFor="isAdmin">Is Admin</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
          </div>

          <hr />

          {/* Subscription Details */}
          <h4 className="text-md font-semibold">Subscription</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscriptionPlan">Plan</Label>
              <Select name="subscriptionPlan" value={formData.subscription.plan} onValueChange={(val) => handleSelectChange('subscription.plan', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionStatus">Status</Label>
              <Select name="subscriptionStatus" value={formData.subscription.status} onValueChange={(val) => handleSelectChange('subscription.status', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {isSaving ? (
                <>Saving... <Loader2 className="h-4 w-4 ml-2 animate-spin" /></>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save User</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminUserForm;