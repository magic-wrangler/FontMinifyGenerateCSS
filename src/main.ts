import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import 'virtual:uno.css'
import '@/style/main.css'
import 'ant-design-vue/dist/reset.css';


const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')

