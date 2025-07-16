
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedInfluencers from "../components/FeaturedInfluencers";
import HowItWorks from "../components/HowItWorks";
import ProductShowcase from "../components/ProductShowcase";
import Benefits from "../components/Benefits";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import AIChatFAB from "../components/AIChatFAB";
import VisualSearchFAB from "../components/VisualSearchFAB";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-white to-white">
      <Navbar />
      <Hero />
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="flex items-center gap-2 !bg-brand-600 text-white hover:!bg-brand-700 shadow-lg text-lg px-8 py-4 rounded-full transition"
          onClick={() => navigate("/shop")}
          aria-label="Shop the Latest Posts"
        >
          <ShoppingBag className="mr-2 h-6 w-6" />
          Shop the Latest Posts
        </Button>
      </div>
      <section className="container mx-auto mt-8 mb-2 px-4 sm:mt-12">
        {/* Subtitle emphasizing discovery for Indian styles */}
        <div className="mb-2 text-center">
          <span className="text-lg font-semibold text-brand-700">
            Trending Now in Indian Fashion
          </span>
        </div>
      </section>
      <FeaturedInfluencers />
      <HowItWorks />
      <ProductShowcase />
      <Benefits />
      <Footer />
      {/* Floating AI Chat Button */}
      <AIChatFAB />
      {/* Floating Visual Search Button */}
      <VisualSearchFAB />
    </div>
  );
};

export default Index;
