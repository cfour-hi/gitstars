<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" @toggleLabel="handleToggleLabel" @saveNewLabel="handleSaveNewLabel" @completeEditLabels="handleCompleteEditLabels"></layout-sidebar>
    <layout-main :user="user" :current-label-repos="currentLabelRepos" :load-starred-repos-completed="loadStarredReposCompleted" :labels="labels" @toggleLabel="handleToggleLabel" @addRepoLabel="handleAddRepoLabel" @deleteRepoLabel="handleDeleteRepoLabel"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getGitstarsGist, getUserGists, createGitstarsGist, saveGitstarsGist } from './api'
import config from './config'

const GITSTARS_GIST_ID = 'gitstars_gist_id'

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      user: {},
      starredRepos: [],
      loadStarredReposCompleted: false,
      labels: [],
      gistId: '',
      currentLabelName: '_all$'
    }
  },
  computed: {
    unlabeledRepos () {
      let labeledReposId = []
      for (const { repos } of this.labels) {
        labeledReposId = labeledReposId.concat(repos)
      }
      labeledReposId = new Set(labeledReposId)
      const unlabeledRepos = []

      for (const repo of this.starredRepos) {
        const { id } = repo
        if (labeledReposId.has(id)) continue
        unlabeledRepos.push(repo)
      }
      return unlabeledRepos
    },
    currentLabelRepos () {
      if (this.currentLabelName === '_all$') return this.starredRepos
      if (this.currentLabelName === '_unlabeled$') return this.unlabeledRepos

      const currentLabelRepos = []
      const { repos } = this.labels.find(label => (label.name === this.currentLabelName))

      for (const repo of this.starredRepos) {
        const { id } = repo
        if (repos.includes(id)) currentLabelRepos.push(repo)
      }
      return currentLabelRepos
    }
  },
  created () {
    const gitstarsGistId = window.localStorage.getItem(GITSTARS_GIST_ID)

    new Promise((resolve, reject) => {
      if (gitstarsGistId) {
        this.gistId = gitstarsGistId
        axios.all([this._getStarredRepos(), getGitstarsGist(gitstarsGistId)])
          .then(axios.spread((repos, { files = {} } = {}) => {
            const { content = '[]' } = files[Object.keys(files)[0]]
            this.labels = JSON.parse(content)
            resolve(this.labels)
          }))
      } else {
        axios.all([this._getStarredRepos(), getUserGists()])
          .then(axios.spread(async (repos, gists = []) => {
            for (const { files = {}, description, id } of gists) {
              if (description === config.description) {
                this.gistId = id
                window.localStorage.setItem(GITSTARS_GIST_ID, id)
                const { raw_url } = files[Object.keys(files)[0]]
                this.labels = await axios.get(raw_url)
                break
              }
            }
            if (!this.gistId) {
              createGitstarsGist().then(({ id }) => {
                this.gistId = id
                window.localStorage.setItem(GITSTARS_GIST_ID, id)
                this.labels = []
              })
            }
            resolve(this.labels)
          }))
      }
    }).then((labels = []) => {
      for (const { id, _labels } of this.starredRepos) {
        for (const { name, repos } of labels) {
          for (const repoId of repos) {
            if (repoId === id) _labels.push(name)
          }
        }
      }
    })
  },
  methods: {
    _getStarredRepos (page = 1) {
      return new Promise(async (resolve, reject) => {
        let repos = null
        do {
          repos = await getStarredRepos(page++)
          repos.forEach(repo => (repo._labels = []))
          this.starredRepos = this.starredRepos.concat(repos)
        } while (repos.length === 100)

        this.loadStarredReposCompleted = true
        resolve(this.starredRepos)
      })
    },
    _saveGitstarsGist (message) {
      const loadingNotify = this.$notify.info({
        iconClass: 'fa fa-cog fa-spin fa-fw',
        message: '正在执行，请稍后...',
        showClose: false
      })
      return saveGitstarsGist(this.gistId, this.labels).then(() => {
        loadingNotify.close()
        this.$notify.success({ message, showClose: false })
      })
    },
    handleToggleLabel (name) {
      this.currentLabelName = name
    },
    handleSaveNewLabel (name) {
      this.labels.push({ name, repos: [] })
      this._saveGitstarsGist(`添加 ${name} 标签`).catch(() => this.labels.pop())
    },
    handleCompleteEditLabels (newLabels = []) {
      const oldLabels = this.labels
      this.labels = newLabels
      this._saveGitstarsGist(`编辑标签完成`).catch(() => (this.labels = oldLabels))
    },
    handleAddRepoLabel ({ id, name }) {
      const { repos } = this.labels.find(label => label.name === name) || {}
      if (repos) {
        if (!repos.includes(id)) repos.push(id)
      } else {
        this.labels.push({ name, repos: [id] })
      }
      // 查找仓库使用 this.starredRepos 而不是 this.currentLabelRepos
      // 是因为切换标签会改变 this.currentLabelRepos 的内容
      // 而不会改变 currentRepo (当前仓库) readme 的内容
      // this.currentLabelRepos 不一定包含 currentRepo
      // const { _labels } = this.currentLabelRepos.find(repo => repo.id === id)
      const repo = this.starredRepos.find(repo => repo.id === id)
      const { _labels } = repo
      _labels.push(name)
      this._saveGitstarsGist(`${repo.owner.login} / ${repo.name} 仓库添加 ${name} 标签`).catch(() => _labels.pop())
    },
    handleDeleteRepoLabel ({ id, name }) {
      // 因为计算函数 this.currentLabelRepos 依赖 this.labels
      // 所以先操作 this.currentLabelRepos 再操作 this.labels
      // 如果操作顺序交换
      // 则 this.currentLabelRepos 内无法找到 id 值对应的仓库
      // 因为 this.labels 内的值被改变之后立即更新了 this.currentLabelRepos 的值
      // 即已删除 id 值对应的仓库
      const repo = this.currentLabelRepos.find(repo => repo.id === id)
      const { _labels } = repo
      const labelIndex = _labels.findIndex(labelName => labelName === name)
      _labels.splice(labelIndex, 1)

      const { repos } = this.labels.find(label => label.name === name)
      const idIndex = repos.findIndex(repoId => repoId === id)
      repos.splice(idIndex, 1)

      this._saveGitstarsGist(`${repo.owner.login} / ${repo.name} 仓库删除 ${name} 标签`).catch(() => {
        _labels.splice(labelIndex, 0, name)
        repos.splice(idIndex, 0, id)
      })
    }
  }
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100%;
}
</style>

<style>
@import "app.css";
</style>
