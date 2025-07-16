// Image search API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface ImageSearchResult {
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

export interface ImageSearchResponse {
  success: boolean;
  results: ImageSearchResult[];
  totalResults: number;
  processingTime?: string;
}

class ImageSearchAPI {
  async searchByImage(imageFile: File): Promise<ImageSearchResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/search/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Image search failed');
    }

    return response.json();
  }

  async searchByImageUrl(imageUrl: string): Promise<ImageSearchResponse> {
    const response = await fetch(`${API_BASE_URL}/search/image-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Image URL search failed');
    }

    return response.json();
  }

  async getSearchSuggestions(tags: string[], category?: string) {
    const response = await fetch(`${API_BASE_URL}/search/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags, category }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get suggestions');
    }

    return response.json();
  }
}

export const imageSearchAPI = new ImageSearchAPI();