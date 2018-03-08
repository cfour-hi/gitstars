import i18n from '@/i18n'
import appConfig from '@/config'
import { validateTagName, formatReposTag, notifyInfo, notifyWarn } from '@/helper'

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
    resetTags ({ commit, rootState }, tags) {
      /**
       * 当用户编辑 tags 完成之后确认更新数据
       * 如果更新数据接口出错
       * 则还原编辑操作之前 tags 数据的同时还需还原每个 repository 上的 _customTags 数据
       * 因为 _customTags 内保存的是每一个 tag 对象的引用
       * 修改标签名就是直接修改 tag 对象的 name 属性
       * 而还原 tags 数据则是对 tags 重新赋值
       * 此时 repository 上的 _customTags 集合内项目依然是之前 tags 集合项目的引用
       *
       * 目前的解决办法是使用 formatReposTag 方法重新格式化每个 repository 内的 _customTags 集合
       */
      commit('initTags', tags)
      formatReposTag(rootState.repo.repos, tags)
    },
    async addTag ({ state, commit, dispatch, rootState }, tag) {
      if (rootState.isUpdatingData) {
        const message = i18n.t('update.uncompleted')
        notifyInfo({ message })
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
          notifyWarn({ message })
          throw new Error(message)
        })
    },
    changeTagName ({ state, commit }, { tagId, name }) {
      return validateTagName(state.tags, name)
        .then(name => {
          commit('changeTagName', { tagId, name })
        })
    },
    deleteTag ({ commit }, tagId) {
      commit('deleteTag', tagId)
      commit('repo/deleteReposTag', tagId, { root: true })
    },
  },
}
