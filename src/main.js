import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import i18nConfig from './i18n'
import './styles.css'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara';

const i18n = createI18n(i18nConfig)

const app = createApp(App)
app.use(i18n);
app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            darkModeSelector: false || 'none'
        }

    }
});
app.mount('#app');