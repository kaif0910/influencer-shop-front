import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Navbar from "../components/Navbar";
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "shopping";
  const [activeTab, setActiveTab] = useState("login");
  const handleLoginSuccess = () => {
    if (intent === "influencer") {
      console.log(intent);
      
      navigate("/influencer-profile");
    } else {
      console.log("User signed up successfully");
      navigate("/for-you");
    }
  };
  const handleSignupSuccess = () => {
    if (intent === "influencer") {
      navigate("/influencer-profile");
    } else {
      navigate("/for-you");
    }
  };
  const getTitle = () => {
    return intent === "influencer" ? "Join as an Influencer" : "Start Shopping";
  };
  const getDescription = () => {
    return intent === "influencer"
      ? "Create an account or login to start your influencer journey"
      : "Create an account or login to start shopping";
  };
  const getIcon = () => {
    return intent === "influencer" ? (
      <UserPlus className="h-6 w-6 text-brand-600" />
    ) : (
      <ShoppingBag className="h-6 w-6 text-brand-600" />
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600">{getDescription()}</p>
          </div>

          <Card>
            <CardHeader>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="login">
                  <div className="space-y-4">
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                    <LoginForm onSuccess={handleLoginSuccess} />
                  </div>
                </TabsContent>
                <TabsContent value="signup">
                  <div className="space-y-4">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Fill out the form below to get started
                    </CardDescription>
                    <SignupForm onSuccess={handleSignupSuccess} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Auth;
