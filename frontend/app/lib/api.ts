import axios from 'axios';
import { Repository } from '../components/ui/RepositoryCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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

export default apiClient;
