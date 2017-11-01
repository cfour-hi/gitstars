<template>
  <aside class="sub-sidebar">
    <ol v-if="loadedStarredRepos" class="repo-list">
      <li v-for="repo in repos" :key="repo.id" :class="{ active: repo.id === activeRepoId }" class="repo-item" @click="handleToggleRepo(repo)">
        <h3 class="repo-title">
          <a :href="repo.html_url" target="_blank">{{repo.owner.login}} / {{repo.name}}</a>
        </h3>
        <p class="repo-desc">{{repo.description}}</p>
        <ul v-if="repo._labels && repo._labels.length" class="repo-label-list">
          <li v-for="(label, index) in repo._labels" :key="label" class="repo-label-item">
            <el-tag size="small" closable>{{label}}</el-tag>
            <el-popover placement="right" title="Are you sure?">
              <i slot="reference" class="el-tag__close el-icon-close delete-btn"></i>
              <div class="popover-footer">
                <el-button size="mini" @click="handleCancelDelete">No</el-button>
                <el-button type="primary" size="mini" @click="handleDeleteLabel(label, repo.id)">Yes</el-button>
              </div>
            </el-popover>
          </li>
        </ul>
        <div class="repo-footer">
          <span><i class="fa fa-star" aria-hidden="true"></i>{{repo.stargazers_count}}</span>
          <span><i class="fa fa-code-fork" aria-hidden="true"></i>{{repo.forks_count}}</span>
        </div>
      </li>
    </ol>
    <div v-else class="loading vc-p">
      <i class="fa fa-cog fa-spin fa-2x fa-fw"></i>
      <p>正在获取 stars</p>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'sub-sidebar',
  props: {
    repos: {
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
    handleDeleteLabel (name, id) {
      this.$emit('deleteLabel', { id, name })
    },
    handleCancelDelete () {
      document.body.click()
    }
  }
}
</script>

<style scoped>
.sub-sidebar {
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
  margin: 0 0 0.8em;
  font-size: 16px;
  color: #948aec;
}

.repo-desc {
  margin: 0.5em 0;
  font-size: 12px;
  line-height: 1.5;
  color: #5a5a5a;
}

.repo-label-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  font-size: 12px;
  list-style: none;
  color: #fff;
}

.repo-label-item {
  position: relative;
  margin-top: .3em;
  margin-right: 0.5em;
}

.delete-btn {
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

.delete-btn:hover {
  width: 15px;
  height: 15px;
  color: #fff;
  background-color: #409eff;
}

.popover-footer {
  display: flex;
  justify-content: flex-end;
}

.repo-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8em;
  font-size: 12px;
  font-weight: 700;
  color: #76d0a3;
}

.repo-footer .fa {
  margin-right: 5px;
}

.loading {
  font-size: 14px;
  text-align: center;
  color: #d9d9d9;
}
</style>
