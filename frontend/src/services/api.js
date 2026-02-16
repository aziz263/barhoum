import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),
};

// Utilisateurs
export const utilisateurAPI = {
  getAll: (params) => api.get('/utilisateurs', { params }),
  getById: (id) => api.get(`/utilisateurs/${id}`),
  create: (data) => api.post('/utilisateurs', data),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
};

// Patients
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Dossiers Médicaux
export const dossierAPI = {
  getAll: (params) => api.get('/dossiers', { params }),
  getById: (id) => api.get(`/dossiers/${id}`),
  create: (data) => api.post('/dossiers', data),
  update: (id, data) => api.put(`/dossiers/${id}`, data),
  delete: (id) => api.delete(`/dossiers/${id}`),
  exportCSV: (id) => api.get(`/dossiers/${id}/csv`, { responseType: 'blob' }),
};

// Signes Vitaux
export const signesVitauxAPI = {
  getAll: (params) => api.get('/signes-vitaux', { params }),
  getById: (id) => api.get(`/signes-vitaux/${id}`),
  create: (data) => api.post('/signes-vitaux', data),
  delete: (id) => api.delete(`/signes-vitaux/${id}`),
};

// Analyses
export const analyseAPI = {
  getAll: (params) => api.get('/analyses', { params }),
  getById: (id) => api.get(`/analyses/${id}`),
  create: (data) => api.post('/analyses', data),
  addResultat: (id, data) => api.post(`/analyses/${id}/resultat`, data),
  delete: (id) => api.delete(`/analyses/${id}`),
};

// Rapports PDF
export const rapportAPI = {
  getAll: (params) => api.get('/rapports', { params }),
  generate: (data) => api.post('/rapports/generate', data),
  download: (id) => api.get(`/rapports/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/rapports/${id}`),
};

// Statistiques
export const statistiqueAPI = {
  getDashboard: () => api.get('/statistiques'),
};

// Documents sécurisés
export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Journal d'activités (logs)
export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getStats: () => api.get('/logs/stats'),
};

export default api;
