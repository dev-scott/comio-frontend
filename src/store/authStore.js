import { create } from 'zustand'
import { authAPI } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const { data } = await authAPI.me()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
    return data
  },

  logout: async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }))
  },
}))

export default useAuthStore
