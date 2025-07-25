import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, UserRound } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MeasurementGuide from "../components/MeasurementGuide";
import Navbar from "../components/Navbar";
import BodyTypeSelectWithImage from "../components/BodyTypeSelectWithImage";
import BodyTypeUserGuide from "../components/BodyTypeUserGuide";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().regex(/^\d{10}$/, { message: "Phone must be 10 digits" }).optional(),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
});

// Measurements form schema
const measurementsSchema = z.object({
  height: z.string().min(1, { message: "Height is required" }),
  chest: z.string().optional(),
  waist: z.string().optional(),
  hips: z.string().optional(),
  shoeSize: z.string().optional(),
  skinTone: z.string().optional(),
});

type Gender = "male" | "female";
type BodyType =
  | "pear"
  | "hourglass"
  | "rectangle"
  | "invertedTriangle"
  | "trapezoid"
  | "triangle"
  | "";
type StylePreference =
  | "casual"
  | "formal"
  | "athletic"
  | "streetwear"
  | "";
type ColorSeason = "spring" | "summer" | "autumn" | "winter" | "";

type ProfileFormValues = z.infer<typeof profileSchema> & {
  bodyType?: BodyType;
  stylePreference?: StylePreference;
  colorSeason?: ColorSeason;
  notes?: string;
};
type MeasurementsFormValues = z.infer<typeof measurementsSchema>;

// ==================== OPTIONS ARRAYS (For Select Inputs) ===========================
const bodyTypeOptions = [
  { value: "", label: "Select Body Type" },
  { value: "pear", label: "Pear (wider hips, narrow shoulders)" },
  { value: "hourglass", label: "Hourglass (bust ≈ hips, narrow waist)" },
  { value: "rectangle", label: "Rectangle (bust ≈ waist ≈ hips)" },
  { value: "invertedTriangle", label: "Inverted Triangle (broad shoulders, slimmer hips)" },
  { value: "trapezoid", label: "Trapezoid (men, broad shoulders, slim waist)" },
  { value: "triangle", label: "Triangle (men, narrower shoulders, wider waist/hips)" }
];

const stylePreferenceOptions = [
  { value: "", label: "Select Style Preference" },
  { value: "casual", label: "Casual (comfortable, relaxed)" },
  { value: "formal", label: "Formal (tailored, elegant)" },
  { value: "athletic", label: "Athletic (sporty, functional)" },
  { value: "streetwear", label: "Streetwear (urban, trend-driven)" }
];

const colorSeasonOptions = [
  { value: "", label: "Select Color Season" },
  { value: "spring", label: "Spring (warm, clear, light)" },
  { value: "summer", label: "Summer (cool, soft, light)" },
  { value: "autumn", label: "Autumn (warm, deep, earthy)" },
  { value: "winter", label: "Winter (cool, intense, deep)" }
];

