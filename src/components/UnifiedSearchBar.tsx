import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Camera, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useImageSearch } from "@/hooks/useImageSearch";
import WishlistButton from "./WishlistButton";

interface UnifiedSearchBarProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
}

const UnifiedSearchBar = ({ 
  placeholder = "Search products, influencers...", 
  className = "",
  onClose 
}: UnifiedSearchBarProps) => {
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [textQuery, setTextQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { searchResults, isSearching, searchByImage, clearResults } = useImageSearch();

  // Mock text search results
  const textSearchResults = [
    {
      id: "1",
      type: "product",
      title: "Wireless Noise-Cancelling Headphones",
      price: "₹20,699",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      influencer: "Emma Johnson"
    },
    {
      id: "2", 
      type: "influencer",
      title: "Emma Johnson",
      subtitle: "Fashion & Style",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowResults(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;
    
    // Convert base64 to file for the search
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    const file = new File([blob], "search-image.jpg", { type: "image/jpeg" });
    
    await searchByImage(file);
  };

  const handleTextSearch = () => {
    if (!textQuery.trim()) return;
    setShowResults(true);
    // In a real implementation, you would call your text search API here
  };

  const handleModeSwitch = (mode: 'text' | 'image') => {
    setSearchMode(mode);
    setSelectedImage(null);
    setTextQuery('');
    setShowResults(false);
    clearResults();
  };

  const handleResultClick = (result: any) => {
    if (result.type === 'influencer') {
      navigate(`/influencer/${result.id}`);
    } else if (result.source === 'internal') {
      navigate(`/shop/post/${result.id}`);
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
    onClose?.();
  };

  const internalResults = searchResults.filter(r => r.source === 'internal');
  const externalResults = searchResults.filter(r => r.source === 'external');
  const displayResults = searchMode === 'text' ? textSearchResults : searchResults;

  return (
    <div className={`w-full ${className}`}>
      {/* Search Mode Toggle */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={searchMode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeSwitch('text')}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Text Search
        </Button>
        <Button
          variant={searchMode === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeSwitch('image')}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Visual Search
        </Button>
      </div>

      {/* Search Input Area */}
      {searchMode === 'text' ? (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-12"
            onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
          />
          <Button
            size="sm"
            className="absolute right-1 top-1 h-8"
            onClick={handleTextSearch}
            disabled={!textQuery.trim()}
          >
            Search
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Search image"
                className="w-full max-h-48 object-contain rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload an image to find similar products</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Take Photo
                </Button>
              </div>
            </div>
          )}
          
          {selectedImage && (
            <Button
              onClick={handleImageSearch}
              disabled={isSearching}
              className="w-full"
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
        </div>
      )}

      {/* Search Results */}
      {showResults && displayResults.length > 0 && (
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
          {searchMode === 'image' && internalResults.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="default">Our Platform</Badge>
                Similar products from InfluStyle
              </h3>
              <div className="space-y-2">
                {internalResults.map((result) => (
                  <Card 
                    key={result.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
                          {result.price && (
                            <p className="text-brand-600 font-semibold">{result.price}</p>
                          )}
                          {result.influencer && (
                            <p className="text-xs text-gray-500">by {result.influencer}</p>
                          )}
                          {result.similarity && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {Math.round(result.similarity * 100)}% match
                            </Badge>
                          )}
                        </div>
                        <WishlistButton postId={result.id} size="icon" variant="ghost" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchMode === 'image' && externalResults.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">External</Badge>
                Similar products from other sites
              </h3>
              <div className="space-y-2">
                {externalResults.map((result) => (
                  <Card 
                    key={result.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
                          {result.price && (
                            <p className="text-green-600 font-semibold">{result.price}</p>
                          )}
                          {result.similarity && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {Math.round(result.similarity * 100)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchMode === 'text' && (
            <div className="space-y-2">
              {textSearchResults.map((result) => (
                <Card 
                  key={result.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{result.title}</h4>
                        {result.price && (
                          <p className="text-brand-600 font-semibold">{result.price}</p>
                        )}
                        {result.subtitle && (
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        )}
                        {result.influencer && (
                          <p className="text-xs text-gray-500">by {result.influencer}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && displayResults.length === 0 && !isSearching && (
        <div className="mt-6 text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No results found. Try a different search.</p>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;