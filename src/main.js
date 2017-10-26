// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import { parseURLSearch } from './util'

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  require('normalize.css')
}

let authState = window.localStorage.getItem('auth_state')
if (!authState) {
  authState = Date.now()
  window.localStorage.setItem('auth_state', authState)
  window.location.href = 'https://github.com/login/oauth/authorize?client_id=75cf00b02deb33e63424&state=' + authState
} else {
  const { state } = parseURLSearch()
  console.log(`authState" ${authState}`)
  console.log(`state" ${state}`)

  if (authState === state) {
    console.log('已授权并且 state 相等')
  } else {
    console.log('已授权但 state 不相等')
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
