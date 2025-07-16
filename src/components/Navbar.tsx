import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  CommandDialog,
} from "@/components/ui/command";
import ProfileButton from "./ProfileButton";
import UnifiedSearchBar from "./UnifiedSearchBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Add start shopping handler
  const handleStartShopping = () => {
    // Prevent navigation if user is being logged out
    if (!isAuthenticated) {
      navigate("/auth?intent=shopping");
      return;
    }
    
    // Add a small delay to ensure auth state is stable
    setTimeout(() => {
      if (isAuthenticated) {
        navigate("/for-you");
      } else {
        navigate("/auth?intent=shopping");
      }
    }, 100);
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-brand-600 dark:text-brand-400">influ</span>
                <span className="text-black">style</span>
              </span>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-8">
            <Button
              variant="outline"
              className="flex-1 max-w-xl justify-start text-muted-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              Search products, influencers...
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handleStartShopping}
            >
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </Button>
            <a
              href="/categories"
              className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
            >
              Discover
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap">How It Works</a>
            {isAuthenticated ? (
              <ProfileButton />
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth?tab=login")}
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-muted-foreground text-sm"
            >
              Search...
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-foreground hover:bg-accent focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background shadow-lg border-t border-border">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2"
              onClick={() => {
                setIsMenuOpen(false);
                handleStartShopping();
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </Button>
            <a
              href="/categories"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </a>
            <div className="mt-4 space-y-2 px-3">
              {isAuthenticated ? (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = "/profile";
                  }}
                >
                  My Profile
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/auth?tab=login");
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/auth?tab=signup");
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <div className="rounded-lg border shadow-md bg-background p-6 max-w-2xl mx-auto">
          <UnifiedSearchBar onClose={() => setIsSearchOpen(false)} />
        </div>
      </CommandDialog>
    </nav>
  );
};

export default Navbar;