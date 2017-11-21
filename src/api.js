import axios from 'axios'
import { Notification } from 'element-ui'
import config from './config'

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

const { filename, description, starredReposPerPage } = config

export const getGitstarsAccessToken = function getGitstarsAccessToken (params) {
  return axios.post('https://gh-oauth.imsun.net', params)
  // return axios.post('https://github.com/login/oauth/access_token', { params })
}

// https://developer.github.com/v3/users/#get-the-authenticated-user
export const getUserInfo = function getUserInfo () {
  return axios.get(`/user`)
}

// https://developer.github.com/v3/gists/#create-a-gist
export const createGitstarsGist = function createGitstarsGist (content) {
  return axios.post('/gists', {
    description,
    public: true,
    files: {
      [filename]: {
        content: JSON.stringify(content)
      }
    }
  })
}

// https://developer.github.com/v3/gists/#get-a-single-gist
export const getGitstarsGist = function getGitstarsGist (id) {
  return axios.get(`/gists/${id}`)
}

// https://developer.github.com/v3/gists/#list-a-users-gists
export const getUserGists = function getUserGists () {
  return axios.get(`/users/${window._gitstars.user.login}/gists`)
}

// https://developer.github.com/v3/activity/starring/#list-repositories-being-starred
export const getStarredRepos = function getStarredRepos (page) {
  const params = { page, per_page: starredReposPerPage }
  return axios.get(`/users/${window._gitstars.user.login}/starred`, { params })
}

// https://developer.github.com/v3/repos/contents/#get-the-readme
export const getRepoReadme = function getRepoReadme (login, name) {
  return axios.get(`/repos/${login}/${name}/readme`)
}

// https://developer.github.com/v3/markdown/#render-a-markdown-document-in-raw-mode
export const getRenderedReadme = function getRenderedReadme (data) {
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
export const saveGitstarsGist = function saveGitstarsGist (id, content) {
  return axios.patch(`/gists/${id}`, {
    files: {
      [filename]: {
        content: JSON.stringify(content)
      }
    }
  })
}
