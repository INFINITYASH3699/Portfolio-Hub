// frontend/app/auth/forgot-password/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react'; // Icon for loading state

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      toast({
        title: "Success",
        description: response.data.message,
        variant: "success",
      });
    } catch (error) {
      console.error("Forgot password request failed:", error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset link. Please try again.';
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
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            {message && (
              <p className={`text-center text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
          <div className="mt-6 text-center text-sm">
            Remember your password?{' '}
            <Link href="/auth/signin" className="underline text-primary hover:text-primary-dark">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}