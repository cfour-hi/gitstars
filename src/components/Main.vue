<template>
  <main id="main">
    <layout-header :user="user"></layout-header>
    <div class="main-body">
      <sub-sidebar
        :repos="currentRepos"
        :load-starred-repos-completed="loadStarredReposCompleted"
        :current-label="currentLabel"
        @changeSearchValue="handleChangeSearchValue"
        @toggleRepo="handleToggleRepo"
        @toggleLabel="handleToggleLabel"
        @deleteRepoLabel="handleDeleteRepoLabel">
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
              v-model="labelName"
              :fetch-suggestions="handleFetchLabelSuggestions"
              ref="repoLabelNameInput"
              size="small" placeholder="新增标签"
              class="repo-label-input"
              @select="handleAddRepoLabel"
              select-when-unmatched>
              <i slot="prefix" class="fa fa-fw fa-lg fa-tag el-input__icon"></i>
              <el-button slot="append" @click="handleAddRepoLabel">添加</el-button>
            </el-autocomplete>
          </header>
          <article v-html="repoReadme" class="markdown-body"></article>
        </section>
        <section v-show="!repoReadme" class="waiting">
          <h4 class="readme">README.md</h4>
          <p class="loader">
            <i v-show="isLoadingRepoReadme" class="fa fa-cog fa-spin fa-2x fa-fw"></i>
            <span v-if="!isSelectedRepo">
              <i class="fa fa-hand-o-left fa-lg" aria-hidden="true"></i>
              <span>点击左侧 starred 仓库查看</span>
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
import constants from '../constants'

const { norifyPosition } = config
const { LABEL_NAME_CANNOT_ENPTY, LABEL_NAME_ALREADY_EXIST } = constants

export default {
  name: 'main',
  components: { LayoutHeader, SubSidebar },
  props: {
    user: { type: Object, default: {} },
    repos: { type: Array, default: [] },
    loadStarredReposCompleted: { type: Boolean, default: false },
    customLabels: { type: Array, default: [] },
    currentLabel: { type: Object, default: {} }
  },
  data () {
    return {
      repoReadme: '',
      searchValue: '',
      labelName: '',
      currentRepo: {},
      isLoadingRepoReadme: false,
      isSelectedRepo: false
    }
  },
  computed: {
    currentRepos () {
      return this.repos.filter(({ owner = {}, name = '' }) => {
        const { login = '' } = owner
        return (login.toLowerCase().includes(this.searchValue) || name.toLowerCase().includes(this.searchValue))
      })
    },
    currentRepoUnlabeledLabels () {
      return this.customLabels.filter(label => !this.currentRepo._labels.custom.find(({ id }) => id === label.id)).map(({ name }) => name)
    }
  },
  methods: {
    async handleToggleRepo ({ id, owner, name }) {
      this.currentRepo = this.repos.find(repo => repo.id === id)
      this.isSelectedRepo = true
      this.isLoadingRepoReadme = true
      this.repoReadme = ''

      const { content } = await getRepoReadme(owner.login, name)

      this.repoReadme = await getRenderedReadme(decodeURIComponent(escape(atob(content)))) // 包含中文内容的 base64 解码
      this.isLoadingRepoReadme = false
    },
    handleToggleLabel (payload) {
      this.$emit('toggleLabel', payload)
    },
    handleChangeSearchValue (searchValue = '') {
      this.searchValue = searchValue.toLowerCase()
    },
    handleDeleteRepoLabel (payload) {
      this.$emit('deleteRepoLabel', payload)
    },
    handleFetchLabelSuggestions (inputStr, cb) {
      inputStr = inputStr.toLowerCase()
      cb(this.currentRepoUnlabeledLabels.filter(name => name.toLowerCase().includes(inputStr)).map(name => ({ value: name })))
    },
    handleAddRepoLabel () {
      let message = ''
      const labelName = this.labelName.trim()
      if (!labelName) message = LABEL_NAME_CANNOT_ENPTY

      if (this.currentRepo._labels.custom.find(({ name }) => name === labelName)) message = LABEL_NAME_ALREADY_EXIST

      if (message) return this.$notify.warning({ message, showClose: false, position: norifyPosition })

      this.$emit('addRepoLabel', { id: this.currentRepo.id, name: labelName })
      this.labelName = ''
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

.repo-label-input {
  width: 200px;
}

.repo-label-input .el-input-group__append .el-button {
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
  position: absolute;
  top: 30%;
  left: 50%;
  font-size: 14px;
  text-align: center;
  color: #d9d9d9;
  user-select: none;
  transform: translateX(-50%);
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
