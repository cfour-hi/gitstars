import Vue from 'vue'
import Vuex from 'vuex'
import { Notification } from 'element-ui'
import i18n from './i18n'
import config from './config'
import { saveGitstarsGist } from './api'

if (process.env.NODE_ENV === 'development') {
  Vue.use(Vuex)
}

const { defaultTags, norifyPosition } = config
const processPrompt = () => Notification.info({ message: '有未完成任务，请稍后。', showClose: false, position: norifyPosition })

export default new Vuex.Store({
  state: {
    customTags: [],
    activeTag: defaultTags.all,
    starredRepos: [],
    activeRepo: {},
    isUpdatingGist: false
  },
  getters: {
    activeRepos: state => {
      const { starredRepos, activeTag } = state
      const { id: activeTagId } = activeTag

      if (activeTagId === defaultTags.all.id) return starredRepos
      if (activeTagId === defaultTags.untagged.id) return starredRepos.filter(repo => !repo._customTags.length)

      return starredRepos.filter(repo => repo._customTags.includes(activeTag))
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
    deleteRepoTag (state, { repo, tagIndex }) {
      repo._customTags.splice(tagIndex, 1)
    },
    deleteCustomTagRepo (state, { tag, repoIndex }) {
      tag.repos.splice(repoIndex, 1)
    }
  },
  actions: {
    deleteRepoTag ({ state, commit, dispatch }, { repoId, tagId, notify }) {
      if (state.isUpdatingGist) return processPrompt()

      const repo = state.starredRepos.find(repo => repo.id === repoId)
      const tagIndex = repo._customTags.findIndex(tag => tag.id === tagId)
      const tag = state.customTags.find(tag => tag.id === tagId)
      const repoIndex = tag.repos.findIndex(id => id === repoId)

      commit('deleteRepoTag', { repo, tagIndex })
      commit('deleteCustomTagRepo', { tag, repoIndex })

      dispatch('updateGitstarsTag', notify)
        .catch(() => {
          repo._customTags.splice(tagIndex, 0, tag)
          tag.repos.splice(repoIndex, 0, repo.id)
        })
    },
    updateGitstarsTag ({ state, commit }, notify) {
      commit('toggleUpdating')

      const loadingNotify = Notification.info({
        iconClass: 'fa fa-cog fa-spin fa-fw',
        message: i18n.t('update.wait'),
        duration: 0,
        showClose: false,
        position: norifyPosition
      })
      const gist = { lastModified: Date.now(), tags: state.customTags }

      return saveGitstarsGist(gist)
        .then(() => {
          Notification.success(Object.assign({}, notify, {
            showClose: false,
            position: norifyPosition
          }))
          window.localStorage.setItem(window._gitstars.gistId, JSON.stringify(gist))
        })
        .finally(() => {
          commit('toggleUpdating')
          loadingNotify.close()
        })
    }
  }
})
