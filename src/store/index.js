import Vue from 'vue'
import Vuex from 'vuex'
import { Notification } from 'element-ui'
import tag from './tag'
import repo from './repo'
import i18n from '@/i18n'
import appConfig from '@/config'
import { saveGitstarsGist } from '@/api'
import { loadReposAndLanguageTags, loadGitstarsData } from '@/helper'

if (process.env.NODE_ENV !== 'production') Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    gistId: '',
    isEditingTags: false,
    isUpdatingData: false,
    isLoadedData: false,
  },
  mutations: {
    initGistId (state, gistId) {
      state.gistId = gistId
    },
    toggleIsEditingTags (state, bool = !state.isEditingTags) {
      state.isEditingTags = bool
    },
    toggleIsUpdatingData (state, bool = !state.isUpdatingData) {
      state.isUpdatingData = bool
    },
    toggleIsLoadedData (state, bool = !state.isLoadedData) {
      state.isLoadedData = bool
    },
  },
  actions: {
    initGitstars ({ commit, dispatch }) {
      return Promise.all([loadReposAndLanguageTags(), loadGitstarsData()])
        .then(([{ repos, languageTags }, content]) => {
          let isTagReposIncludeInvalidId = false
          const { tags: customTags } = content

          customTags.forEach(tag => {
            tag.repos.forEach((repoId, index, tagRepos) => {
              const repo = repos.find(({ id }) => id === repoId)
              if (repo) {
                repo._customTags.push(tag)
              } else {
                isTagReposIncludeInvalidId = true
                tagRepos[index] = undefined
              }
            })
            tag.repos = tag.repos.filter(repo => repo)
          })

          commit('toggleIsLoadedData')
          commit('repo/initRepos', repos)
          commit('tag/initTags', customTags)

          appConfig.defaultTags.untagged.repos = repos.filter(repo => !repo._customTags.length).map(repo => repo.id)
          const defaultTags = Object.values(appConfig.defaultTags)

          if (isTagReposIncludeInvalidId) dispatch('updateGitstarsData')

          return { defaultTags, languageTags }
        })
    },
    updateGitstarsData ({ state, commit }, notify) {
      commit('toggleIsUpdatingData')

      const _notify = Object.assign({}, notify || {}, appConfig.notify)
      const loadingNotify = Notification.info(Object.assign({}, appConfig.notify, {
        iconClass: 'fa fa-cog fa-spin fa-fw',
        message: i18n.t('update.wait'),
        duration: 0,
      }))

      const gist = { lastModified: Date.now(), tags: state.tag.tags }

      return saveGitstarsGist(gist)
        .then(() => {
          Notification.success(notify ? _notify : Object.assign({ message: i18n.t('update.completed') }, appConfig.notify))
          window.localStorage.setItem(window._gitstars.gistId, JSON.stringify(gist))
        })
        .catch(() => {
          const message = i18n.t('update.failed')
          Notification.error(notify ? _notify : Object.assign({ message }, appConfig.notify))
          throw new Error(message)
        })
        .finally(() => {
          commit('toggleIsUpdatingData')
          loadingNotify.close()
        })
    },
  },
  modules: { tag, repo },
})
