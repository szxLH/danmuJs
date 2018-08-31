import Vue from 'vue'
import App from './App.vue'
import './assets/css/reset.scss'
import './assets/css/index.scss'
import 'lib-flexible/flexible.js'
import './assets/js/touch'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
