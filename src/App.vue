<template>
  <div id="app">
    <layout-sidebar
      :starred-repos-len="starredRepos.length"
      :untagged-repos-len="untaggedRepos.length"
      :current-tag="currentTag"
      :tag-categorys="tagCategorys"
      :current-tag-category="currentTagCategory"
      @toggleTag="handleToggleTag"
      @saveNewTag="handleSaveNewTag"
      @editTags="handleEditTags"
      @deleteTag="handleDeleteTag"
      @changeTagName="handleChangeTagName"
      @completeEditTags="handleCompleteEditTags"
      @toggleTagCategory="handleToggleTagCategory">
    </layout-sidebar>
    <layout-main
      :user="user"
      :repos="currentTagRepos"
      :load-starred-repos-completed="loadStarredReposCompleted"
      :current-tag="currentTag"
      :tag-categorys="tagCategorys"
      @toggleTag="handleToggleTag"
      @addRepoTag="handleAddRepoTag"
      @deleteRepoTag="handleDeleteRepoTag">
    </layout-main>
  </div>
</template>

<script>
import axios from 'axios'
import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'
import config from './config'
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
let currentTagReposCopy = []

const { filename, norifyPosition, starredReposPerPage, defaultTags, tagCategorys } = config
const GITSTARS_GIST_ID = 'gitstars_gist_id'

function loadStarredRepos (page = 1) {
  return new Promise(async (resolve, reject) => {
    let repos = []
    do {
      repos = await getStarredRepos(page++)
      repos.forEach(repo => (repo._tags = { custom: [], language: [] }))
      this.starredRepos = [...this.starredRepos, ...repos]
    } while (repos.length === starredReposPerPage)

    this.loadStarredReposCompleted = true
    resolve(this.starredRepos)
  })
}

