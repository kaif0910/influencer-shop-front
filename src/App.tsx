import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
// Removed local AuthProvider; the app is wrapped at the root level in main.tsx
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import InfluencerProfile from "./pages/InfluencerProfile";
import InfluencerTimeline from "./pages/InfluencerTimeline";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import ForYou from "./pages/ForYou";
import AllInfluencers from "./pages/AllInfluencers";
import Categories from "./pages/Categories";
import Shop from "./pages/Shop";
import PostDetails from "./pages/PostDetails";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {/* AuthProvider is provided at the root (main.tsx) */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/for-you" element={<ForYou />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/measurements" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/influencer/:id" element={<InfluencerTimeline />} />
            <Route path="/influencer-profile" element={<InfluencerProfile />} />
            <Route path="/influencers" element={<AllInfluencers />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/post/:id" element={<PostDetails />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;