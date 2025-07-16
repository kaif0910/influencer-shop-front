import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProfileButton from "./ProfileButton";
import AIChatRoom from "./AIChatRoom";
import ImageSearchButton from "./ImageSearchButton";
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
    if (isAuthenticated) {
      navigate("/for-you");
    } else {
      navigate("/auth?intent=shopping");
    }
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
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  placeholder="Search products, influencers..."
                  className="pl-10 bg-muted text-foreground w-full"
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
              <AIChatRoom isOpen={isAIChatOpen} setIsOpen={setIsAIChatOpen} />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <ImageSearchButton />
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
            <ImageSearchButton />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-accent text-foreground"
            >
              <Search className="h-5 w-5" />
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
            <div className="px-3 py-2">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  placeholder="Search products, influencers..." 
                  className="pl-10 w-full bg-muted text-foreground"
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
              <AIChatRoom isOpen={isAIChatOpen} setIsOpen={setIsAIChatOpen} />
            </div>
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
        <Command className="rounded-lg border shadow-md bg-background">
          <CommandInput placeholder="Search products, influencers..." className="text-foreground" />
          <CommandList className="bg-background">
            <CommandEmpty className="text-muted-foreground">No results found.</CommandEmpty>
            <CommandGroup heading="Products">
              <CommandItem className="flex items-center gap-2 py-3 text-foreground hover:bg-accent">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90oy1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                  alt="Headphones" 
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-foreground">Wireless Noise-Cancelling Headphones</p>
                  <p className="text-sm text-muted-foreground">₹20,699</p>
                </div>
              </CommandItem>
              <CommandItem className="flex items-center gap-2 py-3 text-foreground hover:bg-accent">
                <img 
                  src="https://images.unsplash.com/photo-1611741385334-864f40e100b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90oy1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                  alt="Yoga Mat" 
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-foreground">Premium Yoga Mat</p>
                  <p className="text-sm text-muted-foreground">₹7,399</p>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Influencers">
              <CommandItem className="flex items-center gap-2 py-3 text-foreground hover:bg-accent">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Emma Johnson" 
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">Emma Johnson</p>
                  <p className="text-sm text-muted-foreground">Fashion & Style</p>
                </div>
              </CommandItem>
              <CommandItem className="flex items-center gap-2 py-3 text-foreground hover:bg-accent">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Alex Rivera" 
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">Alex Rivera</p>
                  <p className="text-sm text-muted-foreground">Fitness & Wellness</p>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </nav>
  );
};

export default Navbar;