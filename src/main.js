import './assets/main.css'

import { createApp } from 'vue'
// import App from './App.vue'
import App from '@/applications/ExternalApiApp.vue'
import 'primevue/resources/themes/nova/theme.css'

import PrimeVue from 'primevue/config'

const app = createApp(App)

app.use(PrimeVue)
app.mount('#app')
