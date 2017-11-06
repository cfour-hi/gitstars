// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { Tag, Input, Button, Popover, Autocomplete, Notification } from 'element-ui'

import { parseURLSearch } from './util'
import { getGitstarsAccessToken, getUserInfo } from './api'
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
const GITSTARS_USER = 'gitstars_user'
const { clientId, clientSecret } = config

/* eslint-disable no-new */
new Promise(async (resolve, reject) => {
  const accessToken = window.localStorage.getItem(GITSTARS_ACCESS_TOKEN)
  if (accessToken) return resolve(accessToken)

  let gitstarsCode = window.localStorage.getItem(GITSTARS_CODE)
  const { code } = parseURLSearch()
  if (!gitstarsCode) gitstarsCode = code

  if (gitstarsCode) {
    window.localStorage.setItem(GITSTARS_CODE, gitstarsCode)

    let href = window.location.href.replace(/code=[^&]+/, '')
    if (href[href.length - 1] === '?') href = href.slice(0, -1)
    if (code) window.history.replaceState({}, null, `${href}`)

    const { access_token } = await getGitstarsAccessToken({
      code: gitstarsCode,
      client_id: clientId,
      client_secret: clientSecret
    })
    window.localStorage.setItem(GITSTARS_ACCESS_TOKEN, access_token)
    resolve(access_token)
  } else {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=gist`
  }
}).then(async accessToken => {
  window._gitstarsAccessToken = accessToken

  const gitstarsUser = window.localStorage.getItem(GITSTARS_USER)
  window._gitstarsUser = gitstarsUser ? JSON.parse(gitstarsUser) : await getUserInfo()
  if (!gitstarsUser) window.localStorage.setItem(GITSTARS_USER, JSON.stringify(window._gitstarsUser))

  const App = () => import('./App')
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
  })
})
