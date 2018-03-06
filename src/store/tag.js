import i18n from '@/i18n'
import appConfig from '@/config'
import { validateTagName, notifyInfo, notifyWarn } from '@/helper'

export default {
  namespaced: true,
  state: {
    tags: [],
    active: appConfig.defaultTags.all,
  },
  mutations: {
    initTags (state, tags) {
      state.tags = tags
    },
    switchActive (state, tag) {
      state.active = tag
    },
    changeTagName (state, { tagId, name }) {
      const tag = state.tags.find(tag => tag.id === tagId)
      tag.name = name
    },
    addTag (state, tag) {
      state.tags.push(tag)
    },
    popTag (state) {
      state.tags.pop()
    },
    deleteTag (state, tagId) {
      const { tags } = state
      const index = tags.findIndex(tag => tag.id === tagId)
      tags.splice(index, 1)
    },
    addTagRepo (state, { tagId, repoId }) {
      const tag = state.tags.find(tag => tag.id === tagId)
      tag.repos.push(repoId)
    },
    insertTagRepo (state, { tagId, repoIndex, repoId }) {
      const tag = state.tags.find(tag => tag.id === tagId)
      tag.repos.splice(repoIndex, 0, repoId)
    },
    popTagRepo (state, tagId) {
      const tag = state.tags.find(tag => tag.id === tagId)
      tag.repos.pop()
    },
    deleteTagRepo (state, { tagId, repoIndex }) {
      const tag = state.tags.find(tag => tag.id === tagId)
      tag.repos.splice(repoIndex, 1)
    },
  },
  actions: {
    async addTag ({ state, commit, dispatch, rootState }, tag) {
      if (rootState.isUpdatingData) {
        const message = i18n.t('update.uncompleted')
        notifyInfo(message)
        throw new Error(message)
      }

      if (typeof tag === 'string') tag = { id: Date.now(), name: tag, repos: [] }

      return validateTagName(state.tags, tag.name)
        .then(name => {
          commit('addTag', tag)
          dispatch('updateGitstarsData', { message: `${i18n.t('addTag')}: ${name}` }, { root: true })
            .catch(() => commit('popTag'))
        })
        .catch(({ message }) => {
          notifyWarn(message)
          throw new Error(message)
        })
    },
    changeTagName ({ state, commit }, { tagId, name }) {
      return validateTagName(state.tags, name)
        .then(name => {
          commit('changeTagName', { tagId, name })
        })
    },
  },
}
