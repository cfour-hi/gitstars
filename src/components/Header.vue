<template>
  <header id="header">
    <a :href="user.html_url" target="_blank"><img :src="user.avatar_url" class="user-avatar"></a>
    <h1 class="user-name"><a :href="user.html_url + '?tab=repositories'" target="_blank">{{user.name}}’s Starred Repositories</a></h1>
  </header>
</template>

<script>
export default {
  name: 'header',
  props: {
    user: { type: Object, default: {} }
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
#header {
  display: flex;
  align-items: center;
  flex: 0 0 60px;
  padding: 0 15px;
  border-bottom: 1px solid #e9e9e9;
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
