// import 'vue-material/dist/vue-material.min.css';
import Vue from 'vue';
// import VueMaterial from 'vue-material';
import App from './App.vue';

Vue.config.productionTip = false;
// Vue.use(VueMaterial);

window.version = 'BUILD_VERSION';

new Vue({
  render: h => h(App),
}).$mount('#app');
