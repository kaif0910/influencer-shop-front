import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Utility function to match recommendations by profile
function getPersonalizedRecommendations(user?: {
  color_season?: string | null;
  body_type?: string | null;
  style_preference?: string | null;
}) {
  // Prefer color_season as skin tone proxy; height not tracked in AuthUser yet
  const skinTone = user?.color_season ?? "all";
  const height: number | undefined = undefined;

  // This could be dynamic: here we filter by example skin tone and mock logic
  const influencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      category: "Fashion",
      followers: "125K",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      reason: `Great for ${skinTone || "all"} skin tones`,
    },
    {
      id: 2,
      name: "Mike Chen",
      category: "Fitness",
      followers: "89K",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      reason: height && Number(height) > 175 ? "Tall-fit specialist" : "Fitness for all heights",
    },
    {
      id: 3,
      name: "Emma Davis",
      category: "Beauty",
      followers: "234K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      reason: "Popular in your area",
    },
  ];

  // Example: filter products
  const products = [
    {
      id: 1,
      name: "Wireless Earbuds Pro",
      price: "₹8,999",
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop",
      influencer: "Sarah Johnson",
      category: "Tech",
      skinTones: ["fair", "medium", "olive", "dark"],
      recommendedHeights: [150, 180],
    },
    {
      id: 2,
      name: "Organic Face Serum",
      price: "₹2,499",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
      influencer: "Emma Davis",
      category: "Beauty",
      skinTones: ["light", "medium", "olive"],
      recommendedHeights: [],
    },
    {
      id: 3,
      name: "TallFit Jeans",
      price: "₹2,199",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
      influencer: "Mike Chen",
      category: "Fashion",
      skinTones: ["all"],
      recommendedHeights: [175, 190],
    },
  ];

  // Personalized filter (very simplified for demo)
  const matchedProducts = products.filter((p) => {
    const toneOk = !p.skinTones || p.skinTones.includes(skinTone) || p.skinTones.includes("all");
    const heightOk =
      !p.recommendedHeights || p.recommendedHeights.length === 0 ||
      (typeof height === "number" && p.recommendedHeights.some((h) => Math.abs(height - h) < 8));
    return toneOk && heightOk;
  });

  return { influencers, products: matchedProducts };
}

const PersonalizedFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileHint, setShowProfileHint] = useState(false);

  useEffect(() => {
    // If key profile fields missing, show a friendly hint to complete profile
    if (!user?.color_season || !user?.body_type) {
      setShowProfileHint(true);
    }
  }, [user]);

  // Personalized recommendations using user measurements
  const { influencers: recommendedInfluencers, products: recommendedProducts } =
    getPersonalizedRecommendations(user);

  const followedPosts = [{
    id: 1,
    influencer: "Sarah Johnson",
    content: "Just tried this amazing new skincare routine! My skin has never felt better ✨",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
    likes: 1234,
    timeAgo: "2h"
  }, {
    id: 2,
    influencer: "Mike Chen",
    content: "New workout gear haul! These running shoes are game-changers 🏃‍♂️",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    likes: 892,
    timeAgo: "4h"
  }];
  
  const hasFollowData = false; // TODO: wire to actual follow data when available
  return (
    <div className="space-y-8">
      {showProfileHint && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded flex items-center mb-6">
          <span>
            <strong>Get personalized style picks!</strong> Fill in your measurements
            in your <button className="underline text-brand-700" onClick={() => navigate("/profile")}>profile</button> for smarter recommendations from Styli.
          </span>
        </div>
      )}

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">For You</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* If/when follow data is available, replace this flag */}
          {hasFollowData ? <div>
              <h3 className="text-xl font-semibold mb-4">Latest from your followed creators</h3>
              <div className="space-y-4">
                {followedPosts.map(post => <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mr-3">
                          <span className="text-brand-600 font-semibold">
                            {post.influencer.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{post.influencer}</p>
                          <p className="text-sm text-gray-500">{post.timeAgo} ago</p>
                        </div>
                      </div>
                      <p className="mb-4">{post.content}</p>
                      <img src={post.image} alt="Post content" className="w-full h-64 object-cover rounded-lg mb-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ShoppingBag className="h-4 w-4 mr-1" />
                            Shop
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div> : <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start following influencers</h3>
              <p className="text-gray-600 mb-6">Follow your favorite creators to see their latest posts and recommendations</p>
              <Button onClick={() => navigate('/')}>Discover Influencers</Button>
            </div>}
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Recommended for you</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedInfluencers.map((influencer) => (
                <Card key={influencer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <img src={influencer.image} alt={influencer.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                    <h4 className="font-semibold mb-1">{influencer.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {influencer.category} • {influencer.followers} followers
                    </p>
                    <p className="text-xs text-brand-600 mb-4">{influencer.reason}</p>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/influencer/${influencer.id}`)}>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Products tailored for {user?.name || "you"}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedProducts.length === 0 ? (
                <div className="text-center text-gray-500 col-span-3">
                  No personalized items found for your profile! Try updating your measurements.
                </div>
              ) : (
                recommendedProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-brand-600 font-bold mb-2">{product.price}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Recommended by {product.influencer}
                      </p>
                      <Button size="sm" className="w-full">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-brand-600" />
              Trending Now
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Fashion</span>
                      <span className="text-brand-600">+25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Beauty</span>
                      <span className="text-brand-600">+18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fitness</span>
                      <span className="text-brand-600">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Wireless Earbuds</span>
                      <span className="text-sm text-gray-600">1.2K sold</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Skincare Set</span>
                      <span className="text-sm text-gray-600">890 sold</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Yoga Mat</span>
                      <span className="text-sm text-gray-600">654 sold</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedFeed;
