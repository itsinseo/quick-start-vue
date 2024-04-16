import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/status',
      name: 'terminalStatus',
      component: () => import('../views/TerminalStatusView.vue')
    },
    {
      path: '/management',
      name: 'terminalManagement',
      component: () => import('../views/TerminalManagementView.vue')
    },
    {
      path: '/map',
      name: 'terminalMap',
      component: () => import('../views/TerminalMapView.vue')
    }
  ]
})

export default router