<template>
  <div id="app">
    <layout-sidebar
      :starred-repos-len="starredRepos.length"
      :unlabeled-repos-len="unlabeledRepos.length"
      :current-label="currentLabel"
      :label-categorys="labelCategorys"
      :current-label-category="currentLabelCategory"
      @toggleLabel="handleToggleLabel"
      @saveNewLabel="handleSaveNewLabel"
      @editLabels="handleEditLabels"
      @deleteLabel="handleDeleteLabel"
      @changeLabelName="handleChangeLabelName"
      @completeEditLabels="handleCompleteEditLabels"
      @toggleLabelCategory="handleToggleLabelCategory">
    </layout-sidebar>
    <layout-main
      :user="user"
      :repos="currentLabelRepos"
      :load-starred-repos-completed="loadStarredReposCompleted"
      :current-label="currentLabel"
      :label-categorys="labelCategorys"
      @toggleLabel="handleToggleLabel"
      @addRepoLabel="handleAddRepoLabel"
      @deleteRepoLabel="handleDeleteRepoLabel">
    </layout-main>
  </div>
</template>

<script>
import axios from 'axios'
import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'
import config from './config'
// import constants from './constants'
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
let currentLabelReposCopy = []

const { filename, norifyPosition, starredReposPerPage, labelCategorys } = config
// const { UPDATE_SUCCESS, UPDATE_FAILED } = constants
const GITSTARS_GIST_ID = 'gitstars_gist_id'

function loadStarredRepos (page = 1) {
  return new Promise(async (resolve, reject) => {
    let repos = []
    do {
      repos = await getStarredRepos(page++)
      repos.forEach(repo => (repo._labels = { custom: [], language: [] }))
      this.starredRepos = [...this.starredRepos, ...repos]
    } while (repos.length === starredReposPerPage)

    this.loadStarredReposCompleted = true
    resolve(this.starredRepos)
  })
}

