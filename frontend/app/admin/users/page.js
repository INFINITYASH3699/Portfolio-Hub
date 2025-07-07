// frontend/app/admin/users/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // For search
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { User, Shield, CheckCircle, XCircle, Trash2, Edit, Loader2, Search as SearchIcon } from 'lucide-react';
import Image from 'next/image';
import AdminUserForm from '@/components/AdminUserForm'; // Import the form component
import { Badge } from '@/components/ui/Badge';

export default function AdminUsersPage() {
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth(); // Renamed 'user' to 'currentUser' to avoid conflict
  const router = useRouter();
  const { toast } = useToast();

  const hasCheckedAuthAndRedirected = useRef(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // User being edited
  const [searchTerm, setSearchTerm] = useState('');
  const fetchUsersTimeoutRef = useRef(null); // For debouncing search

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !hasCheckedAuthAndRedirected.current) {
      if (!isAuthenticated) {
        console.log("AdminUsersPage: Not authenticated, redirecting to signin.");
        router.push('/auth/signin');
        hasCheckedAuthAndRedirected.current = true;
      } else if (currentUser && !currentUser.isAdmin) {
        console.log("AdminUsersPage: Authenticated but not admin, showing toast and redirecting.");
        toast({
          title: "Unauthorized",
          description: "You do not have administrative access.",
          variant: "destructive",
        });
        router.push('/dashboard');
        hasCheckedAuthAndRedirected.current = true;
      } else if (currentUser && currentUser.isAdmin) {
        hasCheckedAuthAndRedirected.current = true;
      }
    }
  }, [isAuthenticated, authLoading, currentUser, router, toast]);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    // Only fetch if auth state is determined and currentUser is confirmed admin
    if (!authLoading && isAuthenticated && currentUser?.isAdmin && hasCheckedAuthAndRedirected.current) {
      setLoadingUsers(true);
      try {
        const response = await api.get('/api/user', { params: { search: searchTerm } }); // Backend should implement search
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    } else if (!authLoading && (!isAuthenticated || !currentUser?.isAdmin)) {
      setLoadingUsers(false);
    }
  }, [isAuthenticated, authLoading, currentUser, searchTerm, toast]);

  // Initial fetch of users and debounced search
  useEffect(() => {
    if (fetchUsersTimeoutRef.current) {
        clearTimeout(fetchUsersTimeoutRef.current);
    }
    if (hasCheckedAuthAndRedirected.current && isAuthenticated && currentUser?.isAdmin) {
        fetchUsersTimeoutRef.current = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
    }
    return () => {
        if (fetchUsersTimeoutRef.current) {
            clearTimeout(fetchUsersTimeoutRef.current);
        }
    };
  }, [fetchUsers, isAuthenticated, currentUser]); // Rerun when search term, auth or currentUser changes


  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId, username) => {
    // Prevent admin from deleting themselves
    if (userId === currentUser._id) {
        toast({
            title: "Cannot Delete",
            description: "You cannot delete your own admin account from this panel.",
            variant: "destructive",
        });
        return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/user/${userId}`);
      toast({
        title: "User Deleted",
        description: `"${username}" has been deleted.`,
        variant: "success",
      });
      fetchUsers(); // Re-fetch list
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleFormSaveSuccess = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  if (authLoading || (!hasCheckedAuthAndRedirected.current && (!isAuthenticated || !currentUser?.isAdmin))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        <p className="mt-4 text-xl text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!currentUser?.isAdmin && hasCheckedAuthAndRedirected.current) {
      return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          Admin: Users
        </h1>
        {/* Create new user is not implemented on backend currently */}
        {/* <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Add New User
        </Button> */}
      </div>

      {isFormOpen ? (
        <AdminUserForm
          user={editingUser}
          onSaveSuccess={handleFormSaveSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <div className="mb-6">
            <Label htmlFor="user-search" className="sr-only">Search Users</Label>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="user-search"
                    type="text"
                    placeholder="Search users by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
          </div>

          {loadingUsers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 space-y-3 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="flex-grow space-y-2">
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <p className="text-lg text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <Card key={user._id} className="group overflow-hidden relative">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={user.profilePicture || "https://via.placeholder.com/150"}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold line-clamp-1">{user.username}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                          {user.isAdmin && <Badge variant="default" className="bg-blue-500 text-white"><Shield className="h-3 w-3 mr-1" /> Admin</Badge>}
                          {user.isActive ? <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge> : <Badge variant="destructive" className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>}
                          {user.subscription?.plan === 'premium' ? <Badge variant="secondary" className="bg-yellow-500 text-white">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        disabled={user._id === currentUser._id} // Prevent admin from deleting self
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}