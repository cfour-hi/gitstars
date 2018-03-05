import axios from 'axios'
import { Notification } from 'element-ui'
import i18n from '@/i18n'
import appConfig from '@/config'
import { getStarredRepos, getGitstarsGist, getUserGists, createGitstarsGist } from '@/api'

export const loadReposAndLanguageTags = async (page = 1) => {
  const repos = []
  let reposByPage = []

  do {
    reposByPage = await getStarredRepos(page++)
    reposByPage.forEach((repo, index) => {
      repo._customTags = []
      repo[appConfig.repoSorts.time.sortKey] = reposByPage.length - index
    })
    repos.push(...reposByPage)
  } while (reposByPage.length === appConfig.starredReposPerPage)

  let dateNow = Date.now()
  const languageTags = []

  repos.forEach(({ id: repoId, language }) => {
    appConfig.defaultTags.all.repos.push(repoId)

    if (!language) return

    const languageTag = languageTags.find(tag => tag.name === language)
    if (languageTag) {
      languageTag.repos.push(repoId)
    } else {
      languageTags.push({
        id: dateNow,
        categoryId: appConfig.tagCategorys.language.id,
        name: language,
        repos: [repoId],
      })
      dateNow += 1
    }
  })

  return { repos, languageTags }
}

export const loadGitstarsData = async () => {
  let gitstarsGistId = window.localStorage.getItem(appConfig.localStorageKeys.gistId)
  let content = null

  if (gitstarsGistId) {
    content = window.localStorage.getItem(gitstarsGistId)
    if (!content) {
      const { files } = await getGitstarsGist(gitstarsGistId)
      content = files[appConfig.filename].content
      window.localStorage.setItem(gitstarsGistId, content)
    }
    content = JSON.parse(content)
  } else {
    const gists = await getUserGists()
    for (const { id, description, files } of gists) {
      if (description === appConfig.description) {
        gitstarsGistId = id
        content = await axios.get(files[appConfig.filename].raw_url)
        break
      }
    }

    if (!gitstarsGistId) {
      content = { lastModified: Date.now(), tags: [] }
      const { id } = await createGitstarsGist(content)
      gitstarsGistId = id
    }

    window.localStorage.setItem(appConfig.localStorageKeys.gistId, gitstarsGistId)
  }

  window._gitstars.gistId = gitstarsGistId
  return content
}

export const validateTagName = async (tags, name) => {
  if (!name) throw new Error(i18n.t('tagNameCannotEmpty'))
  if (tags.find(tag => tag.name === name)) throw new Error(i18n.t('tagNameAlreadyExist'))
  return name
}

export const notifyInfo = (message) => Notification.info(Object.assign({ message }, appConfig.notify))
export const notifyWarn = (message) => Notification.info(Object.assign({ message }, appConfig.notify))
