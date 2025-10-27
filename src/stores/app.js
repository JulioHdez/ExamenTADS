import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    notifications: [],
    theme: 'light',
    sidebarOpen: false
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasNotifications: (state) => state.notifications.length > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read)
  },

  actions: {
    setLoading(loading) {
      this.loading = loading
    },

    addNotification(notification) {
      const id = Date.now()
      this.notifications.push({
        id,
        ...notification,
        timestamp: new Date(),
        read: false
      })
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    markNotificationAsRead(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },

    clearNotifications() {
      this.notifications = []
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    setSidebarOpen(open) {
      this.sidebarOpen = open
    }
  }
})
