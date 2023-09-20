//main.js

import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import './firebase/init'; // Import and initialize Firebase before creating the app
import store from './store/store'
import Swal from 'sweetalert2';
import 'firebase/analytics'; // Importiere Firebase Analytics
import './firebase/init'; // Import and initialize Firebase before creating the app




library.add(fas)
library.add(far)


const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(store)
app.config.globalProperties.$swal = Swal;
app.mount('#app')
