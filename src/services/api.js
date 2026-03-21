import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Intercepteur requête : injecter le token JWT ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Intercepteur réponse : gérer les erreurs globalement ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    // Afficher les erreurs 5xx automatiquement
    if (error.response?.status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer.')
    }

    return Promise.reject(error)
  },
)

// ── Services API ──────────────────────────────────────────────────────────────

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
}

export const campaignAPI = {
  list:    (params) => api.get('/campaigns', { params }),
  get:     (id)     => api.get(`/campaigns/${id}`),
  create:  (data)   => api.post('/campaigns', data),
  update:  (id, d)  => api.put(`/campaigns/${id}`, d),
  delete:  (id)     => api.delete(`/campaigns/${id}`),
  send:    (id)     => api.post(`/campaigns/${id}/send`),
}

export const clientAPI = {
  list:    (params) => api.get('/clients', { params }),
  get:     (id)     => api.get(`/clients/${id}`),
  create:  (data)   => api.post('/clients', data),
  update:  (id, d)  => api.put(`/clients/${id}`, d),
  delete:  (id)     => api.delete(`/clients/${id}`),
  import:  (data)   => api.post('/clients/import', data),
  segments:()       => api.get('/clients/stats/segments'),
}

export const analyticsAPI = {
  overview:   () => api.get('/analytics/overview'),
  engagement: (params) => api.get('/analytics/engagement', { params }),
  channels:   () => api.get('/analytics/channels'),
  audience:   () => api.get('/analytics/audience'),
}

export const aiAPI = {
  generateContent:  (data) => api.post('/ai/generate-content', data),
  analyzeCampaign:  (data) => api.post('/ai/analyze-campaign', data),
  suggestStrategy:  (data) => api.post('/ai/suggest-strategy', data),
  sentimentAnalysis:(data) => api.post('/ai/sentiment-analysis', data),
  segmentClients:   ()     => api.post('/ai/segment-clients'),
  history:    (params)     => api.get('/ai/history', { params }),
  toggleFavorite: (id)     => api.patch(`/ai/history/${id}/favorite`),
}

export const settingsAPI = {
  getOrg:      () => api.get('/settings/organisation'),
  updateOrg:   (d) => api.put('/settings/organisation', d),
  getTeam:     () => api.get('/settings/team'),
  updateProfile:(d) => api.put('/settings/profile', d),
  updatePassword:(d) => api.put('/settings/password', d),
}

export default api
