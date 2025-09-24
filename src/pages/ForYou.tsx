import { useMemo } from "react";
import Navbar from "../components/Navbar";
import PersonalizedFeed from "../components/PersonalizedFeed";
import Footer from "../components/Footer";
import { useAuth } from "@/hooks/useAuth";

const ForYou = () => {
  const { user } = useAuth();
  // Derive a safe display name to avoid flicker
  const displayName = useMemo(() => user?.name || "User", [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-gray-600">
              Discover products and content tailored just for you
            </p>
          </div>
          
          <PersonalizedFeed />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForYou;
