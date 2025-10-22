import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

console.log('main.js está cargando...')

const app = createApp(App)

console.log('App creada:', app)

app.use(createPinia())
app.use(router)

console.log('Plugins registrados')

app.mount('#app')

console.log('App montada en #app')
