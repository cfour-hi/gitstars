import axios from 'axios'

const GITHUB_API = 'https://api.github.com'

export function getStarredRepos () {
  return axios.get(`${GITHUB_API}/users/monine/starred?access_token=${window.access_token}`)
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
