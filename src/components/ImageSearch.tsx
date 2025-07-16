import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Search, ExternalLink, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import WishlistButton from "./WishlistButton";

interface SearchResult {
  id: string;
  title: string;
  price?: string;
  image: string;
  source: 'internal' | 'external';
  url?: string;
  similarity?: number;
  description?: string;
  influencer?: string;
}

interface ImageSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageSearch = ({ isOpen, onClose }: ImageSearchProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock internal products database for demonstration
  const mockInternalProducts = [
    {
      id: "1",
      title: "Wireless Noise-Cancelling Headphones",
      price: "₹20,699",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      source: "internal" as const,
      similarity: 0.95,
      description: "Premium wireless headphones with active noise cancellation",
      influencer: "Emma Johnson"
    },
    {
      id: "2",
      title: "Premium Yoga Mat",
      price: "₹7,399",
      image: "https://images.unsplash.com/photo-1611741385334-864f40e100b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      source: "internal" as const,
      similarity: 0.88,
      description: "High-quality yoga mat with superior grip",
      influencer: "Alex Rivera"
    }
  ];

  // Mock external search results
  const mockExternalResults = [
    {
      id: "ext-1",
      title: "Similar Wireless Headphones - Amazon",
      price: "₹18,999",
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      source: "external" as const,
      url: "https://amazon.in",
      similarity: 0.92,
      description: "Bluetooth wireless headphones with noise cancellation"
    },
    {
      id: "ext-2",
      title: "Noise Cancelling Headphones - Flipkart",
      price: "₹22,499",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      source: "external" as const,
      url: "https://flipkart.com",
      similarity: 0.87,
      description: "Premium audio experience with advanced noise cancellation"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setActiveTab("results");
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Upload image to your backend
      // 2. Use Google Vision API or similar for image analysis
      // 3. Search your internal database for similar products
      // 4. Use external APIs (Google Shopping, Amazon Product API, etc.) for external results
      
      // For now, we'll use mock data
      const combinedResults = [...mockInternalProducts, ...mockExternalResults]
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      
      setSearchResults(combinedResults);
      toast.success("Found similar products!");
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (result: SearchResult) => {
    if (result.source === 'internal') {
      navigate(`/shop/post/${result.id}`);
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  const internalResults = searchResults.filter(r => r.source === 'internal');
  const externalResults = searchResults.filter(r => r.source === 'external');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-600" />
            Visual Product Search
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="results" disabled={!selectedImage}>
                Search Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Upload an image to find similar products on our platform and across the web
                </p>
                
                {selectedImage && (
                  <div className="relative inline-block">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="max-w-xs max-h-64 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      ✕
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from Device
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
                
                {selectedImage && (
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full sm:w-auto"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Find Similar Products
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No search results yet. Upload an image to get started.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Internal Results */}
                  {internalResults.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Badge variant="default">Our Platform</Badge>
                        Similar products from InfluStyle
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {internalResults.map((result) => (
                          <Card 
                            key={result.id} 
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleProductClick(result)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img 
                                  src={result.image} 
                                  alt={result.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 space-y-2">
                                  <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
                                  {result.price && (
                                    <p className="text-brand-600 font-semibold">{result.price}</p>
                                  )}
                                  {result.influencer && (
                                    <p className="text-xs text-gray-500">by {result.influencer}</p>
                                  )}
                                  {result.similarity && (
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(result.similarity * 100)}% match
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <WishlistButton 
                                    postId={result.id}
                                    size="icon"
                                    variant="ghost"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Results */}
                  {externalResults.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Badge variant="outline">External</Badge>
                        Similar products from other sites
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {externalResults.map((result) => (
                          <Card 
                            key={result.id} 
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleProductClick(result)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img 
                                  src={result.image} 
                                  alt={result.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 space-y-2">
                                  <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
                                  {result.price && (
                                    <p className="text-green-600 font-semibold">{result.price}</p>
                                  )}
                                  {result.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">{result.description}</p>
                                  )}
                                  {result.similarity && (
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(result.similarity * 100)}% match
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <ExternalLink className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageSearch;