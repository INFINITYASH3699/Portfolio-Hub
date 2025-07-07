// frontend/app/dashboard/subscription/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  Loader2,
  Gem,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react"; // Icons
import Link from "next/link";

export default function SubscriptionPage() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    refreshUser,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingSubscription(true);
    try {
      const response = await api.get("/api/user/subscription");
      setSubscription(response.data);
      setError(null);
      console.log("✅ Subscription status fetched:", response.data);
    } catch (err) {
      console.error("❌ Failed to fetch subscription status:", err);
      setError(
        err.response?.data?.message || "Failed to load subscription status."
      );
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to load subscription details.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubscription(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const handleUpgradeToPremium = async () => {
    if (subscription?.plan === "premium") {
      toast({
        title: "Already Premium",
        description: "You are already on the Premium plan.",
        variant: "default",
      });
      return;
    }

    if (
      !window.confirm(
        "Confirm upgrade to Premium plan? (This is a mock upgrade)"
      )
    ) {
      return;
    }

    setIsUpdatingSubscription(true);
    try {
      // Mock API call for upgrade
      const response = await api.put("/api/user/subscription", {
        plan: "premium",
        status: "active",
        expiresAt: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ), // Expires in 1 year
      });
      setSubscription(response.data.subscription);
      await refreshUser(); // Update global auth context
      toast({
        title: "Upgrade Successful!",
        description: "You are now on the Premium plan!",
        variant: "success",
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
      toast({
        title: "Upgrade Failed",
        description: error.response?.data?.message || "Failed to upgrade plan.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (subscription?.plan === "free" || subscription?.status === "canceled") {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active premium subscription to cancel.",
        variant: "default",
      });
      return;
    }

    if (
      !window.confirm(
        "Confirm cancellation of Premium plan? (This is a mock cancellation)"
      )
    ) {
      return;
    }

    setIsUpdatingSubscription(true);
    try {
      // Mock API call for cancellation
      const response = await api.put("/api/user/subscription", {
        status: "canceled",
        // expiresAt could be set to end of current billing cycle
      });
      setSubscription(response.data.subscription);
      await refreshUser(); // Update global auth context
      toast({
        title: "Cancellation Successful",
        description: "Your Premium plan has been cancelled.",
        variant: "default",
      });
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.message || "Failed to cancel plan.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  if (authLoading || loadingSubscription || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        <p className="mt-4 text-xl text-muted-foreground">
          Loading subscription details...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-24 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
        Subscription Management
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" /> Your Current Plan
          </CardTitle>
          <CardDescription>
            Details about your current PortfolioHub subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold capitalize">
              {subscription?.plan} Plan
            </h3>
            <Badge
              variant={
                subscription?.status === "active" ? "default" : "secondary"
              }
              className={`${
                subscription?.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {subscription?.status === "active" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {subscription?.status}
            </Badge>
          </div>
          <div className="text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Expires:{" "}
              {subscription?.expiresAt
                ? new Date(subscription.expiresAt).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Price:{" "}
              {subscription?.plan === "premium"
                ? "\$9.99/month (mock)"
                : "Free"}
            </p>
          </div>
          {subscription?.plan === "free" && (
            <p className="text-sm">
              Upgrade to Premium for unlimited portfolios, custom domains, and
              advanced analytics.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-end">
          {subscription?.plan === "free" ? (
            <Button
              onClick={handleUpgradeToPremium}
              disabled={isUpdatingSubscription}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            >
              {isUpdatingSubscription ? (
                <>
                  Upgrading... <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                </>
              ) : (
                "Upgrade to Premium"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCancelSubscription}
              disabled={isUpdatingSubscription}
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
            >
              {isUpdatingSubscription ? (
                <>
                  Cancelling...{" "}
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                </>
              ) : (
                "Cancel Premium"
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={fetchSubscriptionStatus}
            disabled={isUpdatingSubscription}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Status
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Future: Billing History Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Billing history will be displayed here once integrated with a
            payment gateway (e.g., Stripe).
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>
            View Invoices
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
