import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

export interface Post {
  id: string;
  name: string;
  description: string;
  price: string;
  product_link: string;
  media_urls: string[];
  type: 'image' | 'video';
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  users?: {
    id: string;
    name: string;
    avatar_url?: string;
    category?: string;
    is_influencer: boolean;
  };
}

export interface WishlistItem {
  id: string;
  created_at: string;
  posts: Post;
}

class ApiClient {
  private async _fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    gender: 'male' | 'female';
  }) {
    try {
      const response = await this._fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      const response = await this._fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(token?: string) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user };
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; category?: string; influencer_id?: string }) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_author_id_fkey (
          id, name, avatar_url, category, is_influencer
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (params?.limit) {
      const from = ((params.page || 1) - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    if (params?.influencer_id) {
      query = query.eq('author_id', params.influencer_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      posts: data,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        hasMore: data?.length === (params?.limit || 20)
      }
    };
  }

  async getPost(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_author_id_fkey (
          id, name, avatar_url, category, is_influencer, bio
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    return { post: data };
  }

  async createPost(postData: {
    name: string;
    description: string;
    price: string;
    product_link: string;
    media_urls: string[];
    type: 'image' | 'video';
  }) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...postData,
        is_published: true,
      }])
      .select(`
        *,
        users!posts_author_id_fkey (
          id, name, avatar_url, category
        )
      `)
      .single();

    if (error) throw error;
    return { post: data };
  }

  async getMyPosts(params?: { page?: number; limit?: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('posts')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (params?.limit) {
      const from = ((params.page || 1) - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      posts: data,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        hasMore: data?.length === (params?.limit || 20)
      }
    };
  }

  async updatePost(id: string, postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { post: data };
  }

  async deletePost(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Post deleted successfully' };
  }

  // Wishlist endpoints
  async getWishlist() {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        posts (
          *,
          users!posts_author_id_fkey (
            id, name, avatar_url, category
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { wishlistItems: data };
  }

  async addToWishlist(postId: string) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ post_id: postId }])
      .select(`
        *,
        posts (
          *,
          users!posts_author_id_fkey (
            id, name, avatar_url, category
          )
        )
      `)
      .single();

    if (error) throw error;
    return { wishlistItem: data };
  }

  async removeFromWishlist(postId: string) {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('post_id', postId);

    if (error) throw error;
    return { message: 'Item removed from wishlist' };
  }

  async checkWishlist(postId: string) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { isInWishlist: !!data };
  }

  // Users endpoints
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, category, is_influencer')
      .eq('is_influencer', true);

    if (error) throw error;
    return { users: data };
  }

  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { user: data };
  }

  async updateUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { user: data };
  }
}

export const apiClient = new ApiClient();