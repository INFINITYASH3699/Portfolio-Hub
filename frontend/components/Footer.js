import Link from 'next/link';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react'; // Example icons for social media links

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Templates", href: "/templates" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Examples", href: "/examples" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" }, // These pages would be separate later
    { name: "Terms of Service", href: "/terms" }, // These pages would be separate later
  ];

  return (
    <footer className="bg-foreground text-background lg:px-24 py-12 md:py-16 border-t-1">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="col-span-1 space-y-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <span className="font-bold text-white text-lg">PH</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              <span className="">PortfolioHub</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground/80">
            Create stunning professional portfolios in minutes.
          </p>
          <div className="flex space-x-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/80 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/80 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/80 transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="mailto:support@portfoliohub.com" className="text-muted-foreground/80 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground/80 transition-colors text-sm">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Support */}
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-white">Legal & Support</h3>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground/80 transition-colors text-sm">
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="text-muted-foreground/80 transition-colors text-sm">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Newsletter / CTA (Optional) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Stay Updated</h3>
            <p className="text-sm text-muted-foreground/80 mb-4">
                Join our newsletter for latest templates and features.
            </p>
            {/* You would integrate a newsletter form here */}
            <form className="flex gap-2">
                <input 
                    type="email" 
                    placeholder="Your email" 
                    className="flex-grow h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button 
                    type="submit" 
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white h-9 px-4 py-2 rounded-md text-sm font-medium hover:from-violet-700 hover:to-indigo-700 transition-colors"
                >
                    Subscribe
                </button>
            </form>
        </div>

      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-muted-foreground/20 text-center text-sm text-muted-foreground/60">
        &copy; {currentYear} PortfolioHub. All rights reserved.
      </div>
    </footer>
  );
}