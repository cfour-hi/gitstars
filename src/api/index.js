import axios from 'axios'
import { Notification } from 'element-ui'

axios.defaults.baseURL = 'https://api.github.com'

axios.interceptors.request.use(config => {
  if (config.url.includes('http')) return config

  config.url += config.url.includes('?') ? '&' : '?'
  config.url += `access_token=${window._gitstars.accessToken}`
  return config
}, err => {
  return Promise.reject(err)
})

axios.interceptors.response.use(({ data }) => {
  return data
}, err => {
  let message = err.message
  const { response = {} } = err
  const { status, statusText, data } = response

  if (data) message = data.message
  Notification.error({ message, title: `${status} ${statusText}`, showClose: false })
  return Promise.reject(err)
})

export function getConfig () {
  const { protocol, host } = window.location
  const pathname = process.env.NODE_ENV === 'production' ? '/gitstars/' : '/'
  return axios.get(`${protocol}//${host}${pathname}assets/config.json`)
}

// https://developer.github.com/v3/users/#get-the-authenticated-user
export function getUserInfo () {
  return axios.get(`/user`)
}

// https://developer.github.com/v3/gists/#create-a-gist
export function createGitstarsGist () {
  return axios.post('/gists', {
    description: window._gitstars.description,
    public: true,
    files: {
      [window._gitstars.filename]: {
        content: JSON.stringify([])
      }
    }
  })
}

// https://developer.github.com/v3/gists/#get-a-single-gist
export function getGitstarsGist (id) {
  return axios.get(`/gists/${id}`)
}

// https://developer.github.com/v3/gists/#list-a-users-gists
export function getUserGists () {
  return axios.get(`/users/${window._gitstars.user.login}/gists`)
}

// https://developer.github.com/v3/activity/starring/#list-repositories-being-starred
export function getStarredRepos (page) {
  return axios.get(`/users/${window._gitstars.user.login}/starred?&page=${page}&per_page=100`)
}

// https://developer.github.com/v3/repos/contents/#get-the-readme
export function getRepoReadme (login, name) {
  return axios.get(`/repos/${login}/${name}/readme`)
}

// https://developer.github.com/v3/markdown/#render-a-markdown-document-in-raw-mode
export function getRenderedReadme (data) {
  return axios({
    data,
    url: `/markdown/raw`,
    method: 'post',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// https://developer.github.com/v3/gists/
export function saveGitstarsGist (id, labels) {
  return axios.patch(`/gists/${id}`, {
    files: {
      [window._gitstars.filename]: {
        content: JSON.stringify(labels)
      }
    }
  })
}