<template>
  <header class="nav-caption">
    <h3 class="nav-caption__title">
      <i class="fa fa-fw fa-tags" aria-hidden="true"></i>
      <span>{{ $t('tags').toUpperCase() }}</span>
    </h3>
    <transition name="slide-to-left">
      <div v-show="activeTagCategory.id === tagCategorys.custom.id" class="nav-caption__operate">
        <div :class="{ disabled: isEditingTags || tagNameFormVisible }" class="nav-caption__operate-btn" @click="handleAddNewTag">
          <span><i class="fa fa-plus-square" aria-hidden="true"></i>{{ $t('add') }}</span>
        </div>
        <transition-group name="enlarge" tag="div" class="nav-caption__group--edit-ok">
          <div
            v-show="isEditingTags"
            key="ok"
            class="nav-caption__operate-btn nav-caption__ok-btn"
            @click="handleEditTagsComplete">
            <span>{{ $t('ok').toUpperCase() }}</span>
          </div>
          <div
            v-show="!isEditingTags"
            :class="{ disabled: tagNameFormVisible || !customTags.length }"
            key="edit"
            class="nav-caption__operate-btn"
            @click="handleEditTags">
            <span><i class="fa fa-cog" aria-hidden="true"></i>{{ $t('edit.default') }}</span>
          </div>
        </transition-group>
      </div>
    </transition>
  </header>
</template>

<script>
import config from '../config'
import { mapState } from 'vuex'

export default {
  name: 'TagNavHeader',
  props: {
    activeTagCategory: { type: Object, required: true },
    tagNameFormVisible: { type: Boolean, default: false },
    isEditingTags: { type: Boolean, default: false }
  },
  data () {
    return {
      tagCategorys: config.tagCategorys
    }
  },
  computed: {
    ...mapState(['customTags'])
  },
  methods: {
    handleAddNewTag () {
      if (this.isEditingTags || this.tagNameFormVisible) return
      this.$emit('onToggleTagNameFormVisible')
    },
    handleEditTags () {
      if (this.tagNameFormVisible || !this.customTags.length) return
      this.$emit('onEditTags')
    },
    handleEditTagsComplete () {

    }
  }
}
</script>

<style scoped>
.nav-caption {
  display: flex;
  justify-content: space-between;
  flex: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  transition: all 0.3s;
}

.nav-caption__title {
  flex: auto;
  font-size: 14px;
  padding-left: 1em;
  color: #919191;
}

.nav-caption__operate {
  display: flex;
  flex: 0 0 140px;
}

.nav-caption__group--edit-ok {
  display: flex;
  flex: auto;
}

.nav-caption__operate-btn {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 0 0 49px;
  padding: 0 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  text-transform: capitalize;
  cursor: pointer;
  user-select: none;
}

.nav-caption__operate-btn .fa {
  margin-right: 3px;
}

.nav-caption__operate-btn.disabled {
  color: #919191;
  cursor: default;
}

.nav-caption__operate-btn.disabled:hover {
  background-color: transparent;
}

.nav-caption__ok-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-caption__ok-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-caption__ok-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
