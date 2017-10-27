<template>
  <aside class="sub-sidebar">
    <ol class="repo-list">
      <li v-for="repo in starredRepos" :key="repo.id" :class="{ active: repo.id === activeRepoId }" class="repo-item" @click="handleToggleRepo(repo)">
        <h3 class="repo-title">
          <a :href="repo.html_url" target="_blank">{{repo.owner.login}} / {{repo.name}}</a>
        </h3>
        <p class="repo-desc">{{repo.description}}</p>
        <div class="repo-footer">
          <span><i class="fa fa-star" aria-hidden="true"></i>{{repo.stargazers_count}}</span>
          <span><i class="fa fa-code-fork" aria-hidden="true"></i>{{repo.forks_count}}</span>
        </div>
      </li>
    </ol>
  </aside>
</template>

<script>
export default {
  name: 'sub-sidebar',
  props: {
    starredRepos: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      activeRepoId: ''
    }
  },
  methods: {
    handleToggleRepo ({ id, owner, name }) {
      this.activeRepoId = id
      const { login } = owner
      this.$emit('toggleRepo', { login, name })
    }
  }
}
</script>

<style scoped>
.sub-sidebar {
  overflow: auto;
  flex: 0 0 399px;
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
  margin: 0 0 10px;
  font-size: 16px;
  color: #948aec;
}

.repo-desc {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #5a5a5a;
}

.repo-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #76d0a3;
}

.repo-footer .fa {
  margin-right: 5px;
}
</style>
