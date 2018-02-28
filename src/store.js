import Vue from 'vue'
import Vuex from 'vuex'
import { Notification } from 'element-ui'
import i18n from './i18n'
import appConfig from './config'
import { saveGitstarsGist } from './api'

if (process.env.NODE_ENV === 'development') Vue.use(Vuex)

const processPrompt = () => Notification.info(Object.assign({ message: i18n.t('update.uncompleted') }, appConfig.notify))

const validateTagName = async (tags, name) => {
  if (!name) throw new Error(i18n.t('tagNameCannotEmpty'))
  if (tags.find(tag => tag.name === name)) throw new Error(i18n.t('tagNameAlreadyExist'))
  return name
}

export default new Vuex.Store({
  state: {
    customTags: [],
    activeTag: appConfig.defaultTags.all,
    starredRepos: [],
    activeRepo: {},
    isUpdatingGist: false
  },
  getters: {
    activeTagRepos: state => {
      const { starredRepos, activeTag } = state
      const { id: activeTagId } = activeTag
      const { defaultTags } = appConfig

      if (activeTagId === defaultTags.all.id) return starredRepos
      if (activeTagId === defaultTags.untagged.id) return starredRepos.filter(repo => !repo._customTags.length)

      if (activeTag.categoryId === appConfig.tagCategorys.language.id) {
        return starredRepos.filter(repo => repo.language === activeTag.name)
      }

      return starredRepos.filter(repo => repo._customTags.find(tag => tag.id === activeTag.id))
    }
  },
  mutations: {
    toggleUpdating (state) {
      state.isUpdatingGist = !state.isUpdatingGist
    },
    initStarredRepos (state, repos) {
      state.starredRepos = repos
    },
    initCustomTags (state, tags) {
      state.customTags = tags
    },
    changeActiveTag (state, tag) {
      state.activeTag = tag
    },
    changeActiveRepo (state, repo) {
      state.activeRepo = repo
    },
    changeCustomTagName (state, { tagId, name }) {
      const tag = state.customTags.find(tag => tag.id === tagId)
      tag.name = name
    },
    addCustomTag (state, tag) {
      state.customTags.push(tag)
    },
    popCustomTag (state) {
      state.customTags.pop()
    },
    addRepoCustomTag (state, tag) {
      state.activeRepo._customTags.push(tag)
    },
    insertRepoCustomTag (state, { repo, tag, tagIndex }) {
      repo._customTags.splice(tagIndex, 0, tag)
    },
    popRepoCustomTag (state) {
      state.activeRepo._customTags.pop()
    },
    deleteRepoCustomTag (state, { repo, tagIndex }) {
      repo._customTags.splice(tagIndex, 1)
    },
    addCustomTagRepo (state, { tag, id }) {
      tag.repos.push(id)
    },
    insertCustomTagRepo (state, { tag, repoIndex, id }) {
      tag.repos.splice(repoIndex, 0, id)
    },
    popCustomTagRepo (state, tag) {
      tag.repos.pop()
    },
    deleteCustomTagRepo (state, { tag, repoIndex }) {
      tag.repos.splice(repoIndex, 1)
    }
  },
  actions: {
    addCustomTag ({ state, commit, dispatch }, tagName) {
      validateTagName(state.customTags, tagName)
        .then(name => {
          const tag = { id: Date.now(), name, repos: [] }
          commit('addCustomTag', tag)

          dispatch('updateGitstarsTag', { message: `${i18n.t('addTag')}: ${name}` })
            .catch(() => commit('popCustomTag'))
        })
        .catch(({ message }) => Notification.warning(Object.assign({ message }, appConfig.notify)))
    },
    changeCustomTagName ({ state, commit }, { tagId, name }) {
      return validateTagName(state.customTags, name)
        .then(name => {
          commit('changeCustomTagName', { tagId, name })
        })
    },
    addRepoCustomTag ({ state, commit, dispatch }, tagName) {
      if (state.isUpdatingGist) return processPrompt()

      const { activeRepo } = state
      validateTagName(activeRepo._customTags, tagName)
        .then(name => {
          const tag = state.customTags.find(tag => tag.name === name)
          const newTag = { id: Date.now(), name, repos: [activeRepo.id] }

          commit('addRepoCustomTag', tag || newTag)
          tag ? commit('addCustomTagRepo', { tag, id: activeRepo.id }) : commit('addCustomTag', newTag)

          dispatch('updateGitstarsTag', {
            title: `${activeRepo.owner.login} / ${activeRepo.name}`,
            message: `${i18n.t('addTag')}: ${name}`
          }).catch(() => {
            commit('popRepoCustomTag')
            tag ? commit('popCustomTagRepo', tag) : commit('popCustomTag')
          })
        })
        .catch(({ message }) => Notification.warning(Object.assign({ message }, appConfig.notify)))
    },
    deleteRepoCustomTag ({ state, commit, dispatch }, { repoId, tagId }) {
      if (state.isUpdatingGist) return processPrompt()

      const repo = state.starredRepos.find(repo => repo.id === repoId)
      const tagIndex = repo._customTags.findIndex(tag => tag.id === tagId)
      const tag = state.customTags.find(tag => tag.id === tagId)
      const repoIndex = tag.repos.findIndex(id => id === repoId)

      commit('deleteRepoCustomTag', { repo, tagIndex })
      commit('deleteCustomTagRepo', { tag, repoIndex })

      dispatch('updateGitstarsTag', {
        title: `${repo.owner.login} / ${repo.name}`,
        message: `${i18n.t('deleteTag')}: ${tag.name}`
      }).catch(() => {
        commit('insertRepoCustomTag', { repo, tag, tagIndex })
        commit('insertCustomTagRepo', { tag, repoIndex, id: repo.id })
      })
    },
    updateGitstarsTag ({ state, commit }, notify) {
      commit('toggleUpdating')
      const _notify = Object.assign({}, notify || {}, appConfig.notify)

      const loadingNotify = Notification.info(Object.assign({}, appConfig.notify, {
        iconClass: 'fa fa-cog fa-spin fa-fw',
        message: i18n.t('update.wait'),
        duration: 0
      }))
      const gist = { lastModified: Date.now(), tags: state.customTags }

      return saveGitstarsGist(gist)
        .then(() => {
          Notification.success(notify ? _notify : Object.assign({ message: i18n.t('update.completed') }, appConfig.notify))
          window.localStorage.setItem(window._gitstars.gistId, JSON.stringify(gist))
        })
        .catch(() => {
          Notification.error(notify ? _notify : Object.assign({ message: i18n.t('update.failed') }, appConfig.notify))
        })
        .finally(() => {
          commit('toggleUpdating')
          loadingNotify.close()
        })
    }
  }
})
