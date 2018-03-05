<template>
  <ul class="nav-tags">
    <tag-nav-wrap v-for="tag of tags" :key="tag.id" :tag="tag">
      <div class="nav-item__label slo">
        <i :class="`${tag.icon || 'fa-tag'}`" class="fa fa-fw" aria-hidden="true"></i>
        <span>{{ tag.name || $t(tag.i18nKey) }}</span>
      </div>
    </tag-nav-wrap>
  </ul>
</template>

<script>
import TagNavWrap from './TagNavWrap'

export default {
  name: 'tags-nav',
  components: { TagNavWrap },
  props: {
    tags: { type: Array, required: true },
  },
}
</script>
