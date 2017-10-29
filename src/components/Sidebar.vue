<template>
  <aside class="sidebar">
    <div class="user-info">
      <img :src="user.avatar_url" alt="" class="user-avatar">
      <h2 class="user-name">{{user.name}}</h2>
    </div>
    <ol class="nav-list">
      <li v-for="nav in navStar" :key="nav.name" class="nav-item">
        <span class="nav-label">{{nav.name}}</span>
        <span class="nav-badge">{{nav.number}}</span>
      </li>
    </ol>
    <div class="nav-caption">
      <span>标签</span>
      <div class="add-label-btn">
        <i class="fa fa-plus-square" aria-hidden="true"></i>
        <span>添加</span>
      </div>
    </div>
  </aside>
</template>

<script>
import { getUserInfo } from '../api'

export default {
  name: 'sidebar',
  props: {
    staredReposLen: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      user: {},
      navStar: [
        {
          name: '所有 star',
          number: this.staredReposLen
        },
        {
          name: '未标签 star',
          number: 0
        }
      ]
    }
  },
  created () {
    getUserInfo().then(response => {
      this.user = response
    })
  }
}
</script>

<style scoped>
.sidebar {
  flex: 0 0 280px;
  color: #d9d9d9;
  background-color: rgb(45, 63, 76);
}

.user-info {
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border: 5px solid #fff;
  margin: 15px auto 0;
  border-radius: 50%;
  cursor: pointer;
}

.user-name {
  font-size: 24px;
  margin-top: 10px;
}

.nav-list {
  padding-left: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
  cursor: pointer;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.nav-item:hover,
.add-label-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-badge {
  width: 30px;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;
  font-size: 12px;
}

.add-label-btn {
  line-height: 40px;
  padding: 0 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
</style>
