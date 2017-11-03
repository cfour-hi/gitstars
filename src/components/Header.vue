<template>
  <header id="header">
    <h1 class="user-name">{{user.name}}</h1>
    <img :src="user.avatar_url" alt="头像" class="user-avatar">
    <label class="search-label">
      <input v-model="searchValue" type="text" class="search-input" placeholder="开发者 | 仓库名" @input="handleChangeSearchValue">
      <i class="fa fa-search" aria-hidden="true"></i>
    </label>
  </header>
</template>

<script>
export default {
  name: 'header',
  props: {
    user: { type: Object, default: {} }
  },
  data () {
    return {
      searchValue: ''
    }
  },
  methods: {
    handleChangeSearchValue () {
      this.$emit('changeSearchValue', this.searchValue)
    }
  }
}
</script>

<style scoped>
#header {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  flex: 0 0 70px;
  padding: 0 15px;
  border-bottom: 1px solid #e9e9e9;
}

.search-label {
  display: flex;
  flex: auto;
  position: relative;
  align-items: center;
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
  top: 7px;
  left: 12px;
  color: #d9d9d9;
}

.user-avatar {
  flex: none;
  height: 40px;
  margin: 0 10px;
  border-radius: 50%;
}

.user-name {
  flex: none;
  font-size: 20px;
  text-align: center;
  color: #7265e6;
}
</style>
