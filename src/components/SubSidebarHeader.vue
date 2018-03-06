<template>
  <header id="subsidebar-header">
    <label class="search-label">
      <i class="fa fa-search" aria-hidden="true"></i>
      <input
        :value="searchValue"
        :placeholder="`${$t('developer')} | ${$t('repositoryName')} @${activeTag.i18nKey ? $t(activeTag.i18nKey) : activeTag.name}`"
        type="text"
        class="search-input"
        @input="handleInputSearchValue" />
    </label>
    <el-dropdown class="sort-drapdown" @command="handleSortRepos">
      <div class="sort-drapdown-link">{{ $t('sort') }}&nbsp;<i class="el-icon-arrow-down"></i></div>
      <el-dropdown-menu slot="dropdown" id="subsidebar-header__dropdown-menu">
        <el-dropdown-item v-for="sort in repoSorts" :key="sort.id" :command="sort.sortKey">
          <i :class="sort.icon" class="fa" aria-hidden="true"></i>
          <span class="subsidebar-header__dropdown-menu--text">{{ $t(sort.i18nKey) }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </header>
</template>

<script>
import { mapState } from 'vuex'
import appConfig from '../config'

export default {
  name: 'sub-sidebar-header',
  props: {
    searchValue: { type: String, default: '' },
  },
  data () {
    return {
      repoSorts: appConfig.repoSorts,
    }
  },
  computed: {
    ...mapState('tag', { activeTag: 'active' }),
  },
  methods: {
    handleInputSearchValue (event) {
      this.$emit('update:searchValue', event.target.value.toLowerCase())
    },
    handleSortRepos (key) {
      this.$emit('onSwitchRepoSort', key)
    },
  },
}
</script>

<style scoped>
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
  text-transform: uppercase;
}

#subsidebar-header__dropdown-menu {
  padding: 5px 0;
  margin-top: 0;
}

.el-dropdown-menu {
  padding: 5px 0;
  margin-top: -5px;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  width: 50px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 2;
}

.el-dropdown-menu__item .fa {
  flex: 0 0 16px;
}

.subsidebar-header__dropdown-menu--text {
  flex: auto;
  text-align: center;
  text-align-last: justify;
  letter-spacing: 2px;
  text-transform: uppercase;
}
</style>
