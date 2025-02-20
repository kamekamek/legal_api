import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface ZoningInfo {
  zone_type: string;
  fire_prevention: string;
  coverage_ratio: number;
  floor_area_ratio: number;
  building_area: number;
  total_floor_area: number;
  height_district: string;
  area_classification: string;
  scenic_district: string | null;
}

export interface BuildingRestrictions {
  building_standard_law_48: {
    allowed_uses: string[];
    restrictions: string[];
  };
  law_appendix_2: {
    category: string;
    restrictions: string[];
  };
}

export interface Notification {
  notification_id: string;
  content: string;
  effective_date: string;
}

export interface Regulations {
  notifications: Notification[];
  tokyo_building_safety: {
    article_numbers: string[];
    content: string;
  };
}

export interface LegalInfo {
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  zoning_info: ZoningInfo;
  building_restrictions: BuildingRestrictions;
  regulations: Regulations;
}

export const fetchLegalInfo = async (projectId: string): Promise<LegalInfo> => {
  const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/legal-info`);
  return response.data;
};

export const saveLegalInfo = async (projectId: string, data: LegalInfo): Promise<LegalInfo> => {
  const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/legal-info`, data);
  return response.data;
}; 