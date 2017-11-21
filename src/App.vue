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
import config from './config'
import constants from './constants'
import {
  getStarredRepos,
  getGitstarsGist,
  getUserGists,
  createGitstarsGist,
  saveGitstarsGist
} from './api'

let gitstarsGistId = ''
let starredReposClone = []
let isContentFromAPI = true
let isIssue1OldData = false // (issue1)

const { filename, norifyPosition, starredReposPerPage } = config
const { UPDATE_SUCCESS, UPDATE_FAILED } = constants
const GITSTARS_GIST_ID = 'gitstars_gist_id'

const loadStarredRepos = function loadStarredRepos (page = 1) {
  return new Promise(async (resolve, reject) => {
    let repos = []
    do {
      repos = await getStarredRepos(page++)
      repos.forEach(repo => (repo._labels = []))
      this.starredRepos = [...this.starredRepos, ...repos]
    } while (repos.length === starredReposPerPage)

    this.loadStarredReposCompleted = true
    resolve(this.starredRepos)
  })
}

const saveGitstarsLabels = async function saveGitstarsLabels ({ message, content }) {
  const loadingNotify = this.$notify.info({
    iconClass: 'fa fa-cog fa-spin fa-fw',
    message: '正在更新，请稍后...',
    duration: 0,
    showClose: false,
    position: norifyPosition
  })
  if (!content) content = { lastModified: Date.now(), labels: this.labels }

  const result = await saveGitstarsGist(gitstarsGistId, content)
  window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))
  loadingNotify.close()

  if (message) this.$notify.success({ message, showClose: false, position: norifyPosition })
  return result
}

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      user: window._gitstars.user,
      starredRepos: [],
      loadStarredReposCompleted: false,
      labels: [],
      currentLabel: { id: 0 }
    }
  },
  computed: {
    unlabeledRepos () {
      const labeledReposId = new Set(this.labels.reduce((accumRepos, { repos = [] }) => [...accumRepos, ...repos], []))
      return this.starredRepos.filter(repo => !labeledReposId.has(repo.id))
    },
    currentLabelRepos () {
      const { id } = this.currentLabel

      // 0: 全部; -1: 未标签;
      if (id === 0) return this.starredRepos
      if (id === -1) return this.unlabeledRepos

      const { repos } = this.labels.find(label => label.id === id)
      return this.starredRepos.filter(repo => repos.includes(repo.id))
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

          // Restore (issue1)
          // window.localStorage.setItem(gitstarsGistId, content)
        }

        content = JSON.parse(content)

        // 数据兼容 (issue1)
        if (Array.isArray(content)) {
          isIssue1OldData = true
          content = { lastModified: Date.now(), labels: content }
        }

        await loadStarredRepos.call(this)
      } else {
        await axios.spread(async () => {
          const [, gists] = [...await axios.all([loadStarredRepos.call(this), getUserGists()])]

          for (const { id, description, files } of gists) {
            if (description === config.description) {
              gitstarsGistId = id
              content = await axios.get(files[filename].raw_url)

              // 数据兼容 (issue1)
              if (Array.isArray(content)) {
                isIssue1OldData = true
                content = { lastModified: Date.now(), labels: content }
              }
              break
            }
          }

          if (!gitstarsGistId) {
            content = { labels: [], lastModified: Date.now() }
            const { id } = await createGitstarsGist(content)
            gitstarsGistId = id
          }

          window.localStorage.setItem(GITSTARS_GIST_ID, gitstarsGistId)

          // Restore (issue1)
          // window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))
        })()
      }
      resolve(content)
    }).then(async content => {
      let isIncludeInvalidId = false

      content.labels.forEach(label => {
        let reposCopy = [...label.repos]

        label.repos.forEach((repoId, index) => {
          const { _labels } = this.starredRepos.find(({ id }) => id === repoId) || {}
          if (_labels) {
            _labels.push({ id: label.id, name: label.name })
          } else {
            isIncludeInvalidId = true
            delete reposCopy[index]
          }
        })
        label.repos = reposCopy.filter(repo => repo)
      })

      this.labels = content.labels
      window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))

      // 如果是来自 API 的老数据 (issue1) 或是用户 Unstar 了某些仓库
      // 则更新一次远程数据
      if ((isIssue1OldData && isContentFromAPI) || isIncludeInvalidId) {
        saveGitstarsLabels.call(this, { content, message: UPDATE_SUCCESS })
          .catch(() => {
            this.$notify.warning({
              message: UPDATE_FAILED,
              showClose: false,
              position: norifyPosition
            })
          })
      }

      if (isContentFromAPI) return

      /**
       * localStorage 内的标签数据多台电脑之间不共享
       * 所以当标签数据是从 localStorage 缓存获取时
       * 需要再从 Github API 获取一次远程数据
       * 然后根据 lastModified 字段确定是否使用远程数据
       */
      const { files } = await getGitstarsGist(gitstarsGistId)
      let gistContent = JSON.parse(files[filename].content)
      let isIssue1OldDataFromAPI = false

      // 数据兼容 (issue1)
      if (Array.isArray(gistContent)) {
        isIssue1OldDataFromAPI = true
        gistContent = { lastModified: Date.now(), labels: gistContent }
      }

      /**
       * 如果本地是新数据并且比远程的数据时间值更大
       * 那就说明用户是在更新远程数据后的 60 秒内刷新了页面或是重新访问
       */
      if (gistContent.lastModified <= content.lastModified && !isIssue1OldData) return

      if (isIssue1OldDataFromAPI) {
        saveGitstarsLabels.call(this, { message: UPDATE_SUCCESS, content: gistContent })
          .catch(() => {
            this.$notify.warning({
              message: UPDATE_FAILED,
              showClose: false,
              position: norifyPosition
            })
          })
      } else {
        window.localStorage.setItem(gitstarsGistId, JSON.stringify(gistContent))
      }
      this.labels = gistContent.labels
    })
  },
  destroyed () {
    gitstarsGistId = ''
    starredReposClone = []
    isContentFromAPI = true
    isIssue1OldData = false
  },
  methods: {
    handleToggleLabel (label) {
      this.currentLabel = label
    },
    handleSaveNewLabel (name) {
      this.labels.push({ name, id: Date.now(), repos: [] })
      saveGitstarsLabels.call(this, { message: `添加 ${name} 标签` })
        .catch(() => this.labels.pop())
    },
    handleEditLabels () {
      starredReposClone = JSON.parse(JSON.stringify(this.starredRepos))
    },
    handleDeleteLabel ({ id }) {
      this.starredRepos.forEach(({ _labels }) => {
        const index = _labels.findIndex(label => label.id === id)
        if (index > -1) _labels.splice(index, 1)
      })
    },
    handleChangeLabelName ({ id, name }) {
      this.starredRepos.forEach(({ _labels }) => {
        const label = _labels.find(label => label.id === id)
        if (label) label.name = name
      })
    },
    handleCompleteEditLabels (labels = []) {
      const oldLabels = this.labels
      this.labels = labels
      saveGitstarsLabels.call(this, { message: `编辑标签完成` })
        .catch(() => {
          this.labels = oldLabels
          this.starredRepos = starredReposClone
        })
    },
    handleAddRepoLabel ({ id, name }) {
      let label = {}
      const existLabel = this.labels.find(label => label.name === name) || {}
      const { repos } = existLabel

      if (repos) {
        label = existLabel
        repos.push(id)
      } else {
        label = { name, id: Date.now(), repos: [id] }
        this.labels.push(label)
      }

      /**
       * 查找仓库使用 this.starredRepos 而不是 this.currentLabelRepos
       * 是因为切换标签会改变 this.currentLabelRepos 的内容
       * this.currentRepo 不一定在 this.currentLabelRepos 内
       */
      const repo = this.starredRepos.find(repo => repo.id === id)
      const { name: labelName } = label
      const { _labels } = repo

      _labels.push({ id: label.id, name: labelName })

      saveGitstarsLabels.call(this, { message: `${repo.owner.login} / ${repo.name} 仓库添加 ${labelName} 标签` })
        .catch(() => {
          repos ? repos.pop() : this.labels.pop()
          _labels.pop()
        })
    },
    handleDeleteRepoLabel ({ repoId, labelId }) {
      /**
       * 因为计算函数 this.currentLabelRepos 依赖 this.labels
       * 所以先操作 this.currentLabelRepos 再操作 this.labels
       * 如果操作顺序交换
       * 则 this.currentLabelRepos 内无法找到 id 值对应的仓库
       * 因为 this.labels 内的值被改变之后立即更新了 this.currentLabelRepos 的值
       * 即已删除 id 值对应的仓库
      */
      const repo = this.currentLabelRepos.find(({ id }) => id === repoId) || {}
      const { _labels } = repo
      const labelIndex = _labels.findIndex(({ id }) => id === labelId)
      const labelCopy = _labels.splice(labelIndex, 1)[0]
      const { repos } = this.labels.find(({ id }) => id === labelId) || {}
      const repoIndex = repos.findIndex(id => id === repoId)

      repos.splice(repoIndex, 1)
      saveGitstarsLabels.call(this, { message: `${repo.owner.login} / ${repo.name} 仓库删除 ${labelCopy.name} 标签` })
        .catch(() => {
          _labels.splice(labelIndex, 0, labelCopy)
          repos.splice(repoIndex, 0, repoId)
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
