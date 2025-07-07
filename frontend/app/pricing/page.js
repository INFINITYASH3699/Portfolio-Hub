import Link from 'next/link';
import { Button } from '@/components/ui/Button'; // Custom Button
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'; // Custom Card
import { CheckCircle } from 'lucide-react';

export default function PricingPage() {
  const features = {
    free: [
      "1 Portfolio",
      "Basic Templates",
      "Standard URL (username.portfoliohub.com)",
      "Limited Customization",
      "Basic Analytics"
    ],
    premium: [
      "Unlimited Portfolios",
      "Access to All Premium Templates",
      "Custom Domain Support",
      "Advanced Customization Options",
      "Full Analytics Dashboard",
      "Priority Support",
      "No PortfolioHub Branding"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6 text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">Simple & Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan Card */}
              <Card className="flex flex-col">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                  <CardDescription>Perfect for beginners or casual users.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center flex-grow">
                  <div className="text-4xl font-bold mb-6">
                    $0<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left w-full">
                    {features.free.map((feature, index) => (
                      <li key={index} className="flex items-center text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button variant="outline" className="w-full">
                      Get Started for Free
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Premium Plan Card */}
              <Card className="flex flex-col border-2 border-primary shadow-lg">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                    Premium Plan
                  </CardTitle>
                  <CardDescription>Unlock full power for professionals.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center flex-grow">
                  <div className="text-4xl font-bold mb-6">
                    $19<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left w-full">
                    {features.premium.map((feature, index) => (
                      <li key={index} className="flex items-center text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Get Premium Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Elevate Your Portfolio?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of professionals who trust PortfolioHub to showcase their work online.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/templates">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}