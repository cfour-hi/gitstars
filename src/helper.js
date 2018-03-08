import axios from 'axios'
import { Notification } from 'element-ui'
import i18n from '@/i18n'
import appConfig from '@/config'
import { getStarredRepos, getGitstarsGist, getUserGists, createGitstarsGist } from '@/api'

export const loadReposAndLanguageTags = async (page = 1) => {
  const repos = []
  let reposByPage = []
  let sortNum = 999999999

  do {
    reposByPage = await getStarredRepos(page++)
    reposByPage.forEach((repo, index) => {
      repo._customTags = []
      repo[appConfig.repoSorts.time.sortKey] = sortNum--
    })
    repos.push(...reposByPage)
  } while (reposByPage.length === appConfig.starredReposPerPage)

  let dateNow = Date.now()
  const languageTags = []

  repos.forEach(({ id: repoId, language }) => {
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
  let isUseStorageContent = false

  if (gitstarsGistId) {
    const { files } = await getGitstarsGist(gitstarsGistId)
    content = JSON.parse(files[appConfig.filename].content)

    let contentFromStorage = window.localStorage.getItem(gitstarsGistId)
    if (contentFromStorage) {
      contentFromStorage = JSON.parse(contentFromStorage)
      /**
       * 客户端之间 localStorage 内保存的数据不共享
       * 需要对比远程数据（使用 lastModified 值）确定最新数据
       *
       * 为什么不能直接使用远程数据？
       *
       * 因为 github api 有 60s 缓存
       * 如果用户更新数据后不久再执行刷新操作
       * 远程数据不一定返回上次更新的最新数据
       *
       * 还有一种情况是无法避免的
       * 用户使用 chrome 和 firefox 同时打开 gitstars
       * 用户在 chrome 客户端更新数据
       * 然后在 60s 之内使用 firefox 客户端刷新页面
       * firefox 客户端获取的远程 gist 数据不一定是 chrome 客户端更新后的最新数据
       */
      if (contentFromStorage.lastModified > content.lastModified) {
        content = contentFromStorage
        isUseStorageContent = true
      }
    }
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

  if (!isUseStorageContent) window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))

  window._gitstars.gistId = gitstarsGistId
  return content
}

export const formatReposTag = (repos, tags) => {
  repos.forEach(repo => {
    if (repo._customTags.length) repo._customTags = []
  })

  tags.forEach(tag => {
    tag.repos.forEach((repoId, index, tagRepos) => {
      const repo = repos.find(({ id }) => id === repoId)
      repo ? repo._customTags.push(tag) : tagRepos[index] = undefined
    })
    tag.repos = tag.repos.filter(repo => repo)
  })
}

export const validateTagName = async (tags, name) => {
  if (!name) throw new Error(i18n.t('tagNameCannotEmpty'))
  if (tags.find(tag => tag.name === name)) throw new Error(i18n.t('tagNameAlreadyExist'))
  return name
}

export const notifySuccess = (notify) => Notification.success(Object.assign({}, notify, appConfig.notify))
export const notifyInfo = (notify) => Notification.info(Object.assign({}, notify, appConfig.notify))
export const notifyWarn = (notify) => Notification.warning(Object.assign({}, notify, appConfig.notify))
export const notifyError = (notify) => Notification.error(Object.assign({}, notify, appConfig.notify))
