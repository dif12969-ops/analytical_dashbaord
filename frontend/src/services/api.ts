import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface TransactionResponse {
  id: number;
  transaction_number: string;
  instance_date: string;
  area_en: string;
  prop_type_en: string;
  trans_value: number;
  actual_area: number;
  rooms_en: string;
  is_offplan_en: string;
}

export interface SummaryStats {
  total_value: number;
  transaction_count: number;
  avg_price: number;
  avg_area: number;
  price_per_sqft: number;
}

export interface TrendData {
  date: string;
  value: number;
  volume: number;
  avg_price_per_sqft: number;
}

export interface DistributionItem {
  label: string;
  value: number;
  count: number;
}

export interface AmenitySummary {
  top_metros: DistributionItem[];
  top_malls: DistributionItem[];
  top_landmarks: DistributionItem[];
}

export interface FilterParams {
  start_date?: string;
  end_date?: string;
  area?: string;
  prop_type?: string;
  is_offplan?: string;
  rooms?: string;
}

export const analyticsService = {
  getSummary: async (params: FilterParams = {}): Promise<SummaryStats> => {
    const response = await api.get('/summary', { params });
    return response.data;
  },
  getTrends: async (params: FilterParams = {}, interval: string = 'month'): Promise<TrendData[]> => {
    const response = await api.get('/trends', { params: { ...params, interval } });
    return response.data;
  },
  getDistribution: async (category: string, params: FilterParams = {}, limit?: number): Promise<DistributionItem[]> => {
    const response = await api.get(`/distribution/${category}`, { params: { ...params, limit } });
    return response.data;
  },
  getAmenities: async (params: FilterParams = {}): Promise<AmenitySummary> => {
    const response = await api.get('/amenities', { params });
    return response.data;
  },
  getProjects: async (params: FilterParams = {}): Promise<DistributionItem[]> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  getTransactions: async (skip = 0, limit = 50, params: FilterParams = {}) => {
    const response = await api.get('/transactions', { params: { skip, limit, ...params } });
    return response.data;
  },
};
