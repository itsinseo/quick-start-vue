import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: '대쉬보드'
      }
    },
    {
      path: '/status',
      name: 'terminalStatus',
      component: () => import('../views/TerminalStatusView.vue'),
      meta: {
        title: '터미널 통신 현황'
      }
    },
    {
      path: '/management',
      name: 'terminalManagement',
      component: () => import('../views/TerminalManagementView.vue'),
      meta: {
        title: '터미널 관리'
      }
    },
    {
      path: '/map',
      name: 'terminalMap',
      component: () => import('../views/TerminalMapView.vue'),
      meta: {
        title: '터미널 지도'
      }
    }
  ]
})

export default router