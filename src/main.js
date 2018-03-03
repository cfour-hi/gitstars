// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import './polyfill'
import Vue from 'vue'
import store from './store'
import App from './App'
import i18n from './i18n'
import { parseURLSearch } from './util'
import { getGitstarsAccessToken, getUserInfo } from './api'
import config from './config'
import './element-ui'

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

async function accessTokenProcess () {
  const accessToken = window.localStorage.getItem(GITSTARS_ACCESS_TOKEN)

  if (accessToken) return accessToken

  const storageCode = window.localStorage.getItem(GITSTARS_CODE)
  const { code } = parseURLSearch()
  const gitstarsCode = storageCode || code

  if (gitstarsCode) {
    if (code) {
      let href = window.location.href.replace(/code=[^&]+/, '')
      if (href[href.length - 1] === '?') href = href.slice(0, -1)
      window.history.replaceState({}, null, href)
    } else {
      window.localStorage.setItem(GITSTARS_CODE, gitstarsCode)
    }

    const { access_token } = await getGitstarsAccessToken({
      code: gitstarsCode,
      client_id: clientId,
      client_secret: clientSecret,
    })

    window.localStorage.setItem(GITSTARS_ACCESS_TOKEN, access_token)

    /* eslint-disable camelcase */
    return access_token
  } else {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=gist`
  }
}

accessTokenProcess()
  .then(accessToken => {
    const gitstarsUser = window.localStorage.getItem(GITSTARS_USER)

    /**
     * 使用 axios 调用接口时做了请求拦截（api.js）
     * 请求拦截需要使用到 window._gitstars.accessToken
     */
    window._gitstars = { accessToken }
    window._gitstars.user = gitstarsUser ? JSON.parse(gitstarsUser) : getUserInfo()

    if (!gitstarsUser) {
      window.localStorage.setItem(GITSTARS_USER, JSON.stringify(window._gitstars.user))
    }
  })
  .then(() => {
    /* eslint-disable no-new */
    new Vue({ store, i18n, el: '#app', template: '<App/>', components: { App } })
  })
