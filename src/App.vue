<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" :current-label="currentLabel" @toggleLabel="handleToggleLabel" @saveNewLabel="handleSaveNewLabel" @editLabels="handleEditLabels" @deleteLabel="handleDeleteLabel" @changeLabelName="handleChangeLabelName" @completeEditLabels="handleCompleteEditLabels"></layout-sidebar>
    <layout-main :user="user" :repos="currentLabelRepos" :load-starred-repos-completed="loadStarredReposCompleted" :labels="labels" :current-label="currentLabel" @toggleLabel="handleToggleLabel" @addRepoLabel="handleAddRepoLabel" @deleteRepoLabel="handleDeleteRepoLabel"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getGitstarsGist, getUserGists, createGitstarsGist, saveGitstarsGist } from './api'
import config from './config'

const { filename, description } = config
const GITSTARS_GIST_ID = 'gitstars_gist_id'
let gitstarsGistId = ''
let isContentFromAPI = true
let starredReposClone = []

// 是否需要兼容更新老数据 (issue1)
let isIssue1OldData = false

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      user: window._gitstars.user,
      starredRepos: [],
      loadStarredReposCompleted: false,
      labels: [],
      currentLabel: {}
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
        if (labeledReposId.has(repo.id)) continue
        unlabeledRepos.push(repo)
      }
      return unlabeledRepos
    },
    currentLabelRepos () {
      const { id } = this.currentLabel

      if (!id) return this.starredRepos
      if (id === -1) return this.unlabeledRepos

      const currentLabelRepos = []
      const { repos } = this.labels.find(label => label.id === id)

      for (const repo of this.starredRepos) {
        if (repos.includes(repo.id)) currentLabelRepos.push(repo)
      }
      return currentLabelRepos
    }
  },
  created () {
    gitstarsGistId = window.localStorage.getItem(GITSTARS_GIST_ID)
    let content = {}

    new Promise(async (resolve, reject) => {
      if (gitstarsGistId) {
        content = window.localStorage.getItem(gitstarsGistId)
        if (content) {
          isContentFromAPI = false
        } else {
          const { files } = await getGitstarsGist(gitstarsGistId)
          content = files[filename].content
          // 未来可还原 (issue1)
          // window.localStorage.setItem(gitstarsGistId, content)
        }
        // 数据兼容 (issue1)
        content = JSON.parse(content)
        if (Array.isArray(content)) {
          isIssue1OldData = true
          content = { lastModified: Date.now(), labels: content }
        }
        this.labels = content.labels

        await loadStarredRepos.call(this)
      } else {
        await axios.spread(async () => {
          const [, gists] = [...await axios.all([loadStarredRepos.call(this), getUserGists()])]

          for (const { id, description: gistDesc, files } of gists) {
            if (gistDesc === description) {
              gitstarsGistId = id
              content = await axios.get(files[filename].raw_url)

              // 数据兼容 (issue1)
              if (Array.isArray(content)) {
                isIssue1OldData = true
                content = { lastModified: Date.now(), labels: content }
              }
              this.labels = content.labels
              break
            }
          }
          if (!gitstarsGistId) {
            const labels = []
            content = { labels, lastModified: Date.now() }
            const { id } = await createGitstarsGist(content)
            gitstarsGistId = id
            this.labels = labels
          }
          window.localStorage.setItem(GITSTARS_GIST_ID, gitstarsGistId)
          // 未来可还原 (issue1)
          // window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))
        })()
      }
      resolve(content)
    }).then(async content => {
      const { lastModified = 0, labels = [] } = content
      window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))

      // 更新老数据 (issue1)
      if (isIssue1OldData && isContentFromAPI) saveGitstarsLabels.call(this)

      for (const { id, _labels } of this.starredRepos) {
        for (const label of labels) {
          for (const repoId of label.repos) {
            if (repoId === id) _labels.push({ id: label.id, name: label.name })
          }
        }
      }
      if (isContentFromAPI) return

      // 如果在多台电脑访问 Gitstars 管理标签
      // localStorage 内的标签数据多台电脑之间不共享
      // 所以当标签数据是从 localStorage 缓存获取时
      // 需要再从 Github API 获取一次标签数据
      // 然后根据 lastModified 字段确定是否使用从 Github API 获取的数据
      const { files } = await getGitstarsGist(gitstarsGistId)
      let gistContent = JSON.parse(files[filename].content)

      // 数据兼容 (issue1)
      if (Array.isArray(gistContent)) {
        isIssue1OldData = true
        gistContent = { lastModified: Date.now(), labels: gistContent }
      }
      if (gistContent.lastModified < lastModified) return

      this.labels = gistContent.labels

      if (isIssue1OldData) saveGitstarsLabels.call(this)
    })
  },
  destroyed () {
    gitstarsGistId = ''
    isContentFromAPI = true
    starredReposClone = []
    isIssue1OldData = false
  },
  methods: {
    handleToggleLabel (label) {
      this.currentLabel = label
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
    message: '正在更新，请稍后...',
    duration: 0,
    showClose: false,
    position: 'bottom-right'
  })
  const content = {
    lastModified: Date.now(),
    labels: this.labels
  }
  const result = await saveGitstarsGist(gitstarsGistId, content)
  window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))
  loadingNotify.close()
  if (message) this.$notify.success({ message, showClose: false, position: 'bottom-right' })
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
