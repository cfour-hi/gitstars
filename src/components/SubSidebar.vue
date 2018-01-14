<template>
  <nav id="subsidebar">
    <template v-if="loadStarredReposCompleted">
      <label class="search-label">
        <i class="fa fa-search" aria-hidden="true"></i>
        <input
          v-model="searchValue"
          :placeholder="`开发者 | 仓库名 @${currentLabel.name}`"
          type="text"
          class="search-input"
          @input="handleChangeSearchValue">
      </label>
      <ul v-show="repos.length" class="repo-list">
        <li
          v-for="repo in repos"
          :key="repo.id"
          :class="{ active: repo.id === activeRepoId }"
          class="repo-item"
          @click="handleToggleRepo(repo)">
          <header>
            <h3 class="repo-title">
              <a :href="repo.html_url" target="_blank">{{ repo.owner.login }} / {{ repo.name }}</a>
              <a v-show="!!repo.homepage" :href="repo.homepage" target="_blank">
                <i class="fa fa-fw fa-lg fa-home" aria-hidden="true"></i>
              </a>
            </h3>
          </header>
          <p class="repo-desc">{{ repo.description }}</p>
          <ul class="label-list">
            <li
              v-for="label of repo._labels.custom"
              :key="label.id"
              class="label-item"
              @click.stop="handleToggleLabel(label)">
              <el-tag size="small">
                {{ label.name }}
                <el-popover placement="right" title="Are you sure?">
                  <i slot="reference" class="el-tag__close el-icon-close label-delete-btn" @click.stop="handleDeleteLabel"></i>
                  <footer class="popover-footer">
                    <el-button size="mini" @click="handleCancelDeleteLabel">No</el-button>
                    <el-button type="primary" size="mini" @click="handleConfirmDeleteLabel(repo.id, label.id)">Yes</el-button>
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
        <p>没有匹配仓库</p>
        <p>
          <i class="fa fa-hand-o-left fa-lg" aria-hidden="true"></i>
          <span>切换标签</span>
          <span>或</span>
          <span>调整搜索</span>
          <i class="fa fa-hand-o-up fa-lg" aria-hidden="true"></i>
        </p>
      </div>
    </template>
    <div v-else class="loader vc-p">
      <i class="fa fa-cog fa-spin fa-2x"></i>
      <p>正在获取 starred 仓库</p>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'sub-sidebar',
  props: {
    repos: { type: Array, default () { return [] } },
    loadStarredReposCompleted: { type: Boolean, default: false },
    currentLabel: { type: Object, default () { return {} } },
    labelCategorys: { required: true, type: Object }
  },
  data () {
    return {
      activeRepoId: 0,
      searchValue: ''
    }
  },
  methods: {
    handleChangeSearchValue () {
      this.$emit('changeSearchValue', this.searchValue)
    },
    handleToggleRepo (repo) {
      const { id } = repo
      if (this.activeRepoId === id) return

      this.activeRepoId = id
      this.$emit('toggleRepo', repo)
    },
    handleToggleLabel (label) {
      this.$emit('toggleLabel', { label, category: this.labelCategorys.custom })
    },
    handleDeleteLabel () {
      document.body.click()
    },
    handleConfirmDeleteLabel (repoId, labelId) {
      this.$emit('deleteRepoLabel', { repoId, labelId })
      document.body.click()
    },
    handleCancelDeleteLabel () {
      document.body.click()
    }
  }
}
</script>

<style scoped>
#subsidebar {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 399px;
  height: 100%;
  border-right: 1px solid #e9e9e9;
  background-color: #fbfbfb;
}

.search-label {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 44px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input {
  width: 320px;
  height: 30px;
  padding: 0 12px 0 34px;
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
  left: 28px;
  color: #d9d9d9;
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

.label-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  font-size: 12px;
  list-style: none;
  color: #fff;
}

.label-item {
  position: relative;
  margin-bottom: 0.3em;
  margin-right: 0.5em;
}

.label-delete-btn {
  margin-left: -7px;
  line-height: 19px;
  cursor: pointer;
}

.label-delete-btn:hover {
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
  font-size: 14px;
  text-align: center;
  color: #bfbfbf;
}
</style>
