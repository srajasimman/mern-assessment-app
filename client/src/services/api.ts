import axios from 'axios';
import { Assessment, Response } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Assessment APIs
export const getAssessments = async () => {
  const response = await api.get('/assessments');
  return response.data;
};

export const getAssessment = async (id: string) => {
  const response = await api.get(`/assessments/${id}`);
  return response.data;
};

export const getAssessmentWithAnswers = async (id: string) => {
  const response = await api.get(`/assessments/${id}/with-answers`);
  return response.data;
};

export const createAssessment = async (assessmentData: Assessment) => {
  const response = await api.post('/assessments', assessmentData);
  return response.data;
};

export const updateAssessment = async (id: string, assessmentData: Assessment) => {
  const response = await api.put(`/assessments/${id}`, assessmentData);
  return response.data;
};

export const deleteAssessment = async (id: string) => {
  const response = await api.delete(`/assessments/${id}`);
  return response.data;
};

// Import assessment from JSON
export const importAssessment = async (assessmentData: any): Promise<{ success: boolean; assessment: Assessment }> => {
  const response = await axios.post(`${API_URL}/assessments/import`, assessmentData);
  return response.data;
};

// Response APIs
export const submitResponse = async (responseData: { assessmentId: string; answers: number[]; name: string; email: string }) => {
  const response = await api.post('/responses', responseData);
  return response.data;
};

export const getResponse = async (id: string) => {
  const response = await api.get(`/responses/${id}`);
  return response.data;
};

export const getResponsesByAssessment = async (assessmentId: string) => {
  const response = await api.get(`/responses/assessment/${assessmentId}`);
  return response.data;
};

export const deleteResponse = async (id: string) => {
  const response = await api.delete(`/responses/${id}`);
  return response.data;
};