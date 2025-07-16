
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const HowItWorks = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleJoinAsInfluencer = () => {
    if (isAuthenticated) {
      // Redirect to influencer profile page
      navigate("/influencer-profile");
    } else {
      // Redirect to auth page with influencer intent
      navigate("/auth?intent=influencer");
    }
  };

  const handleStartShopping = () => {
    if (isAuthenticated) {
      // Redirect to personalized For You page
      navigate("/for-you");
    } else {
      // Redirect to auth page with shopping intent
      navigate("/auth?intent=shopping");
    }
  };

  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            InfluStyle connects influencers with shoppers for an authentic shopping experience.
          </p>
        </div>

        <div className="mt-12">
          <div id="for-influencers" className="mb-20">
            <h3 className="text-xl font-semibold text-center mb-8 flex items-center justify-center">
              <User className="mr-2 h-5 w-5 text-brand-600" />
              <span>For Influencers</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in" style={{ animationDelay: "0ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">1</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Create Your Profile</h4>
                <p className="text-gray-600">Sign up and build your influencer profile showcasing your niche and audience.</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: "150ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">2</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Share Product Links</h4>
                <p className="text-gray-600">Add your favorite products with personalized recommendations and earn commission.</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">3</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Grow Your Income</h4>
                <p className="text-gray-600">Track your performance and earn money from sales through your custom links.</p>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <Button onClick={handleJoinAsInfluencer}>
                Join as Influencer
              </Button>
            </div>
          </div>
          
          <div id="for-shoppers" className="mt-20">
            <h3 className="text-xl font-semibold text-center mb-8 flex items-center justify-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-brand-600" />
              <span>For Shoppers</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in" style={{ animationDelay: "0ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">1</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Discover Products</h4>
                <p className="text-gray-600">Browse products recommended by influencers you trust across different categories.</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: "150ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">2</span>
                </div>
                <h4 className="font-medium text-lg mb-2">See Authentic Reviews</h4>
                <p className="text-gray-600">Read honest opinions and see real-world usage before making purchase decisions.</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-700">3</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Shop with Confidence</h4>
                <p className="text-gray-600">Buy products knowing they're recommended by content creators you follow and trust.</p>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <Button onClick={handleStartShopping}>Start Shopping</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
