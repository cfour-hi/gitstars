// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import { Tag, Input, Button, Popover, Autocomplete } from 'element-ui'

Vue.config.productionTip = false
Vue.use(Tag)
Vue.use(Input)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Autocomplete)

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

axios.get(`/${process.env.NODE_ENV === 'production' ? 'gitstars/' : ''}assets/config.json`)
  .then(({ access, token, username, filename }) => {
    const App = () => import('./App')
    window._gitstars = {
      username,
      filename,
      accessToken: `${access}${token}`
    }

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      template: '<App/>',
      components: { App }
    })
  })
