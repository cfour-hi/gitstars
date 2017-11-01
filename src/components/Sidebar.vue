<template>
  <aside class="sidebar">
    <div class="user-info">
      <img :src="user.avatar_url" alt="" class="user-avatar">
      <h2 class="user-name">{{user.name}}</h2>
    </div>
    <ol class="nav-list">
      <li class="nav-item" @click="handleToggleLabel('_all$')">
        <span class="nav-label">
          <i class="fa fa-fw fa-bars" aria-hidden="true"></i>
          <span>全部</span>
        </span>
        <span class="nav-badge">{{starredReposLen}}</span>
      </li>
      <li class="nav-item" @click="handleToggleLabel('_unlabeled$')">
        <span class="nav-label">
          <i class="fa fa-fw fa-star-o" aria-hidden="true"></i>
          <span>未标签</span>
        </span>
        <span class="nav-badge">{{unlabeledReposLen}}</span>
      </li>
    </ol>
    <div class="nav-caption">
      <span class="title">标签</span>
      <span class="add-label-btn" @click="handleAddNewLabel">
        <i class="fa fa-plus-square" aria-hidden="true"></i>
        <span>添加</span>
      </span>
    </div>
    <transition name="slide-down">
      <div v-show="newLabelVisible" class="new-label">
        <input v-model="labelName" ref="newLabelNameInput" type="text" class="new-label-input" placeholder="标签名称" @input="handleLabelNameInput" @focus="handleLabelNameInput" @blur="handleLabelNameInput" @keyup.enter="handleSaveNewLabel">
        <div class="new-label-operate" :class="operateType" @mouseleave="operateType = ''">
          <button type="button" class="new-label-btn save" @mouseenter="operateType = 'save'" @click="handleSaveNewLabel">SAVE</button>
          <button type="button" class="new-label-btn cancel" @mouseenter="operateType = 'cancel'" @click="newLabelVisible = false">CANCEL</button>
        </div>
      </div>
    </transition>
    <ol class="nav-list label-list">
      <li v-for="(repos, name) in labels" :key="name" class="nav-item" @click="handleToggleLabel(name)">
        <label class="nav-label">
          <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
          <span>{{name}}</span>
        </label>
        <span class="nav-badge">{{repos.length}}</span>
      </li>
    </ol>
  </aside>
</template>

<script>
import { getUserInfo } from '../api'

const SAVE = 'save'
const CANCEL = 'cancel'

export default {
  name: 'sidebar',
  props: {
    starredReposLen: {
      type: Number,
      default: 0
    },
    unlabeledReposLen: {
      type: Number,
      default: 0
    },
    labels: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      user: {},
      newLabelVisible: false,
      operateType: '',
      labelName: ''
    }
  },
  created () {
    getUserInfo().then(response => {
      this.user = response
    })
  },
  methods: {
    handleToggleLabel (name) {
      this.$emit('toggleLabel', name)
    },
    handleAddNewLabel () {
      this.newLabelVisible = true
      this.$nextTick(() => this.$refs.newLabelNameInput.focus())
    },
    handleLabelNameInput () {
      this.operateType = this.labelName.trim().length ? SAVE : CANCEL
    },
    handleSaveNewLabel () {
      const labelName = this.labelName.trim()
      if (!labelName || Object.keys(this.labels).includes(labelName)) return
      this.$emit('saveNewLabel', labelName)
      this.newLabelVisible = false
      this.labelName = ''
    }
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  flex: 0 0 250px;
  color: #d9d9d9;
  background-color: #28343d;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
}

.nav-item:hover,
.add-label-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item:active,
.add-label-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-badge {
  padding: 0 0.8em;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  padding-left: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.nav-caption .title {
  font-size: 14px;
  font-weight: 700;
  color: #919191;
}

.add-label-btn {
  line-height: 40px;
  padding: 0 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.fa-plus-square {
  margin-right: 3px;
}

.new-label {
  display: flex;
  flex: none;
  height: 38px;
  font-size: 12px;
}

.slide-down-enter,
.slide-down-leave-active {
  height: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: height 0.2s ease-out;
}

.new-label-input {
  flex: auto;
  box-sizing: border-box;
  padding: 0 15px;
  border: none;
  line-height: 1.5;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
}

.new-label-input:focus {
  color: #28343d;
  background-color: #fff;
}

.new-label-operate {
  flex: 0 0 72px;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.new-label-btn {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  color: #fff;
  cursor: pointer;
  outline: none;
  transition: margin-left 0.3s ease-out 0.1s,
    background-color 0.3s ease-out 0.1s;
}

.new-label-btn.save {
  margin-left: -50%;
  background-color: #3dbd7d;
}

.new-label-btn.save:active {
  background-color: #39b175;
}

.new-label-operate.save .save {
  margin-left: 0;
}

.new-label-operate.save .cancel {
  margin-left: 100%;
}

.new-label-btn.cancel {
  margin-left: 50%;
  background-color: #697178;
}

.new-label-btn.cancel:active {
  background-color: #616970;
}

.new-label-operate.cancel .save {
  margin-left: -100%;
}

.new-label-operate.cancel .cancel {
  margin-left: 0;
}

.label-list {
  overflow: auto;
  flex: auto;
  border-top: none;
}
</style>
