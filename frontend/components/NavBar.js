"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";

import {
  Menu,
  User,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  GalleryHorizontal,
  PieChart,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

export function NavBar() {
  const { user, logout, isAuthenticated, checkAuth, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      checkAuth();
    }
  }, [pathname, loading, isAuthenticated, checkAuth]);

  const handleSignOut = async () => {
    logout();
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const navLinks = [
    {
      name: "Templates",
      href: "/templates",
      icon: <Layers className="h-4 w-4 mr-2" />,
    },
    {
      name: "Features",
      href: "/features",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: <PieChart className="h-4 w-4 mr-2" />,
    },
    {
      name: "Examples",
      href: "/examples",
      icon: <GalleryHorizontal className="h-4 w-4 mr-2" />,
    },
  ];

  const isPortfolioPage = /^\/portfolio\/[^/]+$/.test(pathname);

  if (isPortfolioPage) {
    return null;
  }

  return (
    <header
      className={`sticky lg:px-24 top-0 z-50 w-full transition-all duration-300 ${"bg-white shadow-sm border-b"}`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <span className="font-bold text-white text-lg">PH</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              PortfolioHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary relative px-1 py-1 ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center">
                {link.icon}
                {link.name}
              </span>
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full animate-fadeIn"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center py-5 gap-2 pl-2 pr-3 relative border border-muted-foreground/20 hover:bg-accent"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullName || "User"}
                      className="h-7 w-7 rounded-full ring-1 ring-background object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-2 ring-background">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.fullName || user?.username || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  {isAuthenticated && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <div className="flex flex-col space-y-3 p-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Signed in as
                  </p>
                  <div className="flex items-center gap-3">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName || "User"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium">
                        {user?.fullName || user?.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* These items need asChild for Link redirection */}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center mb-2">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center mb-2">
                    <UserCircle className="h-4 w-4 mr-2" />{" "}
                    {/* Changed from Settings to UserCircle for consistency */}
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                {user?.username && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/portfolio/${user.username}`}
                      className="flex items-center"
                    >
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut} // This onClick will also trigger menu close
                  className="flex items-center text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-muted-foreground/20 hover:border-muted-foreground/30"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle (uses our custom Dialog) */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            side="right"
            className="fixed top-0 right-0 h-full w-[280px] sm:w-[350px] rounded-l-lg rounded-r-none animate-none translate-x-0 !p-0"
          >
            <DialogHeader className="p-6 pb-4">
              <DialogTitle>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white text-lg">PH</span>
                  </div>
                  <span className="text-xl font-bold">PortfolioHub</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Create your professional portfolio in minutes
              </DialogDescription>
            </DialogHeader>
            <nav className="flex flex-col gap-5 mt-0 p-6 pt-0">
              {loading ? (
                <div className="flex items-center gap-3 mb-4 bg-muted p-3 rounded-lg animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                isAuthenticated && (
                  <div className="flex items-center gap-3 mb-4 bg-muted p-3 rounded-lg">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName || "User"}
                        className="h-12 w-12 rounded-full border-2 border-background object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-2 border-background">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {user?.fullName || user?.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                )
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-base font-medium transition-colors hover:text-primary pl-1 py-1 ${
                    isActive(link.href)
                      ? "text-primary bg-muted pl-3 rounded-lg border-l-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-9 bg-muted rounded"></div>
                    <div className="h-9 bg-muted rounded"></div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    {user?.username && (
                      <Link
                        href={`/portfolio/${user.username}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          size="sm"
                        >
                          <BadgeCheck className="h-4 w-4 mr-2" />
                          View Portfolio
                        </Button>
                      </Link>
                    )}
                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
