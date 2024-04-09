import './assets/main.css'
import i18nPlugin from './plugins/i18n'

import { createApp } from 'vue'
// import App from './App.vue'
import App from '@/applications/DataTableApp.vue'
import 'primevue/resources/themes/aura-light-purple/theme.css'

import PrimeVue from 'primevue/config'

const app = createApp(App)

app.use(PrimeVue)
app.use(i18nPlugin, {
  greetings: {
    hello: 'Bonjour!'
  }
})

app.mount('#app')
