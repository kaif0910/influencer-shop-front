import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "@/utils/localStorage";
const PersonalizedFeed = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  // Mock data for personalized recommendations
  const recommendedInfluencers = [{
    id: 1,
    name: "Sarah Johnson",
    category: "Fashion",
    followers: "125K",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    reason: "Matches your style preferences"
  }, {
    id: 2,
    name: "Mike Chen",
    category: "Fitness",
    followers: "89K",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    reason: "Based on your fitness goals"
  }, {
    id: 3,
    name: "Emma Davis",
    category: "Beauty",
    followers: "234K",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    reason: "Popular in your area"
  }];
  const recommendedProducts = [{
    id: 1,
    name: "Wireless Earbuds Pro",
    price: "₹8,999",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop",
    influencer: "Sarah Johnson",
    category: "Tech"
  }, {
    id: 2,
    name: "Organic Face Serum",
    price: "₹2,499",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
    influencer: "Emma Davis",
    category: "Beauty"
  }, {
    id: 3,
    name: "Running Shoes",
    price: "₹12,999",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    influencer: "Mike Chen",
    category: "Fitness"
  }];
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
  return <div className="space-y-8">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">For You</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {user?.followedInfluencers?.length > 0 ? <div>
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
              {recommendedInfluencers.map(influencer => <Card key={influencer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <img src={influencer.image} alt={influencer.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                    <h4 className="font-semibold mb-1">{influencer.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{influencer.category} • {influencer.followers} followers</p>
                    <p className="text-xs text-brand-600 mb-4">{influencer.reason}</p>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/influencer/${influencer.id}`)}>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Products you might like</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedProducts.map(product => <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h4 className="font-semibold mb-2">{product.name}</h4>
                    <p className="text-brand-600 font-bold mb-2">{product.price}</p>
                    <p className="text-sm text-gray-600 mb-4">Recommended by {product.influencer}</p>
                    <Button size="sm" className="w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Product
                    </Button>
                  </CardContent>
                </Card>)}
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
    </div>;
};
export default PersonalizedFeed;