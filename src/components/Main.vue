<template>
  <main id="main">
    <layout-header :user="user" @changeSearchValue="handleChangeSearchValue"></layout-header>
    <div class="main-body">
      <sub-sidebar :repos="filteredRepos" :load-starred-repos-completed="loadStarredReposCompleted" @toggleRepo="handleToggleRepo" @toggleLabel="handleToggleLabel" @deleteRepoLabel="handleDeleteRepoLabel"></sub-sidebar>
      <div class="content">
        <section v-show="repoReadme" class="repo-readme">
          <header class="repo-readme__header">
            <h3 v-if="Object.keys(currentRepo).length" class="repo-title">{{currentRepo.owner.login}} / {{currentRepo.name}}</h3>
            <el-autocomplete v-show="isInputLabelName" v-model="labelName" :fetch-suggestions="handleFetchLabelSuggestions" ref="repoLabelNameInput" size="small" placeholder="标签名称" class="repo-label-input" @select="handleSelectRepoLabel" @blur="handleRepoLabelInputBlur" @keyup.enter.native="handleSaveRepoLabel" select-when-unmatched></el-autocomplete>
            <el-button v-show="!isInputLabelName" size="small" @click="handleAddRepoLabel">
              <i class="fa fa-plus-square" aria-hidden="true"></i>
              <span>添加标签</span>
            </el-button>
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
import constants from '../constants'

const { LABEL_NAME_CANNOT_ENPTY, LABEL_NAME_ALREADY_EXIST } = constants

export default {
  name: 'main',
  components: { LayoutHeader, SubSidebar },
  props: {
    user: { type: Object, default: {} },
    currentLabelRepos: { type: Array, default: [] },
    loadStarredReposCompleted: { type: Boolean, default: false },
    labels: { type: Array, default: [] }
  },
  data () {
    return {
      repoReadme: '',
      searchValue: '',
      labelName: '',
      currentRepo: {},
      isLoadingRepoReadme: false,
      isSelectedRepo: false,
      isInputLabelName: false
    }
  },
  computed: {
    filteredRepos () {
      return this.currentLabelRepos.filter(({ owner = {}, name = '' } = {}) => {
        const { login = '' } = owner
        return (login.toLowerCase().includes(this.searchValue) || name.toLowerCase().includes(this.searchValue))
      })
    },
    currentRepoUnlabeledLabels () {
      return this.labels.filter(label => !this.currentRepo._labels.find(({ id }) => id === label.id)).map(({ name }) => name)
    }
  },
  methods: {
    async handleToggleRepo ({ login, repoId, repoName } = {}) {
      this.currentRepo = this.currentLabelRepos.find(({ id }) => id === repoId)
      this.isSelectedRepo = true
      this.isLoadingRepoReadme = true
      this.repoReadme = ''
      const { content } = await getRepoReadme(login, repoName)
      this.repoReadme = await getRenderedReadme(decodeURIComponent(escape(atob(content)))) // 包含中文内容的 base64 解码
      this.isLoadingRepoReadme = false
    },
    handleToggleLabel (id) {
      this.$emit('toggleLabel', id)
    },
    handleChangeSearchValue (searchValue = '') {
      this.searchValue = searchValue.toLowerCase()
    },
    handleAddRepoLabel () {
      this.isInputLabelName = true
      this.$nextTick(() => this.$refs.repoLabelNameInput.$refs.input.focus())
    },
    handleRepoLabelInputBlur () {
      this.isInputLabelName = false
    },
    handleSaveRepoLabel () {
      let message = ''

      const labelName = this.labelName.trim()
      if (!labelName) message = LABEL_NAME_CANNOT_ENPTY

      const { id, _labels } = this.currentRepo
      if (_labels.find(({ name }) => name === labelName)) message = LABEL_NAME_ALREADY_EXIST

      if (message) return this.$notify.warning({ message, showClose: false, position: 'bottom-right' })

      this.$emit('addRepoLabel', { labelName, repoId: id })
      this.labelName = ''
      this.isInputLabelName = false
    },
    handleDeleteRepoLabel (payload) {
      this.$emit('deleteRepoLabel', payload)
    },
    handleFetchLabelSuggestions (inputStr, cb) {
      cb(this.currentRepoUnlabeledLabels.filter(name => name.includes(inputStr)).map(name => ({ value: name })))
    },
    handleSelectRepoLabel ({ value }) {
      this.labelName = value
      this.handleSaveRepoLabel()
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

.repo-title {
  color: #5a5a5a;
}

.repo-label-input {
  width: 95px;
}

.markdown-body {
  overflow: auto;
  height: calc(100% - 85px);
  padding: 20px;
  font-size: 14px;
  color: #5a5a5a;
}

.waiting {
  position: relative;
  top: 30%;
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

.repo-readme__header .repo-label-input .el-input__inner {
  text-align: center;
}
</style>