async function saveGitstarsLabels ({ message, content }) {
  const loadingNotify = this.$notify.info({
    iconClass: 'fa fa-cog fa-spin fa-fw',
    message: '正在更新，请稍后...',
    duration: 0,
    showClose: false,
    position: norifyPosition
  })

  if (!content) content = { lastModified: Date.now(), labels: this.customLabels }

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
      isNewUser: false,
      starredRepos: [],
      loadStarredReposCompleted: false,
      customLabels: [],
      languageLabels: [],
      currentLabel: {},
      currentLabelCategory: {}
    }
  },
  computed: {
    unlabeledRepos () {
      const labeledReposId = new Set(
        this.customLabels.reduce((accumRepos, { repos = [] }) => [...accumRepos, ...repos], [])
      )
      return this.starredRepos.filter(repo => !labeledReposId.has(repo.id))
    },

    labelCategorys () {
      const categorys = JSON.parse(JSON.stringify(labelCategorys))
      categorys.custom.labels = this.customLabels
      categorys.language.labels = this.languageLabels
      return categorys
    },

    currentLabelRepos () {
      const { id } = this.currentLabel

      // TODO
      // 0: 全部; -1: 未标签;
      if (id === 0) return this.starredRepos
      if (id === -1) return this.unlabeledRepos

      const { labels } = this.currentLabelCategory
      const { repos } = labels ? labels.find(label => label.id === id) : {}

      return repos ? this.starredRepos.filter(repo => repos.includes(repo.id)) : currentLabelReposCopy
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
            this.isNewUser = true
          }

          window.localStorage.setItem(GITSTARS_GIST_ID, gitstarsGistId)

          // Restore (issue1)
          // window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))
        })()
      }
      resolve(content)
    }).then(async content => {
      const { labels } = content
      if (labels.length === 0) this.currentLabelCategory = this.labelCategorys.custom

      let isIncludeInvalidId = false
      let DateNow = Date.now()
      const { languageLabels, starredRepos, isNewUser } = this

      starredRepos.forEach(({ id: repoId, language, _labels }) => {
        if (!language) return

        const { language: _languageLabels } = _labels
        const label = languageLabels.find(label => label.name === language)

        if (label) {
          label.repos.push(repoId)
          _languageLabels.push({ id: label.id, name: label.name })
        } else {
          languageLabels.push({ id: DateNow, name: language, repos: [repoId] })
          _languageLabels.push({ id: DateNow, name: language })
          DateNow += 1
        }
      })

      labels.forEach(label => {
        let reposCopy = [...label.repos]

        label.repos.forEach((repoId, index) => {
          /**
           * 可能用户 Unstar 了某些仓库
           * 所以存在标签内仓库 id 在 starredRepos 找不到 id 对应仓库的情况
          */
          const { _labels } = starredRepos.find(({ id }) => id === repoId) || {}
          if (_labels) {
            _labels.custom.push({ id: label.id, name: label.name })
          } else {
            isIncludeInvalidId = true
            delete reposCopy[index]
          }
        })

        label.repos = reposCopy.filter(repo => repo)
      })

      this.customLabels = labels
      window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))

      /**
       * 如果是来自 API 的老数据 (issue1) 或是用户 Unstar 了某些仓库
       * 则更新一次远程数据
      */
      if ((isIssue1OldData && isContentFromAPI) || isIncludeInvalidId || isNewUser) {
        saveGitstarsLabels.call(this, { content, message: this.$t('update.completed') })
          .catch(() => {
            this.$notify.warning({
              message: this.$t('update.failed'),
              showClose: false,
              position: norifyPosition
            })
          })
      }

      if (isContentFromAPI || isNewUser) return

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
        saveGitstarsLabels.call(this, { message: this.$t('update.completed'), content: gistContent })
          .catch(() => {
            this.$notify.warning({
              message: this.$t('update.failed'),
              showClose: false,
              position: norifyPosition
            })
          })
      } else {
        window.localStorage.setItem(gitstarsGistId, JSON.stringify(gistContent))
      }
      this.customLabels = gistContent.labels
    })
  },
  beforeDestroy () {
    gitstarsGistId = ''
    starredReposClone = []
    isContentFromAPI = true
    isIssue1OldData = false
    currentLabelReposCopy = []
  },
  methods: {
    handleToggleLabel ({ label, category = this.labelCategorys.custom }) {
      this.currentLabel = label
      this.currentLabelCategory = category
    },
    handleSaveNewLabel (name) {
      this.customLabels.push({ name, id: Date.now(), repos: [] })
      saveGitstarsLabels.call(this, { message: `添加 ${name} 标签` })
        .catch(() => this.customLabels.pop())
    },
    handleEditLabels () {
      starredReposClone = JSON.parse(JSON.stringify(this.starredRepos))
    },
    handleDeleteLabel ({ index, label }) {
      this.customLabels.splice(index, 1)

      this.starredRepos.forEach(({ _labels }) => {
        const { custom: customLabels } = _labels
        const index = customLabels.findIndex(({ id }) => id === label.id)
        if (index > -1) customLabels.splice(index, 1)
      })
    },
    handleChangeLabelName ({ id, name }) {
      this.starredRepos.forEach(({ _labels }) => {
        const label = _labels.custom.find(label => label.id === id)
        if (label) label.name = name
      })
    },
    handleCompleteEditLabels (labels = []) {
      const oldLabels = this.customLabels
      this.customLabels = labels
      saveGitstarsLabels.call(this, { message: `编辑标签完成` })
        .catch(() => {
          this.customLabels = oldLabels
          this.starredRepos = starredReposClone
        })
    },
    handleAddRepoLabel ({ id, name }) {
      let label = {}
      const existLabel = this.customLabels.find(label => label.name === name) || {}
      const { repos } = existLabel

      if (repos) {
        label = existLabel
        repos.push(id)
      } else {
        label = { name, id: Date.now(), repos: [id] }
        this.customLabels.push(label)
      }

      /**
       * 查找仓库使用 this.starredRepos 而不是 this.currentLabelRepos
       * 是因为切换标签会改变 this.currentLabelRepos 的内容
       * this.currentRepo 不一定在 this.currentLabelRepos 内
      */
      const repo = this.starredRepos.find(repo => repo.id === id)
      const { name: labelName } = label
      const { custom: customLabels } = repo._labels

      customLabels.push({ id: label.id, name: labelName })

      saveGitstarsLabels.call(this, {
        message: `${repo.owner.login} / ${repo.name} 仓库添加 ${labelName} 标签`
      }).catch(() => {
        repos ? repos.pop() : this.customLabels.pop()
        customLabels.pop()
      })
    },
    handleDeleteRepoLabel ({ repoId, labelId }) {
      /**
       * 因为计算函数 this.currentLabelRepos 依赖 this.customLabels
       * 所以先操作 this.currentLabelRepos 再操作 this.customLabels
       * 如果操作顺序交换
       * 则 this.currentLabelRepos 内无法找到 id 值对应的仓库
       * 因为 this.customLabels 内的值被改变之后立即更新了 this.currentLabelRepos 的值
       * 即已删除 id 值对应的仓库
      */
      const repo = this.currentLabelRepos.find(({ id }) => id === repoId) || {}
      const { custom: customLabels } = repo._labels
      const labelIndex = customLabels.findIndex(({ id }) => id === labelId)
      const labelCopy = customLabels.splice(labelIndex, 1)[0]
      const { repos } = this.customLabels.find(({ id }) => id === labelId) || {}
      const repoIndex = repos.findIndex(id => id === repoId)

      repos.splice(repoIndex, 1)
      saveGitstarsLabels.call(this, {
        message: `${repo.owner.login} / ${repo.name} 仓库删除 ${labelCopy.name} 标签`
      }).catch(() => {
        customLabels.splice(labelIndex, 0, labelCopy)
        repos.splice(repoIndex, 0, repoId)
      })
    },
    handleToggleLabelCategory ({ category }) {
      currentLabelReposCopy = this.currentLabelRepos
      this.currentLabelCategory = category
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
