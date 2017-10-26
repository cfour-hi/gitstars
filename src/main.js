// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'

import { parseURLSearch } from './util'

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  require('normalize.css')
}

const clientId = '75cf00b02deb33e63424'
const clientSecret = '6fa564cbd46f6bdfa1fb81ddce5503dcbe4ab4c4'
const _accessToken = window.localStorage.getItem('access_token')

if (!_accessToken) {
  const _code = window.localStorage.getItem('code')
  if (!_code) {
    const href = 'https://github.com/login/oauth/authorize'

    let _authState = window.localStorage.getItem('auth_state')
    if (!_authState) {
      _authState = Date.now()
      window.localStorage.setItem('auth_state', _authState)
      window.location.href = `${href}?client_id=${clientId}&state=${_authState}`
    }

    const { code } = parseURLSearch()
    if (code) {
      window.localStorage.setItem('code', code)

      axios.get(`https://github.com/login/oauth/access_token`, {
        code,
        client_id: clientId,
        client_secret: clientSecret
      }).then(response => {
        console.log(response)
      })

      // axios.post('https://github.com/login/oauth/access_token', {
      // code,
      // client_id: clientId,
      // client_secret: clientSecret
      // }).then(({ access_token }) => {
      //   console.log(access_token)
      //   window.localStorage.setItem('access_token', access_token)
      // })
    } else {
      console.warn('没有 code')
    }
  } else {
    window.localStorage.setItem('code', _code)

    axios.post(`https://github.com/login/oauth/access_token?code=${_code}&client_id=${clientId}&client_secret=${clientSecret}`)
      .then(response => {
        console.log(response)
      })

    // axios.post('https://github.com/login/oauth/access_token', {
    //   code: _code,
    //   client_id: clientId,
    //   client_secret: clientSecret
    // }).then(({ access_token }) => {
    //   console.log(access_token)
    //   window.localStorage.setItem('access_token', access_token)
    //   window.accessToken = access_token // eslint-disable-line
    // })
  }
} else {
  window.accessToken = _accessToken
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
