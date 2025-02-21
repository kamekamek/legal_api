import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface Project {
  id: string;
  name: string;
  location: string;
  scale: string;
  usage_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const fetchProjectById = async (id: string): Promise<Project> => {
  const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  const response = await axios.put(`${API_BASE_URL}/projects/${id}`, data);
  return response.data;
}; 