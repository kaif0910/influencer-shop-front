import { useState } from 'react';
import { toast } from 'sonner';

interface ImageSearchResult {
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

interface UseImageSearchReturn {
  searchResults: ImageSearchResult[];
  isSearching: boolean;
  searchByImage: (imageFile: File) => Promise<void>;
  searchByUrl: (imageUrl: string) => Promise<void>;
  clearResults: () => void;
}

export const useImageSearch = (): UseImageSearchReturn => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchByImage = async (imageFile: File): Promise<void> => {
    setIsSearching(true);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // In a real implementation, you would call your backend API
      // const response = await fetch('/api/search/image', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const results = await response.json();
      
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults: ImageSearchResult[] = [
        {
          id: "1",
          title: "Wireless Noise-Cancelling Headphones",
          price: "₹20,699",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          source: "internal",
          similarity: 0.95,
          description: "Premium wireless headphones with active noise cancellation",
          influencer: "Emma Johnson"
        },
        {
          id: "ext-1",
          title: "Similar Wireless Headphones - Amazon",
          price: "₹18,999",
          image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          source: "external",
          url: "https://amazon.in",
          similarity: 0.92,
          description: "Bluetooth wireless headphones with noise cancellation"
        }
      ];
      
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} similar products!`);
    } catch (error) {
      console.error('Image search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const searchByUrl = async (imageUrl: string): Promise<void> => {
    setIsSearching(true);
    
    try {
      // In a real implementation, you would call your backend API
      // const response = await fetch('/api/search/image-url', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ imageUrl }),
      // });
      // const results = await response.json();
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: ImageSearchResult[] = [
        {
          id: "2",
          title: "Premium Yoga Mat",
          price: "₹7,399",
          image: "https://images.unsplash.com/photo-1611741385334-864f40e100b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          source: "internal",
          similarity: 0.88,
          description: "High-quality yoga mat with superior grip",
          influencer: "Alex Rivera"
        }
      ];
      
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} similar products!`);
    } catch (error) {
      console.error('Image URL search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    searchByImage,
    searchByUrl,
    clearResults,
  };
};