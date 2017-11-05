<template>
  <nav id="subsidebar">
    <div v-if="loadStarredReposCompleted">
      <ul v-show="repos.length" class="repo-list">
        <li v-for="repo in repos" :key="repo.id" :class="{ active: repo.id === activeRepoId }" class="repo-item" @click="handleToggleRepo(repo)">
          <header>
            <h3 class="repo-title">
              <a :href="repo.html_url" target="_blank">{{repo.owner.login}} / {{repo.name}}</a>
            </h3>
          </header>
          <p class="repo-desc">{{repo.description}}</p>
          <ul v-if="repo._labels && repo._labels.length" class="label-list">
            <li v-for="(label, index) in repo._labels" :key="label" class="label-item" @click.stop="handleToggleLabel(label)">
              <el-tag size="small" closable>{{label}}</el-tag>
              <el-popover placement="right" title="Are you sure?">
                <i slot="reference" class="el-tag__close el-icon-close label-delete-btn" @click.stop="handleDeleteLabel"></i>
                <footer class="popover-footer">
                  <el-button size="mini" @click="handleCancelDeleteLabel">No</el-button>
                  <el-button type="primary" size="mini" @click="handleConfirmDeleteLabel(label, repo.id)">Yes</el-button>
                </footer>
              </el-popover>
            </li>
          </ul>
          <footer class="repo-footer">
            <span><i class="fa fa-star" aria-hidden="true"></i>{{repo.stargazers_count}}</span>
            <span><i class="fa fa-code-fork" aria-hidden="true"></i>{{repo.forks_count}}</span>
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
    </div>
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
    repos: { type: Array, default: [] },
    loadStarredReposCompleted: { type: Boolean, default: false }
  },
  data () {
    return {
      activeRepoId: ''
    }
  },
  methods: {
    handleToggleRepo ({ id, owner, name }) {
      if (this.activeRepoId === id) return
      this.activeRepoId = id
      const { login } = owner
      this.$emit('toggleRepo', { id, login, name })
    },
    handleToggleLabel (name) {
      this.$emit('toggleLabel', name)
    },
    handleDeleteLabel () {
      document.body.click()
    },
    handleConfirmDeleteLabel (name, id) {
      this.$emit('deleteRepoLabel', { id, name })
    },
    handleCancelDeleteLabel () {
      document.body.click()
    }
  }
}
</script>

<style scoped>
#subsidebar {
  overflow: auto;
  position: absolute;
  width: 399px;
  height: 100%;
  border-right: 1px solid #e9e9e9;
  background-color: #fbfbfb;
}

.repo-list {
  padding: 0;
  margin: 0;
  list-style: none;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
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
  vertical-align: middle;
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: #409eff;
  cursor: pointer;
}

.label-delete-btn:hover {
  width: 15px;
  height: 15px;
  color: #fff;
  background-color: #409eff;
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

.loader,
.no-match {
  font-size: 14px;
  text-align: center;
  color: #bfbfbf;
}
</style>
