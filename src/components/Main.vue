<template>
  <main id="main">
    <layout-header :user="user"></layout-header>
    <div class="main-body">
      <sub-sidebar
        :repos="currentRepos"
        :load-starred-repos-completed="loadStarredReposCompleted"
        :current-tag="currentTag"
        :tag-categorys="tagCategorys"
        @changeSearchValue="handleChangeSearchValue"
        @toggleRepo="handleToggleRepo"
        @toggleTag="handleToggleTag"
        @deleteRepoTag="handleDeleteRepoTag">
      </sub-sidebar>
      <div class="content">
        <section v-show="repoReadme || isLoadingRepoReadme" class="repo-readme">
          <header class="repo-readme__header">
            <h3 v-if="!!Object.keys(currentRepo).length" class="repo-title">
              <a :href="currentRepo.html_url" target="_blank">
                <i class="fa fa-fw fa-lg fa-github" aria-hidden="true"></i>
              </a>
              {{ currentRepo.owner.login }} / {{ currentRepo.name }}
            </h3>
            <el-autocomplete
              v-model="tagName"
              :fetch-suggestions="handleFetchTagSuggestions"
              :placeholder="convertFirstWordToUpperCase($t('addNewTag'))"
              size="small"
              class="repo-tag-input"
              @select="handleAddRepoTag"
              select-when-unmatched>
              <i slot="prefix" class="fa fa-fw fa-lg fa-tag el-input__icon"></i>
              <el-button slot="append" @click="handleAddRepoTag">{{ convertFirstWordToUpperCase($t('add')) }}</el-button>
            </el-autocomplete>
          </header>
          <article v-html="repoReadme" class="markdown-body"></article>
        </section>
        <section v-show="!repoReadme" class="waiting vc-p">
          <h4 class="readme">README.md</h4>
          <p class="loader">
            <i v-show="isLoadingRepoReadme" class="fa fa-cog fa-spin fa-2x fa-fw"></i>
            <span v-if="!isSelectedRepo">
              <i class="fa fa-hand-o-left fa-lg" aria-hidden="true"></i>
              <span>{{ $t('clickLeftStarredRepoToView') }}</span>
            </span>
          </p>
        </section>
      </div>
    </div>
  </main>
</template>

<script>
import LayoutHeader from './Header'
import SubSidebar from './SubSidebar'
import { getRepoReadme, getRenderedReadme } from '../api'
import config from '../config'

const { norifyPosition } = config

export default {
  name: 'main',
  components: { LayoutHeader, SubSidebar },
  props: {
    user: { type: Object, default () { return {} } },
    repos: { type: Array, default () { return [] } },
    loadStarredReposCompleted: { type: Boolean, default: false },
    currentTag: { type: Object, default () { return {} } },
    tagCategorys: { required: true, type: Object }
  },
  data () {
    return {
      repoReadme: '',
      searchValue: '',
      tagName: '',
      currentRepo: {},
      isLoadingRepoReadme: false,
      isSelectedRepo: false
    }
  },
  computed: {
    currentRepos () {
      const { searchValue } = this
      return this.repos.filter(({ owner = {}, name = '' }) => {
        return (
          owner.login.toLowerCase().includes(searchValue) ||
          name.toLowerCase().includes(searchValue)
        )
      })
    },
    currentRepoUntaggedTags () {
      return this.tagCategorys.custom.tags
        .filter(tag => !this.currentRepo._tags.custom.find(({ id }) => id === tag.id))
        .map(({ name }) => name)
    }
  },
  methods: {
    async handleToggleRepo ({ id, owner, name }) {
      this.currentRepo = this.repos.find(repo => repo.id === id)
      this.isSelectedRepo = true
      this.isLoadingRepoReadme = true
      this.repoReadme = ''

      const { content } = await getRepoReadme(owner.login, name)

      // 包含中文内容的 base64 解码
      this.repoReadme = await getRenderedReadme(decodeURIComponent(escape(atob(content))))
      this.isLoadingRepoReadme = false
    },
    handleToggleTag (payload) {
      this.$emit('toggleTag', payload)
    },
    handleChangeSearchValue (searchValue = '') {
      this.searchValue = searchValue.toLowerCase()
    },
    handleDeleteRepoTag (payload) {
      this.$emit('deleteRepoTag', payload)
    },
    handleFetchTagSuggestions (inputStr, cb) {
      inputStr = inputStr.toLowerCase()
      cb(this.currentRepoUntaggedTags
        .filter(name => name.toLowerCase().includes(inputStr))
        .map(name => ({ value: name })))
    },
    handleAddRepoTag () {
      let message = ''
      const tagName = this.tagName.trim()

      if (!tagName) message = this.$t('tagNameCannotEmpty')

      if (this.currentRepo._tags.custom.find(({ name }) => name === tagName)) {
        message = this.$t('tagNameAlreadyExist')
      }

      if (message) {
        return this.$notify.warning({ message, showClose: false, position: norifyPosition })
      }

      this.$emit('addRepoTag', { id: this.currentRepo.id, name: tagName })
      this.tagName = ''
    }
  }
}
</script>

<style scoped>
#main {
  display: flex;
  flex-direction: column;
  flex: auto;
}

.main-body {
  flex: auto;
  position: relative;
}

.content {
  position: absolute;
  left: 400px;
  right: 0;
  height: 100%;
  min-width: 650px;
}

.repo-readme {
  height: 100%;
}

.repo-readme__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 15px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.repo-readme__header .fa-github,
.repo-title {
  color: #5a5a5a;
}

.repo-tag-input {
  width: 200px;
}

.repo-tag-input .el-input-group__append .el-button {
  padding: 10px;
}

.markdown-body {
  overflow: auto;
  height: calc(100% - 85px);
  padding: 20px;
  font-size: 14px;
  color: #5a5a5a;
}

.markdown-body::-webkit-scrollbar {
  width: 8px;
}

.waiting {
  top: 40%;
  font-size: 14px;
  text-align: center;
  color: #d9d9d9;
  user-select: none;
}

.readme {
  font-size: 28px;
  margin: 0.5em;
  font-weight: 700;
}

.loader {
  height: 28px;
}
</style>

<style>
.markdown-body a:hover {
  color: #0366d6;
  text-decoration: none;
}
</style>
