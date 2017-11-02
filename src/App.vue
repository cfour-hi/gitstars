<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" @toggleLabel="handleToggleLabel" @saveNewLabel="handleSaveNewLabel" @deleteLabel="handleDeleteLabel"></layout-sidebar>
    <layout-main :current-label-repos="currentLabelRepos" :load-starred-repos-completed="loadStarredReposCompleted" :labels="labels" @toggleLabel="handleToggleLabel" @addRepoLabel="handleAddRepoLabel" @deleteRepoLabel="handleDeleteRepoLabel"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getUserGists, saveLabelGist } from './api'

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
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
    axios.all([this._getStarredRepos(), getUserGists()]).then(axios.spread(async (repos, gists) => {
      for (const { files, description, id } of gists) {
        if (description === 'gitstars') {
          this.gistId = id
          const { raw_url } = files[Object.keys(files)[0]]
          this.labels = await axios.get(raw_url)
          break
        }
      }
      for (const { id, _labels } of this.starredRepos) {
        for (const { name, repos } of this.labels) {
          for (const repoId of repos) {
            if (repoId === id) _labels.push(name)
          }
        }
      }
    }))
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
    _saveLabelGist (message) {
      return saveLabelGist(this.gistId, this.labels).then(() => {
        this.$notify.success({ message, position: 'top-left', duration: 3000 })
      })
    },
    handleToggleLabel (name) {
      this.currentLabelName = name
    },
    handleSaveNewLabel (name) {
      this.labels.push({ name, repos: [] })
      this._saveLabelGist(`添加 ${name} 标签`).catch(() => this.labels.pop())
    },
    handleDeleteLabel (labelName) {
      const index = this.labels.findIndex(({ name }) => name === labelName)
      const repos = this.labels[index]
      this.labels.splice(index, 1)
      this._saveLabelGist(`删除 ${labelName} 标签`).catch(() => this.splice(index, 0, repos))
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
      const { _labels } = this.starredRepos.find(repo => repo.id === id)
      _labels.push(name)
      this._saveLabelGist(`添加仓库 ${name} 标签`).catch(() => _labels.pop())
    },
    handleDeleteRepoLabel ({ id, name }) {
      // 因为计算函数 this.currentLabelRepos 依赖 this.labels
      // 所以先操作 this.currentLabelRepos 在操作 this.labels
      // 如果操作顺序交换
      // 则 this.currentLabelRepos 内无法找到 id 值对应的仓库
      // 因为 this.labels 内的值被改变之后立即更新了 this.currentLabelRepos 的值
      // 即已删除 id 值对应的仓库
      const { _labels } = this.currentLabelRepos.find(repo => repo.id === id)
      const labelIndex = _labels.findIndex(labelName => labelName === name)
      _labels.splice(labelIndex, 1)

      const { repos } = this.labels.find(label => label.name === name)
      const idIndex = repos.findIndex(repoId => repoId === id)
      repos.splice(idIndex, 1)

      this._saveLabelGist(`删除仓库 ${name} 标签`).catch(() => {
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
