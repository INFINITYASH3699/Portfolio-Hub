// frontend/app/auth/reset-password/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react'; // Icon for loading state

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL query params

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  // Effect to check for token on load
  useEffect(() => {
    if (!token) {
      setMessage('No reset token found in URL. Please use the link from your email.');
      toast({
        title: "Error",
        description: "Invalid reset link.",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!token) {
      setMessage('No reset token found. Please use the link from your email.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) { // Basic password length validation
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      toast({
        title: "Error",
        description: "Password too short.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      setMessage(response.data.message);
      toast({
        title: "Success",
        description: response.data.message,
        variant: "success",
      });
      // Redirect to signin page after successful reset
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000); // 2 second delay
    } catch (error) {
      console.error("Reset password failed:", error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setMessage(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!token && (
              <p className="text-red-600 text-center text-sm">
                Invalid or missing reset token. Please ensure you clicked the full link from your email.
              </p>
            )}
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
            {message && (
              <p className={`text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/auth/signin" className="underline text-primary hover:text-primary-dark">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}