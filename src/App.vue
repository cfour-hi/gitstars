<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" @toggleLabel="handleToggleLabel" @saveNewLabel="handleSaveNewLabel" @editLabels="handleEditLabels" @deleteLabel="handleDeleteLabel" @changeLabelName="handleChangeLabelName" @completeEditLabels="handleCompleteEditLabels"></layout-sidebar>
    <layout-main :user="user" :repos="currentLabelRepos" :load-starred-repos-completed="loadStarredReposCompleted" :labels="labels" @toggleLabel="handleToggleLabel" @addRepoLabel="handleAddRepoLabel" @deleteRepoLabel="handleDeleteRepoLabel"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getGitstarsGist, getUserGists, createGitstarsGist, saveGitstarsGist } from './api'
import config from './config'

const GITSTARS_GIST_ID = 'gitstars_gist_id'
let gitstarsGistId = ''
let starredReposClone = []

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      user: window._gitstars.user,
      starredRepos: [],
      loadStarredReposCompleted: false,
      labels: [],
      currentLabelId: 0
    }
  },
  computed: {
    unlabeledRepos () {
      let labeledReposId = []
      for (const { repos } of this.labels) {
        labeledReposId = [...labeledReposId, ...repos]
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
      if (!this.currentLabelId) return this.starredRepos
      if (this.currentLabelId === -1) return this.unlabeledRepos

      const currentLabelRepos = []
      const { repos } = this.labels.find(({ id }) => id === this.currentLabelId)

      for (const repo of this.starredRepos) {
        const { id } = repo
        if (repos.includes(id)) currentLabelRepos.push(repo)
      }
      return currentLabelRepos
    }
  },
  created () {
    gitstarsGistId = window.localStorage.getItem(GITSTARS_GIST_ID)

    new Promise(async (resolve, reject) => {
      if (gitstarsGistId) {
        let labels = window.localStorage.getItem(gitstarsGistId)
        if (!labels) {
          const { files } = await getGitstarsGist(gitstarsGistId)
          const { [config.filename]: file = {} } = files
          const { content = '[]' } = file
          labels = content
        }
        this.labels = JSON.parse(labels)

        await loadStarredRepos.call(this)
        resolve(this.labels)
      } else {
        axios.spread(async () => {
          const [, gists] = [...await axios.all([loadStarredRepos.call(this), getUserGists()])]

          for (const { id, description, files = {} } of gists) {
            if (description === config.description) {
              gitstarsGistId = id
              const { [config.filename]: file = {} } = files
              const { raw_url } = file
              this.labels = await axios.get(raw_url)
              break
            }
          }
          if (!gitstarsGistId) {
            const { id } = await createGitstarsGist()
            gitstarsGistId = id
            this.labels = []
          }
          window.localStorage.setItem(GITSTARS_GIST_ID, gitstarsGistId)
          resolve(this.labels)
        })()
      }
    }).then((labels = []) => {
      window.localStorage.setItem(gitstarsGistId, JSON.stringify(labels))

      for (const { id, _labels } of this.starredRepos) {
        for (const label of labels) {
          const { name, repos } = label
          for (const repoId of repos) {
            if (repoId === id) _labels.push({ name, id: label.id })
          }
        }
      }
    })
  },
  destroyed () {
    gitstarsGistId = ''
    starredReposClone = []
  },
  methods: {
    handleToggleLabel (id = 0) {
      this.currentLabelId = id
    },
    handleSaveNewLabel (name) {
      this.labels.push({ name, id: Date.now(), repos: [] })
      saveGitstarsLabels.call(this, `添加 ${name} 标签`).catch(() => this.labels.pop())
    },
    handleEditLabels () {
      starredReposClone = JSON.parse(JSON.stringify(this.starredRepos))
    },
    handleDeleteLabel (labelId) {
      this.starredRepos.forEach(({ _labels }) => {
        const index = _labels.findIndex(({ id }) => id === labelId)
        if (index > -1) _labels.splice(index, 1)
      })
    },
    handleChangeLabelName ({ labelId, labelName }) {
      this.starredRepos.forEach(({ _labels }) => {
        const label = _labels.find(({ id }) => id === labelId)
        if (label) label.name = labelName
      })
    },
    handleCompleteEditLabels (newLabels = []) {
      const oldLabels = this.labels
      this.labels = newLabels
      saveGitstarsLabels.call(this, `编辑标签完成`).catch(() => {
        this.labels = oldLabels
        this.starredRepos = starredReposClone
      })
    },
    handleAddRepoLabel ({ repoId, labelName }) {
      let label = {}
      const existLabel = this.labels.find(({ name }) => name === labelName) || {}
      const { repos } = existLabel

      if (repos) {
        label = existLabel
        if (!repos.includes(repoId)) repos.push(repoId)
      } else {
        label = { id: Date.now(), name: labelName, repos: [repoId] }
        this.labels.push(label)
      }

      // 查找仓库使用 this.starredRepos 而不是 this.currentLabelRepos
      // 是因为切换标签会改变 this.currentLabelRepos 的内容
      // 而不会改变 currentRepo (当前仓库) readme 的内容
      // this.currentLabelRepos 不一定包含 currentRepo
      // const { _labels } = this.currentLabelRepos.find(repo => repo.id === id)
      const repo = this.starredRepos.find(({ id }) => id === repoId)
      const { _labels } = repo
      _labels.push({ id: label.id, name: labelName })

      saveGitstarsLabels.call(this, `${repo.owner.login} / ${repo.name} 仓库添加 ${labelName} 标签`)
        .catch(() => {
          repos ? repos.pop() : this.labels.pop()
          _labels.pop()
        })
    },
    handleDeleteRepoLabel ({ repoId, labelId }) {
      // 因为计算函数 this.currentLabelRepos 依赖 this.labels
      // 所以先操作 this.currentLabelRepos 再操作 this.labels
      // 如果操作顺序交换
      // 则 this.currentLabelRepos 内无法找到 id 值对应的仓库
      // 因为 this.labels 内的值被改变之后立即更新了 this.currentLabelRepos 的值
      // 即已删除 id 值对应的仓库
      const repo = this.currentLabelRepos.find(({ id }) => id === repoId)
      const { _labels } = repo
      const labelIndex = _labels.findIndex(({ id }) => id === labelId)
      const label = _labels[labelIndex]
      _labels.splice(labelIndex, 1)

      const { repos } = this.labels.find(({ id }) => id === labelId)
      const repoIndex = repos.findIndex(id => id === repoId)
      repos.splice(repoIndex, 1)

      saveGitstarsLabels.call(this, `${repo.owner.login} / ${repo.name} 仓库删除 ${label.name} 标签`)
        .catch(() => {
          _labels.splice(labelIndex, 0, label)
          repos.splice(repoIndex, 0, repoId)
        })
    }
  }
}

async function saveGitstarsLabels (message) {
  const loadingNotify = this.$notify.info({
    iconClass: 'fa fa-cog fa-spin fa-fw',
    message: '正在执行，请稍后...',
    showClose: false,
    position: 'bottom-right'
  })
  const result = await saveGitstarsGist(gitstarsGistId, this.labels)
  window.localStorage.setItem(gitstarsGistId, JSON.stringify(this.labels))
  loadingNotify.close()
  this.$notify.success({ message, showClose: false, position: 'bottom-right' })
  return result
}

function loadStarredRepos (page = 1) {
  return new Promise(async (resolve, reject) => {
    let repos = []
    do {
      repos = await getStarredRepos(page++)
      repos.forEach(repo => (repo._labels = []))
      this.starredRepos = [...this.starredRepos, ...repos]
    } while (repos.length === 100)

    this.loadStarredReposCompleted = true
    resolve(this.starredRepos)
  })
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
