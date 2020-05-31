import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';

const prod = process.env.NODE_ENV === 'production';
const shouldSW = 'serviceWorker' in navigator && prod;
const shouldSWDev = 'serviceWorker' in navigator && !prod;

if (shouldSW) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service Worker Registered!');
  });
} else if (shouldSWDev) {
  navigator.serviceWorker.register('/service-worker-dev.js').then(() => {
    console.log('Service Worker Registered!');
  });
}

Vue.config.productionTip = false;
Vue.use(Vuetify);

window.version = 'BUILD_VERSION';

new Vue({
  render: h => h(App),
}).$mount('#app');
