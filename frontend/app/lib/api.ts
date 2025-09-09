import axios from 'axios';
import { Repository } from '../components/ui/RepositoryCard';
import { getApiUrl } from './config';

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
});

export interface TrendingQuery {
  language?: string;
  min_stars?: number;
  max_stars?: number;
  date_range?: 'today' | 'week' | 'month' | 'all';
  limit?: number;
  offset?: number;
}

export interface TrendingResponse {
  repositories: Repository[];
  has_more: boolean;
  total: number;
  limit: number;
  offset: number;
}

export interface SearchQuery {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  repositories: Repository[];
  has_more: boolean;
  query: string;
  total: number;
  limit: number;
  offset: number;
}

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  message: string;
  subscription_id: number;
  unsubscribe_url: string;
}

export interface UnsubscribeResponse {
  message: string;
  email: string;
}

export interface StatusResponse {
  subscribed: boolean;
  email: string;
}

export interface NewsletterError {
  error: string;
  code: string;
}

export const repositoryApi = {
  getTrendingRepositories: async (
    params: TrendingQuery = {}
  ): Promise<TrendingResponse> => {
    const response = await apiClient.get('/repositories/trending', { params });
    return response.data;
  },

  searchRepositories: async (params: SearchQuery): Promise<SearchResponse> => {
    const response = await apiClient.get('/repositories/search', { params });
    return response.data;
  },
};

export const newsletterApi = {
  subscribe: async (email: string): Promise<SubscribeResponse> => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  },

  unsubscribe: async (token: string): Promise<UnsubscribeResponse> => {
    const response = await apiClient.get(`/newsletter/unsubscribe/${token}`);
    return response.data;
  },

  getStatus: async (email: string): Promise<StatusResponse> => {
    const response = await apiClient.get(`/newsletter/status/${email}`);
    return response.data;
  },
};

export default apiClient;
