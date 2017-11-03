import axios from 'axios'
import { Notification } from 'element-ui'

const { username, accessToken, filename } = window._gitstars

axios.defaults.baseURL = 'https://api.github.com'

axios.interceptors.request.use(config => {
  if (config.url.includes('http')) return config

  config.url += config.url.includes('?') ? '&' : '?'
  config.url += `access_token=${accessToken}`
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

export function getUserInfo () {
  return axios.get(`/users/${username}`)
}

export function getUserGists () {
  return axios.get(`/users/${username}/gists`)
}

export function getStarredRepos (page) {
  return axios.get(`/users/${username}/starred?&page=${page}&per_page=100`)
}

export function getRepoReadme (login, name) {
  return axios.get(`/repos/${login}/${name}/readme`)
}

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
export function saveLabelGist (id, labels) {
  return axios.patch(`/gists/${id}`, {
    files: {
      [filename]: {
        content: JSON.stringify(labels)
      }
    }
  })
}
