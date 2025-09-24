import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

const sb = supabase as unknown as SupabaseClient;

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
  private async _fetch(endpoint: string, options: RequestInit = {}, timeoutMs = 20000) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error: unknown) {
      if ((error as { name?: string } | null)?.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  private isAuthWithTokens(data: unknown): data is { access_token: string; refresh_token: string } {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return typeof d['access_token'] === 'string' && typeof d['refresh_token'] === 'string';
  }

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

      // Set Supabase session after backend login
      if (this.isAuthWithTokens(response)) {
        await sb.auth.setSession({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        });
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await sb.auth.getUser();
    if (error) throw error;
    return { user };
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; category?: string; influencer_id?: string }) {
    let query = sb
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
        hasMore: (data?.length || 0) === (params?.limit || 20)
      }
    };
  }

  async getPost(id: string) {
    const { data, error } = await sb
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
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb
      .from('posts')
      .insert([{
        ...postData,
        author_id: user.id,
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
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = sb
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
        hasMore: (data?.length || 0) === (params?.limit || 20)
      }
    };
  }

  async updatePost(id: string, postData: Partial<Post>) {
    const { data, error } = await sb
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
    const { error } = await sb
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Post deleted successfully' };
  }

  // Wishlist endpoints
  async getWishlist() {
    const { data, error } = await sb
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
    await sb.auth.getUser();
    const { data, error } = await sb
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
    const { error } = await sb
      .from('wishlist_items')
      .delete()
      .eq('post_id', postId);

    if (error) throw error;
    return { message: 'Item removed from wishlist' };
  }

  async checkWishlist(postId: string) {
    const { data, error } = await sb
      .from('wishlist_items')
      .select('id')
      .eq('post_id', postId)
      .single();

    if (error && (error as PostgrestError).code !== 'PGRST116') throw error;
    return { isInWishlist: !!data };
  }

  // Users endpoints
  async getUsers() {
    const { data, error } = await sb
      .from('users')
      .select('id, name, email, avatar_url, category, is_influencer')
      .eq('is_influencer', true);

    if (error) throw error;
    return { users: data };
  }

  async getUser(id: string) {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Include Supabase error details for easier debugging
      const e = error as PostgrestError;
      const errorMsg = e.message || e.details || e.hint || JSON.stringify(error);
      throw new Error(`Supabase update error: ${errorMsg}`);
    }
    return { user: data };
  }

  async updateUser(_id: string, userData: Record<string, unknown>) {
    // Always use the current authenticated user's ID
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { user: data };
  }
}

export const apiClient = new ApiClient();