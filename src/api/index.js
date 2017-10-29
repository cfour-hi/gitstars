import axios from 'axios'

const GITHUB_API = 'https://api.github.com'

export function getUserInfo () {
  return axios.get(`${GITHUB_API}/users/${window.username}?access_token=${window.access_token}`)
}

export function getStarredRepos (page) {
  return axios.get(`${GITHUB_API}/users/${window.username}/starred?access_token=${window.access_token}&page=${page}&per_page=100`)
}

export function getRepoReadme ({ login, name }) {
  return axios.get(`${GITHUB_API}/repos/${login}/${name}/readme?access_token=${window.access_token}`)
}

export function getRenderedReadme (data) {
  return axios({
    data,
    url: `/markdown/raw?access_token=${window.access_token}`,
    method: 'post',
    baseURL: GITHUB_API,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
