<template>
  <header class="header">
    <label class="search-label">
      <input type="text" class="search-input" placeholder="仓库名">
      <i class="fa fa-search" aria-hidden="true"></i>
    </label>
  </header>
</template>

<script>
export default {
  name: 'header',
  props: {
    label: {
      type: String,
      default: '所有标签'
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  flex: 0 0 70px;
  padding: 0 15px;
  border-bottom: 1px solid #e9e9e9;
}

.label-name {
  font-size: 22px;
  color: #404040;
}

.search-label {
  display: flex;
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
</style>
