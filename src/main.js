// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { Tag, Input, Button, Popover, Autocomplete, Notification } from 'element-ui'

import { getConfig, getUserInfo } from './api'

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

const GITSTARS = 'gitstars'

/* eslint-disable no-new */
new Promise(async (resolve, reject) => {
  const gitstars = window.localStorage.getItem(GITSTARS)
  if (gitstars) {
    window._gitstars = JSON.parse(gitstars)
    return resolve(window._gitstars)
  }

  const { access, token, filename, description } = await getConfig()
  const accessToken = `${access}${token}`
  window._gitstars = { filename, description, accessToken }
  window._gitstars.user = await getUserInfo() // 用户信息依赖 accessToken

  resolve(window._gitstars)
}).then(gitstars => {
  window.localStorage.setItem(GITSTARS, JSON.stringify(gitstars))

  const App = () => import('./App')
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
  })
})
