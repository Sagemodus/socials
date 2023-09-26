//main.js

import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import store from './store/store'
import Swal from 'sweetalert2';
import Vuex from "vuex";



      await store.dispatch("fetchTopics");
      


await store.dispatch("fetchUsers");
library.add(fas)
library.add(far)


const app = createApp(App)
app.use(Vuex);
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(store)
app.config.globalProperties.$swal = Swal;
app.mount('#app')
