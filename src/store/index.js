import Vue from 'vue'
import Vuex from 'vuex'
import { Notification } from 'element-ui'
import tag from './tag'
import repo from './repo'
import i18n from '@/i18n'
import appConfig from '@/config'
import { saveGitstarsGist } from '@/api'
import { loadReposAndLanguageTags, loadGitstarsData, formatReposTag, notifySuccess, notifyWarn, notifyError } from '@/helper'

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
    initGitstars ({ commit }) {
      return Promise.all([loadReposAndLanguageTags(), loadGitstarsData()])
        .then(([{ repos, languageTags }, content]) => {
          const { tags } = content
          formatReposTag(repos, tags)

          commit('repo/initRepos', repos)
          commit('tag/initTags', tags)
          commit('toggleIsLoadedData')

          return { languageTags }
        })
        .catch(() => notifyWarn({ title: i18n.t('failedGetData'), message: i18n.t('tips.refreshPage') }))
    },
    updateGitstarsData ({ state, commit }, notify) {
      commit('toggleIsUpdatingData')

      const loadingNotify = Notification.info(Object.assign({}, appConfig.notify, {
        iconClass: 'fa fa-cog fa-spin fa-fw',
        message: i18n.t('update.wait'),
        duration: 0,
      }))

      const gist = { lastModified: Date.now(), tags: state.tag.tags }

      return saveGitstarsGist(gist)
        .then(() => {
          notifySuccess(notify || { message: i18n.t('update.completed') })
          window.localStorage.setItem(window._gitstars.gistId, JSON.stringify(gist))
        })
        .catch(() => {
          const message = i18n.t('update.failed')
          notifyError(notify || { message })
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
