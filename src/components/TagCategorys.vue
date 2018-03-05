<template>
  <ul class="tag-category">
    <li :style="sliderStyle" class="tag-category__slider"></li>
    <li
      v-for="(category, key) of categorys"
      :key="key"
      :class="{ active: category.id === activeTagCategory.id }"
      class="tag-category__item"
      @click="handleSwitchCategory(category)">
      {{ $t(category.i18nKey) }}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'tag-categorys',
  props: {
    categorys: { type: Array, required: true },
    activeTagCategory: { type: Object, required: true },
  },
  computed: {
    sliderStyle () {
      const slidebarWidth = 100 / this.categorys.length
      const index = this.categorys.findIndex(category => category.id === this.activeTagCategory.id)

      return {
        left: `${index * slidebarWidth}%`,
        width: `${slidebarWidth}%`,
      }
    },
  },
  methods: {
    handleSwitchCategory (category) {
      this.$emit('update:activeTagCategory', category)
    },
  },
}
</script>

<style scoped>
.tag-category {
  display: flex;
  flex: 0 0 29px;
  position: relative;
  padding-left: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
  font-size: 12px;
  line-height: 30px;
  text-align: center;
  list-style: none;
  color: #919191;
  cursor: pointer;
}

.tag-category__slider {
  position: absolute;
  height: 100%;
  border-top: 1px solid #7265e6;
  background-color: rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}

.tag-category__item {
  width: 50%;
  margin: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: capitalize;
}

.tag-category__item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.tag-category__item.active {
  font-size: 14px;
  color: #d9d9d9;
}

.tag-category__item:last-child {
  border-right: none;
}
</style>
