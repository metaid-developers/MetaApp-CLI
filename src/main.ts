import { createApp } from 'vue'
import { pinia } from './stores'
import './style.css'
import App from './App.vue'
import Image from '@/components/Image/Image.vue'
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue'
import './index.scss'


const app = createApp(App)
 app.component('UserAvatar', UserAvatar)
 app.component('Image', Image)
app.use(pinia)
app.mount('#app')