const Profile = () => {
  const { user, isAuthenticated, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Helper to sanitize gender from user data
  const sanitizeGender = (raw: any): Gender => {
    return raw === "male" || raw === "female" ? raw : "male";
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: sanitizeGender(user?.gender),
      bodyType: (user?.body_type as BodyType) || "",
      stylePreference: (user?.style_preference as StylePreference) || "",
      colorSeason: (user?.color_season as ColorSeason) || "",
      notes: user?.notes || "",
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.setValue("name", user.name || "");
      profileForm.setValue("email", user.email || "");
      profileForm.setValue("phone", user.phone || "");
      profileForm.setValue("gender", sanitizeGender(user.gender));
      profileForm.setValue("bodyType", (user.body_type as BodyType) || "");
      profileForm.setValue("stylePreference", (user.style_preference as StylePreference) || "");
      profileForm.setValue("colorSeason", (user.color_season as ColorSeason) || "");
      profileForm.setValue("notes", user.notes || "");
    }
  }, [user, profileForm]);

  const measurementsForm = useForm<MeasurementsFormValues>({
    resolver: zodResolver(measurementsSchema),
    defaultValues: {
      height: "",
      chest: "",
      waist: "",
      hips: "",
      shoeSize: "",
      skinTone: "",
    }
  });

  // Handle avatar upload
  const handleAvatarClick = () => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await updateUser({ avatar_url: e.target?.result as string });
        toast.success("Profile picture updated");
      } catch (error) {
        toast.error("Failed to update profile picture");
      }
    };
    reader.readAsDataURL(file);
  };

  // Get the first letter safely for the avatar fallback
  const getInitial = () => {
    if (user && user.name && typeof user.name === 'string' && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // ----------------------- Profile Submit with extra data --------------------------
  const handleProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUser({
        name: data.name,
        phone: data.phone || "",
        gender: data.gender,
        body_type: data.bodyType,
        style_preference: data.stylePreference,
        color_season: data.colorSeason,
        notes: data.notes,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // ------------- MEASUREMENTS FORM SUBMIT HANDLER ---------------
  const handleMeasurementsSubmit = (data: MeasurementsFormValues) => {
    // For now, just show success message since measurements aren't in the backend yet
    toast.success("Measurements updated successfully!");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please log in to view your profile.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-brand-50">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div 
                className={`relative ${isEditMode ? "cursor-pointer" : ""}`}
                onClick={handleAvatarClick}
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-brand-600 text-white text-2xl">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Camera className="text-white" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        variant={isEditMode ? "outline" : "default"}
                        disabled={activeTab === "measurements"}
                        className={activeTab === "measurements" ? "cursor-not-allowed opacity-60" : ""}
                      >
                        {isEditMode ? "Cancel" : "Edit Profile"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {activeTab === "measurements" && (
                    <TooltipContent>
                      Switch to the Profile tab to edit your details.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="p-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  {/* ----- Full Name ----- */}
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field} 
                            disabled={!isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Gender ----- */}
                  <FormField
                    control={profileForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <div>
                            <select
                              {...field}
                              disabled={!isEditMode}
                              className="w-full bg-white border border-gray-300 rounded px-4 py-2 mt-1 disabled:bg-gray-100"
                              onChange={e => {
                                field.onChange(e); // update form
                                // reset body type value if gender changes
                                profileForm.setValue("bodyType", "");
                              }}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Body Type (with image, filtered by gender) ----- */}
                  <FormField
                    control={profileForm.control}
                    name="bodyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Type</FormLabel>
                        <FormControl>
                          <BodyTypeSelectWithImage
                            value={field.value || ""}
                            gender={profileForm.watch("gender")}
                            onChange={val => field.onChange(val)}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Style Preference (new) ----- */}
                  <FormField
                    control={profileForm.control}
                    name="stylePreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style Preference</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={!isEditMode}
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 mt-1 disabled:bg-gray-100"
                          >
                            {stylePreferenceOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Color Season (new) ----- */}
                  <FormField
                    control={profileForm.control}
                    name="colorSeason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Season / Skin Undertone</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={!isEditMode}
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 mt-1 disabled:bg-gray-100"
                          >
                            {colorSeasonOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Email ----- */}
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your email" 
                            type="email" 
                            {...field} 
                            disabled={true} // Always disabled to restrict editing
                            className="bg-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </FormItem>
                    )}
                  />

                  {/* ----- Phone ----- */}
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-gray-100">+91</div>
                            <Input 
                              placeholder="9876543210" 
                              className="rounded-l-none" 
                              maxLength={10}
                              {...field} 
                              disabled={!isEditMode}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ----- Notes (optional, new) ----- */}
                  <FormField
                    control={profileForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Notes (optional)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            disabled={!isEditMode}
                            className="w-full rounded border border-gray-300 px-3 py-2 bg-white disabled:bg-gray-100 resize-none"
                            rows={2}
                            placeholder="Anything you'd like to add (e.g. fit challenges, preferences)..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditMode && (
                    <Button type="submit" className="w-full md:w-auto">Save Changes</Button>
                  )}
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="measurements" className="mt-6">
              <Form {...measurementsForm}>
                <form onSubmit={measurementsForm.handleSubmit(handleMeasurementsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={measurementsForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="170" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={measurementsForm.control}
                      name="chest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chest/Bust (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="90" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={measurementsForm.control}
                      name="waist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waist (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="75" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={measurementsForm.control}
                      name="hips"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hips (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="95" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={measurementsForm.control}
                      name="shoeSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoe Size</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="9" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={measurementsForm.control}
                      name="skinTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skin Tone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select skin tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="olive">Olive</SelectItem>
                              <SelectItem value="tan">Tan</SelectItem>
                              <SelectItem value="deep">Deep</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Update Measurements</Button>
                  
                  <MeasurementGuide />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BodyTypeUserGuide />
    </div>
  );
};

export default Profile;