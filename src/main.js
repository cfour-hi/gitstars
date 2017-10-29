// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'

import App from './App'

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  require('normalize.css')
  require('font-awesome/css/font-awesome.css')
  require('github-markdown-css')
}

axios.interceptors.response.use(({ data }) => {
  return data
}, err => {
  return Promise.reject(err)
})

axios.get(`/${process.env.NODE_ENV === 'production' ? 'gitstars/' : ''}assets/config.json`).then(({ access, token, username }) => {
  Object.assign(window, {
    username,
    access_token: `${access}${token}`
  })

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
  })
})
