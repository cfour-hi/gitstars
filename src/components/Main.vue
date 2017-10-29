<template>
  <main class="main">
    <layout-header @changeSearchValue="handleChangeSearchValue"></layout-header>
    <div class="content-wrap">
      <sub-sidebar :starred-repos="filteredRepos" :loaded-starred-repos="loadedStarredRepos" @toggleRepo="handleToggleRepo"></sub-sidebar>
      <div class="content">
        <article v-show="repoReadme" v-html="repoReadme" class="markdown-body"></article>
        <div v-show="!repoReadme" class="waiting vc-p">
          <div class="readme">README.md</div>
          <p class="loading">
            <i v-if="loadingRepoReadme" class="fa fa-cog fa-spin fa-2x fa-fw"></i>
            <span v-else>点击左侧 star 查看</span>
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
    starredRepos: {
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
      loadingRepoReadme: false
    }
  },
  computed: {
    filteredRepos () {
      return this.starredRepos.filter(repo => (repo.owner.login.toLowerCase().includes(this.searchValue) || repo.name.toLowerCase().includes(this.searchValue)))
    }
  },
  methods: {
    async handleToggleRepo (repo) {
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
  overflow: auto;
  position: absolute;
  left: 400px;
  right: 0;
  height: 100%;
}

.markdown-body {
  padding: 20px;
  font-size: 14px;
  color: #5a5a5a;
}

.waiting {
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
