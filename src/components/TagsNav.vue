<template>
  <ul class="nav-tag">
    <li
      v-for="tag of tags"
      :key="tag.id"
      :class="{ active: tag.id === activeTag.id }"
      class="nav-item"
      @click="handleSwitchTag(tag)">
      <label class="nav-item__label">
        <i :class="`${tag.icon || 'fa-tag'}`" class="fa fa-fw" aria-hidden="true"></i>
        <span>{{ tag.name || $t(tag.i18nKey) }}</span>
      </label>
      <span class="nav-item-badge">{{ tag.repos.length }}</span>
    </li>
  </ul>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TagsNav',
  props: {
    tags: { type: Array, required: true }
  },
  computed: {
    ...mapState(['activeTag'])
  },
  methods: {
    handleSwitchTag (tag) {
      this.$store.commit('changeActiveTag', tag)
    }
  }
}
</script>

<style scoped>
.nav-tag {
  display: flex;
  flex-direction: column;
  flex: none;
  padding-left: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  height: 40px;
  padding: 0 15px;
  border-left: 3px solid transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-caption__operate-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active,
.nav-caption__operate-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  border-left-color: #7265e6;
  border-bottom-color: transparent;
}

.nav-item__label {
  display: flex;
  align-items: center;
  flex: auto;
  padding-right: 10px;
  line-height: 40px;
  cursor: inherit;
}

.nav-item__label .fa {
  flex: 0 0 15px;
  margin-top: 3px;
  margin-right: 5px;
}

.nav-item-badge {
  flex: none;
  padding: 0 0.8em;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