async function saveGitstarsTags ({ message, content }) {
  const loadingNotify = this.$notify.info({
    iconClass: 'fa fa-cog fa-spin fa-fw',
    message: this.$t('update.wait'),
    duration: 0,
    showClose: false,
    position: norifyPosition
  })

  if (!content) content = { lastModified: Date.now(), tags: this.customTags }

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
      customTags: [],
      languageTags: [],
      currentTag: {},
      currentTagCategory: {}
    }
  },
  computed: {
    untaggedRepos () {
      const taggedReposId = new Set(
        this.customTags.reduce((accumRepos, { repos = [] }) => [...accumRepos, ...repos], [])
      )
      return this.starredRepos.filter(repo => !taggedReposId.has(repo.id))
    },

    tagCategorys () {
      const categorys = JSON.parse(JSON.stringify(tagCategorys))
      categorys.custom.tags = this.customTags
      categorys.language.tags = this.languageTags
      return categorys
    },

    currentTagRepos () {
      const { id } = this.currentTag

      if (id === defaultTags.all.id) return this.starredRepos
      if (id === defaultTags.untagged.id) return this.untaggedRepos

      const { tags } = this.currentTagCategory
      const { repos } = tags ? tags.find(tag => tag.id === id) || {} : {}

      return repos ? this.starredRepos.filter(repo => repos.includes(repo.id)) : currentTagReposCopy
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
          content = { lastModified: Date.now(), tags: content }
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
                content = { lastModified: Date.now(), tags: content }
              }
              break
            }
          }

          if (!gitstarsGistId) {
            content = { tags: [], lastModified: Date.now() }
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
      /**
       * 老代码使用 label 标识标签不太准确
       * 修改为 tag
       */
      let isIssue5OldData = false
      if (content.labels) {
        isIssue5OldData = true
        content.tags = content.labels
        delete content.labels
      }

      let isIncludeInvalidId = false
      let DateNow = Date.now()
      const { languageTags, starredRepos, isNewUser } = this

      starredRepos.forEach(({ id: repoId, language, _tags }) => {
        if (!language) return

        const { language: _languageTags } = _tags
        const tag = languageTags.find(tag => tag.name === language)

        if (tag) {
          tag.repos.push(repoId)
          _languageTags.push({ id: tag.id, name: tag.name })
        } else {
          languageTags.push({ id: DateNow, name: language, repos: [repoId] })
          _languageTags.push({ id: DateNow, name: language })
          DateNow += 1
        }
      })

      const { tags } = content
      tags.forEach(tag => {
        tag.repos.forEach((repoId, index, repos) => {
          /**
           * 可能用户 Unstar 了某些仓库
           * 所以存在标签内仓库 id 在 starredRepos 找不到 id 对应仓库的情况
          */
          const { _tags } = starredRepos.find(({ id }) => id === repoId) || {}
          if (_tags) {
            _tags.custom.push({ id: tag.id, name: tag.name })
          } else {
            isIncludeInvalidId = true
            repos[index] = undefined
          }
        })

        tag.repos = tag.repos.filter(repo => !!repo)
      })

      this.customTags = tags

      const { custom, language } = this.tagCategorys
      this.currentTagCategory = tags.length === 0 ? language : custom

      window.localStorage.setItem(gitstarsGistId, JSON.stringify(content))

      /**
       * 如果是来自 API 的老数据 (issue1)
       * 或者用户 Unstar 了某些仓库
       * 或者是新用户
       * 或者是以 label 为标签标识的老数据（issue5）
       * 则更新一次远程数据
      */
      if ((isIssue1OldData && isContentFromAPI) || isIncludeInvalidId || isNewUser || isIssue5OldData) {
        saveGitstarsTags.call(this, { content, message: this.$t('update.completed') })
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
        gistContent = { lastModified: Date.now(), tags: gistContent }
      }

      /**
       * 如果本地是新数据并且比远程的数据时间值更大
       * 那就说明用户是在更新远程数据后的 60 秒内刷新了页面或是重新访问
      */
      if (gistContent.lastModified <= content.lastModified && !isIssue1OldData) return

      if (isIssue1OldDataFromAPI) {
        saveGitstarsTags.call(this, { message: this.$t('update.completed'), content: gistContent })
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
      this.customTags = gistContent.tags
    })
  },
  beforeDestroy () {
    gitstarsGistId = ''
    starredReposClone = []
    isContentFromAPI = true
    isIssue1OldData = false
    currentTagReposCopy = []
  },
  methods: {
    handleToggleTag ({ tag, category }) {
      this.currentTag = tag
      if (category) this.currentTagCategory = category
    },
    handleSaveNewTag (name) {
      this.customTags.push({ name, id: Date.now(), repos: [] })
      saveGitstarsTags.call(this, { message: `${this.convertFirstWordToUpperCase(this.$t('addTag'))}: ${name}` })
        .catch(() => this.customTags.pop())
    },
    handleEditTags () {
      starredReposClone = JSON.parse(JSON.stringify(this.starredRepos))
    },
    handleDeleteTag ({ tag }) {
      this.starredRepos.forEach(({ _tags }) => {
        const { custom: customTags } = _tags
        const index = customTags.findIndex(({ id }) => id === tag.id)
        if (index > -1) customTags.splice(index, 1)
      })
    },
    handleChangeTagName ({ id, name }) {
      this.starredRepos.forEach(({ _tags }) => {
        const tag = _tags.custom.find(tag => tag.id === id)
        if (tag) tag.name = name
      })
    },
    handleCompleteEditTags (tags = []) {
      const oldTags = this.customTags
      this.customTags = tags
      saveGitstarsTags.call(this, { message: this.$t('edit.completed') })
        .catch(() => {
          this.customTags = oldTags
          this.starredRepos = starredReposClone
        })
    },
    handleAddRepoTag ({ id, name }) {
      let tag = {}
      const existTag = this.customTags.find(tag => tag.name === name) || {}
      const { repos } = existTag

      if (repos) {
        tag = existTag
        repos.push(id)
      } else {
        tag = { name, id: Date.now(), repos: [id] }
        this.customTags.push(tag)
      }

      /**
       * 查找仓库使用 this.starredRepos 而不是 this.currentTagRepos
       * 是因为切换标签会改变 this.currentTagRepos 的内容
       * this.currentRepo 不一定在 this.currentTagRepos 内
      */
      const repo = this.starredRepos.find(repo => repo.id === id)
      const { name: tagName } = tag
      const { custom: customTags } = repo._tags

      customTags.push({ id: tag.id, name: tagName })

      saveGitstarsTags.call(this, {
        message: `${repo.owner.login} / ${repo.name} ${this.$t('add')} ${tagName} ${this.$t('tag')}`
      }).catch(() => {
        repos ? repos.pop() : this.customTags.pop()
        customTags.pop()
      })
    },
    handleDeleteRepoTag ({ repoId, tagId }) {
      /**
       * 因为计算函数 this.currentTagRepos 依赖 this.customTags
       * 所以先操作 this.currentTagRepos 再操作 this.customTags
       * 如果操作顺序交换
       * 则 this.currentTagRepos 内无法找到 id 值对应的仓库
       * 因为 this.customTags 内的值被改变之后立即更新了 this.currentTagRepos 的值
       * 即已删除 id 值对应的仓库
      */
      const repo = this.currentTagRepos.find(({ id }) => id === repoId) || {}
      const { custom: customTags } = repo._tags
      const tagIndex = customTags.findIndex(({ id }) => id === tagId)
      const tagCopy = customTags.splice(tagIndex, 1)[0]
      const { repos } = this.customTags.find(({ id }) => id === tagId) || {}
      const repoIndex = repos.findIndex(id => id === repoId)

      repos.splice(repoIndex, 1)
      saveGitstarsTags.call(this, {
        message: `${repo.owner.login} / ${repo.name} ${this.$t('delete')} ${tagCopy.name} ${this.$t('tag')}`
      }).catch(() => {
        customTags.splice(tagIndex, 0, tagCopy)
        repos.splice(repoIndex, 0, repoId)
      })
    },
    handleToggleTagCategory ({ category }) {
      currentTagReposCopy = this.currentTagRepos
      this.currentTagCategory = category
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
