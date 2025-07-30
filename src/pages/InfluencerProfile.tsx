import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import NewPostForm from "../components/NewPostForm";
import InfluencerPosts from "../components/InfluencerPosts";
import { useAuth } from "@/hooks/useAuth";

const InfluencerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading, updateUser } = useAuth();
  const [localUser, setLocalUser] = useState<any>(user);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Not logged in",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    if (user && !user.is_influencer) {
      // Upgrade user to influencer
      (async () => {
        try {
          await updateUser({ is_influencer: true });
          toast({
            title: "Welcome Influencer!",
            description: "Your account has been upgraded to an influencer account.",
          });
        } catch (e) {
          toast({
            title: "Upgrade failed",
            description: "Could not upgrade to influencer. Please try again.",
            variant: "destructive",
          });
        }
      })();
    }
    setLocalUser(user);
  }, [user, isLoading, navigate, toast, updateUser]);

  if (isLoading || !localUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Influencer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your content, view analytics, and grow your audience
          </p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6">
            {/* --- Removed ImportImageGallery here as it's already included in Create New Post --- */}
            {/* --- Existing Create New Post/Posts UI below --- */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <NewPostForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <InfluencerPosts />
              </CardContent>
// ...existing code...
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={localUser?.category || "Fashion & Style"}
                      onChange={e => setLocalUser({ ...localUser, category: e.target.value })}
                    >
                      <option value="Fashion & Style">Fashion & Style</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Fitness & Wellness">Fitness & Wellness</option>
                      <option value="Home & Lifestyle">Home & Lifestyle</option>
                      <option value="Tech & Gadgets">Tech & Gadgets</option>
                      <option value="Food & Cooking">Food & Cooking</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      className="w-full border rounded-md p-2 min-h-32"
                      value={localUser?.bio || ""}
                      onChange={e => setLocalUser({ ...localUser, bio: e.target.value })}
                      placeholder="Tell your followers about yourself..."
                    />
                  </div>
                  <Button
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await updateUser({
                          category: localUser?.category,
                          bio: localUser?.bio,
                        });
                        toast({
                          title: "Profile Updated",
                          description: "Your influencer profile has been updated.",
                        });
                      } catch (e) {
                        toast({
                          title: "Update failed",
                          description: "Could not update profile. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default InfluencerProfile;