<template>
  <nav id="subsidebar">
    <template v-if="loadStarredReposCompleted">
      <header id="subsidebar-header">
        <label class="search-label">
          <i class="fa fa-search" aria-hidden="true"></i>
          <input
            v-model="searchValue"
            :placeholder="`${$t('developer')} | ${$t('repositoryName')} @${currentTag.i18nKey ? $t(currentTag.i18nKey) : currentTag.name}`"
            type="text"
            class="search-input"
            @input="handleChangeSearchValue">
        </label>
        <el-dropdown :show-timeout="0" :hide-timeout="0" class="sort-drapdown" @command="handleSortRepos">
          <div class="sort-drapdown-link">排序&nbsp;<i class="el-icon-arrow-down"></i></div>
          <el-dropdown-menu slot="dropdown" id="subsidebar-header__dropdown-menu">
            <el-dropdown-item v-for="sort in repoSorts" :key="sort.id" :command="sort.sortKey">
              <i :class="sort.icon" class="fa" aria-hidden="true"></i>
              <span class="subsidebar-header__dropdown-menu--text">{{ sort.name }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </header>
      <ul v-show="repos.length" class="repo-list">
        <li
          v-for="repo in repos"
          :key="repo.id"
          :class="{ active: repo.id === activeRepoId }"
          class="repo-item"
          @click="handleSwitchRepo(repo)">
          <header>
            <h3 class="repo-title">
              <a :href="repo.html_url" target="_blank">{{ repo.owner.login }} / {{ repo.name }}</a>
              <a v-show="repo.homepage" :href="repo.homepage" target="_blank">
                <i class="fa fa-fw fa-lg fa-home" aria-hidden="true"></i>
              </a>
            </h3>
          </header>
          <p class="repo-desc">{{ repo.description }}</p>
          <ul class="tag-list">
            <li
              v-for="tag of repo._tags.custom"
              :key="tag.id"
              class="tag-item"
              @click.stop="handleSwitchTag(tag)">
              <el-tag size="small">
                {{ tag.name }}
                <el-popover :title="`${$t('areYouSure')}？`" placement="right">
                  <i slot="reference" class="el-tag__close el-icon-close tag-delete-btn" @click.stop="handleDeleteTag"></i>
                  <footer class="popover-footer">
                    <el-button size="mini" @click="handleCancelDeleteTag">{{ $t('no') }}</el-button>
                    <el-button type="primary" size="mini" @click="handleConfirmDeleteTag(repo.id, tag.id)">
                      {{ $t('yes') }}
                    </el-button>
                  </footer>
                </el-popover>
              </el-tag>
            </li>
          </ul>
          <footer class="repo-footer">
            <span class="repo-star"><i class="fa fa-star" aria-hidden="true"></i>{{ repo.stargazers_count }}</span>
            <span class="repo-fork"><i class="fa fa-code-fork" aria-hidden="true"></i>{{ repo.forks_count }}</span>
            <span class="repo-language">{{ repo.language }}</span>
          </footer>
        </li>
      </ul>
      <div v-show="!repos.length" class="no-match vc-p">
        <i class="fa fa-bell-o fa-3x" aria-hidden="true"></i>
        <p class="ttc">{{ $t('noMatchingReposigory') }}</p>
        <p>
          <i class="fa fa-hand-o-left fa-lg" aria-hidden="true"></i>
          <span>{{ $t('switchTagOrAdjustSearch') }}</span>
          <i class="fa fa-hand-o-up fa-lg" aria-hidden="true"></i>
        </p>
      </div>
    </template>
    <div v-else class="loader vc-p">
      <i class="fa fa-cog fa-spin fa-2x"></i>
      <p class="ttc">{{ $t('gettingStarredRepository') }}</p>
    </div>
  </nav>
</template>

<script>
import config from '../config'

export default {
  name: 'sub-sidebar',
  props: {
    repos: { required: true, type: Array },
    loadStarredReposCompleted: { required: true, type: Boolean },
    currentTag: { required: true, type: Object },
    tagCategorys: { required: true, type: Object }
  },
  data () {
    return {
      repoSorts: config.repoSorts,
      activeRepoId: 0,
      searchValue: ''
    }
  },
  methods: {
    handleChangeSearchValue () {
      this.$emit('changeSearchValue', this.searchValue)
    },
    handleSwitchRepo (repo) {
      const { id } = repo
      if (this.activeRepoId === id) return

      this.activeRepoId = id
      this.$emit('switchRepo', repo)
    },
    handleSwitchTag (tag) {
      this.$emit('switchTag', { tag, category: this.tagCategorys.custom })
    },
    handleDeleteTag () {
      document.body.click()
    },
    handleConfirmDeleteTag (repoId, tagId) {
      this.$emit('deleteRepoTag', { repoId, tagId })
      document.body.click()
    },
    handleCancelDeleteTag () {
      document.body.click()
    },
    handleSortRepos (key) {
      this.$emit('switchRepoSort', key)
    }
  }
}
</script>

<style scoped>
#subsidebar {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 359px;
  height: 100%;
  border-right: 1px solid #e9e9e9;
  background-color: #fbfbfb;
}

@media (min-width: 1500px) {
  #subsidebar {
    width: 409px;
  }
}

#subsidebar-header {
  display: flex;
  flex: 0 0 44px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-label {
  position: relative;
  display: flex;
  flex: auto;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  padding-right: 3px;
}

.search-input {
  width: 100%;
  height: 30px;
  padding: 0 12px 0 33px;
  border: 1px solid #d9d9d9;
  border-radius: 15px;
  font-size: 12px;
  color: #5a5a5a;
  outline: none;
  background-color: #fcfcfc;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.fa-search {
  position: absolute;
  left: 22px;
  color: #d9d9d9;
}

.sort-drapdown {
  flex: 0 0 50px;
  font-size: 12px;
  cursor: pointer;
}

.sort-drapdown-link {
  line-height: 44px;
  text-align: center;
}

.repo-list {
  overflow: auto;
  flex: auto;
  padding: 0;
  margin: 0;
  list-style: none;
}

.repo-list::-webkit-scrollbar-thumb {
  background-color: #e9e9e9;
}

.repo-item {
  padding: 15px;
  border-bottom: 1px solid #e9e9e9;
  cursor: pointer;
  background-color: #fff;
}

.repo-item:hover {
  background-color: #fbfbfb;
}

.repo-item.active {
  background-color: #f7f7f7;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.repo-item:last-child {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.repo-title {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 16px;
  color: #948aec;
}

.repo-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #5a5a5a;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  font-size: 12px;
  list-style: none;
  color: #fff;
}

.tag-item {
  position: relative;
  margin-bottom: 0.3em;
  margin-right: 0.5em;
}

.tag-delete-btn {
  margin-left: -7px;
  line-height: 19px;
  cursor: pointer;
}

.tag-delete-btn:hover {
  font-size: 13px;
}

.repo-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
  font-size: 12px;
  font-weight: 700;
  color: #76d0a3;
}

.repo-footer .fa {
  margin-right: 5px;
}

.repo-fork {
  margin-left: 15px;
}

.repo-language {
  flex: auto;
  text-align: right;
}

.loader,
.no-match {
  top: 40%;
  width: 100%;
  font-size: 14px;
  text-align: center;
  color: #bfbfbf;
}
</style>
