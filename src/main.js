// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { Tag, Input, Button, Popover, Autocomplete, Notification } from 'element-ui'
import App from './App'
import { parseURLSearch } from './util'
import { getGitstarsAccessToken, getUserInfo } from './api'
import config from './config'

Vue.use(Tag)
Vue.use(Input)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Autocomplete)
Vue.prototype.$notify = Notification

Vue.config.productionTip = false

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

  const storageCode = window.localStorage.getItem(GITSTARS_CODE)
  const { code } = parseURLSearch()
  const gitstarsCode = storageCode || code

  if (gitstarsCode) {
    if (!storageCode) window.localStorage.setItem(GITSTARS_CODE, gitstarsCode)

    if (code) {
      let href = window.location.href.replace(/code=[^&]+/, '')
      if (href[href.length - 1] === '?') href = href.slice(0, -1)
      window.history.replaceState({}, null, `${href}`)
    }

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
  window._gitstars = { accessToken: accessToken }
  const gitstarsUser = window.localStorage.getItem(GITSTARS_USER)

  /**
   * 需要注意！
   * getUserInfo 接口依赖 window._gitstars.accessToken
   * 所以以下代码执行之前就需要给赋值 window._gitstars
   */
  window._gitstars.user = gitstarsUser ? JSON.parse(gitstarsUser) : await getUserInfo()
  if (!gitstarsUser) window.localStorage.setItem(GITSTARS_USER, JSON.stringify(window._gitstars.user))

  new Vue({ el: '#app', template: '<App/>', components: { App } })
})
