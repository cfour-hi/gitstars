<template>
  <main class="main">
    <layout-header @changeSearchValue="handleChangeSearchValue"></layout-header>
    <div class="content-wrap">
      <sub-sidebar :starred-repos="filteredRepos" :loaded-starred-repos="loadedStarredRepos" @toggleRepo="handleToggleRepo"></sub-sidebar>
      <div class="content">
        <div v-show="repoReadme" class="detail">
          <div class="detail-header"></div>
          <div class="article-wrap">
            <article v-html="repoReadme" class="markdown-body"></article>
          </div>
        </div>
        <div v-show="!repoReadme" class="waiting">
          <div class="readme">README.md</div>
          <p class="loading">
            <i v-show="loadingRepoReadme" class="fa fa-cog fa-spin fa-2x fa-fw"></i>
            <span v-if="!clickedRepo">点击左侧 starred 仓库查看</span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import LayoutHeader from './Header'
import SubSidebar from './SubSidebar'

import { getRepoReadme, getRenderedReadme } from '../api'

export default {
  name: 'main',
  components: { LayoutHeader, SubSidebar },
  props: {
    labelRepos: {
      type: Array,
      default: []
    },
    loadedStarredRepos: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      repoReadme: '',
      searchValue: '',
      loadingRepoReadme: false,
      clickedRepo: false
    }
  },
  computed: {
    filteredRepos () {
      const { labelRepos = [], searchValue = '' } = this
      return labelRepos.filter(({ owner = {}, name = '' } = {}) => {
        const { login = '' } = owner
        return (login.toLowerCase().includes(searchValue) || name.toLowerCase().includes(searchValue))
      })
    }
  },
  methods: {
    async handleToggleRepo (repo) {
      this.clickedRepo = true
      this.loadingRepoReadme = true
      this.repoReadme = ''
      const { content } = await getRepoReadme(repo)
      this.repoReadme = await getRenderedReadme(decodeURIComponent(escape(atob(content))))
      this.loadingRepoReadme = false
    },
    handleChangeSearchValue (searchValue) {
      this.searchValue = searchValue.toLowerCase()
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  flex: auto;
}

.content-wrap {
  flex: auto;
  position: relative;
}

.content {
  position: absolute;
  left: 400px;
  right: 0;
  height: 100%;
}

.detail {
  height: 100%;
}

.detail-header {
  height: 44px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .05);
}

.article-wrap {
  overflow: auto;
  height: calc(100% - 45px);
}

.markdown-body {
  overflow: auto;
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
}

.readme {
  font-size: 30px;
  font-weight: 700;
}

.loading {
  height: 28px;
}
</style>

<style>
.markdown-body a:hover {
  color: #0366d6;
  text-decoration: none;
}
</style>
