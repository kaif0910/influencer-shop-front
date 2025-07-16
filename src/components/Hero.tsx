
import { Button } from "@/components/ui/button";
import { ShoppingBag, UserPlus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleJoinAsInfluencer = () => {
    if (isAuthenticated) {
      navigate("/influencer-profile");
    } else {
      navigate("/auth?intent=influencer");
    }
  };

  const handleStartShopping = () => {
    if (isAuthenticated) {
      navigate("/for-you");
    } else {
      navigate("/auth?intent=shopping");
    }
  };

  return (
    <div className="relative bg-white pt-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <main className="pt-8 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
            <div className="sm:text-center lg:text-left">
              <span className="inline-flex items-center mb-3 text-brand-700/90 font-semibold">
                <Sparkles className="h-5 w-5 mr-1" />
                <span>India’s most personal style destination</span>
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-playfair">
                <span className="block xl:inline">Discover Styles Curated</span>{" "}
                <span className="block text-brand-600 xl:inline">for You, by India’s Top Influencers</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-6 md:text-xl lg:mx-0 font-medium">
                Shop fashion, beauty, and lifestyle picks tailored to your body and skin tone.<br className="hidden sm:block" />
                Let AI and India’s creators help you find your new wardrobe essentials for any season!
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                <div className="rounded-md shadow">
                  <Button 
                    size="lg" 
                    className="w-full flex items-center justify-center"
                    onClick={handleStartShopping}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Personalize Your Feed
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={handleJoinAsInfluencer}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Join as Influencer
                  </Button>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-start gap-2 sm:items-center sm:flex-row">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold animate-fade-in">
                  AI-Driven Recommendations
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-500 text-xs font-semibold animate-fade-in">
                  Suits Indian Body & Style
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-400 text-xs font-semibold animate-fade-in">
                  Exclusive Influencer Picks
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-64 w-full object-cover sm:h-80 md:h-[27rem] lg:w-full lg:h-full rounded-bl-3xl"
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
          alt="Indian fashion influencer holding clothes shopping bags"
        />
      </div>
    </div>
  );
};

export default Hero;
