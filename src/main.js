import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import 'primeicons/primeicons.css';

import router from './router';
import i18nPlugin from './plugins/i18n';
import { ToastService } from 'primevue';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

const app = createApp(App);

app.use(router);
app.use(i18nPlugin, {});
app.use(ToastService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
});

app.mount('#app');
