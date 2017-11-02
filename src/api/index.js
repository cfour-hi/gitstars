import axios from 'axios'

const GITHUB_API = 'https://api.github.com'
const { username, accessToken, filename } = window._gitstars

export function getUserInfo () {
  return axios.get(`${GITHUB_API}/users/${username}?access_token=${accessToken}`)
}

export function getUserGists () {
  return axios.get(`${GITHUB_API}/users/${username}/gists?access_token=${accessToken}`)
}

export function getStarredRepos (page) {
  return axios.get(`${GITHUB_API}/users/${username}/starred?access_token=${accessToken}&page=${page}&per_page=100`)
}

export function getRepoReadme (login, name) {
  return axios.get(`${GITHUB_API}/repos/${login}/${name}/readme?access_token=${accessToken}`)
}

export function getRenderedReadme (data) {
  return axios({
    data,
    url: `/markdown/raw?access_token=${accessToken}`,
    method: 'post',
    baseURL: GITHUB_API,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// https://developer.github.com/v3/gists/
export function saveLabelGist (id, labels) {
  return axios.patch(`${GITHUB_API}/gists/${id}?access_token=${accessToken}`, {
    files: {
      [filename]: {
        content: JSON.stringify(labels)
      }
    }
  })
}
