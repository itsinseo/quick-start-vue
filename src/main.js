import './assets/main.css'
import i18nPlugin from './plugins/i18n'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'primevue/resources/themes/aura-light-green/theme.css'

import PrimeVue from 'primevue/config'

const app = createApp(App)

app.use(router)
app.use(PrimeVue)
app.use(i18nPlugin, {
  greetings: {
    hello: 'Bonjour!'
  }
})

app.mount('#app')
