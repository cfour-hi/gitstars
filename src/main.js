// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { Tag, Input, Button, Popover, Autocomplete, Notification } from 'element-ui'

import { parseURLSearch } from './util'
import { getGitstarsAccessToken } from './api'
import config from './config'

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

const GITSTARS_ACCESS_TOKEN = 'gitstars_access_token'
const GITSTARS_CODE = 'gitstars_code'
const { clientId, clientSecret } = config

/* eslint-disable no-new */
new Promise((resolve, reject) => {
  const gitstarsAccessToken = window.localStorage.getItem(GITSTARS_ACCESS_TOKEN)
  if (gitstarsAccessToken) return resolve(gitstarsAccessToken)

  let gitstarsCode = window.localStorage.getItem(GITSTARS_CODE)
  const { code } = parseURLSearch()
  if (!gitstarsCode) gitstarsCode = code

  if (gitstarsCode) {
    window.localStorage.setItem(GITSTARS_CODE, gitstarsCode)
    const { origin, pathname } = window.location
    if (code) window.history.replaceState({}, null, `${origin}${pathname}`)

    getGitstarsAccessToken({
      code: gitstarsCode,
      client_id: clientId,
      client_secret: clientSecret
    }).then(({ access_token }) => {
      window.localStorage.setItem(GITSTARS_ACCESS_TOKEN, access_token)
      resolve(access_token)
    })
  } else {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=gist`
  }
}).then(accessToken => {
  window.gitstarsAccessToken = accessToken

  const App = () => import('./App')
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
  })
})
