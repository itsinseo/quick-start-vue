import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

// TODO: find out whether it is OK to put icon information in meta tags
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'dashboard' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: '대쉬보드',
        icon: 'pi pi-th-large'
      }
    },
    {
      path: '/status',
      name: 'terminalStatus',
      component: () => import('../views/TerminalStatusView.vue'),
      meta: {
        title: '터미널 통신 현황',
        icon: 'pi pi-wave-pulse'
      }
    },
    {
      path: '/management',
      name: 'terminalManagement',
      component: () => import('../views/TerminalManagementView.vue'),
      meta: {
        title: '터미널 관리',
        icon: 'pi pi-list'
      }
    },
    {
      path: '/map',
      name: 'terminalMap',
      component: () => import('../views/TerminalMapView.vue'),
      meta: {
        title: '터미널 지도',
        icon: 'pi pi-map'
      }
    },
    {
      path: '/chart',
      name: 'terminalChart',
      component: () => import('../views/TerminalChart.vue'),
      meta: {
        title: '터미널 차트',
        icon: 'pi pi-chart-bar'
      }
    }
  ]
})

export default router