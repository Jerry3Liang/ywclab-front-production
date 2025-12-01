import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router/router.js';
import VDatePicker from 'v-calendar';
import i18n from './plugins/vue-i18n.js';

createApp(App)
    .use(router)
    .use(createPinia())
    .use(VDatePicker, {})
    .use(i18n)
    .mount('#app')
