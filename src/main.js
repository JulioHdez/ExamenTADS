import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import VueApexCharts from 'vue3-apexcharts'
import 'jointjs/dist/joint.css'

console.log('main.js está cargando...')

const app = createApp(App)

console.log('App creada:', app)

app.use(createPinia())
app.use(router)
app.component('apexchart', VueApexCharts)

console.log('Plugins registrados')

app.mount('#app')

console.log('App montada en #app')
