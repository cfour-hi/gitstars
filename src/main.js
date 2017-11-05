// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import { Tag, Input, Button, Popover, Autocomplete, Notification } from 'element-ui'

Vue.config.productionTip = false
Vue.use(Tag)
Vue.use(Input)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Autocomplete)
Vue.prototype.$notify = Notification

if (process.env.NODE_ENV === 'development') {
  require('normalize.css')
  require('font-awesome/css/font-awesome.css')
  require('github-markdown-css')
}

const { protocol, host } = window.location
const pathname = process.env.NODE_ENV === 'production' ? '/gitstars/' : '/'

axios.get(`${protocol}//${host}${pathname}assets/config.json`).then(({ data }) => {
  const { access, token, username, filename, description } = data
  window._gitstars = {
    username,
    filename,
    description,
    accessToken: `${access}${token}`
  }

  const App = () => import('./App')

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
  })
})
