<template>
  <div id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank" rel="noopener noreferrer">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <tags-nav :tags="defaultTags" class="default-tags" />
    <div class="tag-nav">
      <tag-nav-header
        :customTags="customTags"
        :tagCategorys="tagCategorys"
        :activeTagCategory="activeTagCategory"
        :tagNameFormVisible.sync="tagNameFormVisible"
      />
      <transition name="slide-down">
        <new-tag-name-form v-show="tagNameFormVisible" :visible.sync="tagNameFormVisible" />
      </transition>
      <transition name="slide-down">
        <div v-show="isEditingTags" class="edit-tag-tip">{{ $t('tips.editTag') }}</div>
      </transition>
      <div class="tag-list__group">
        <transition name="slide-to-left">
          <draggable
            v-show="activeTagCategory.id === tagCategorys.custom.id"
            :list="customTags"
            :options="dragOptions"
            :class="{ edit: isEditingTags }"
            class="custom-tags">
            <transition-group name="tag-list" tag="ul" class="nav-tags">
              <TagNav v-for="tag of customTags" :key="tag.id" :tag="tag" editable />
            </transition-group>
          </draggable>
        </transition>
        <transition name="slide-to-right">
          <tags-nav
            v-show="activeTagCategory.id === tagCategorys.language.id"
            :tags="languageTags"
            class="language-tags"
          />
        </transition>
      </div>
      <transition name="slide-up">
        <tag-categorys
          v-show="!isEditingTags && !tagNameFormVisible"
          :categorys="Object.values(tagCategorys)"
          :activeTagCategory.sync="activeTagCategory"
        />
      </transition>
      <footer class="sidebar-footer">
        <span>Author&nbsp;:&nbsp;</span>
        <h1 class="author"><a href="https://github.com/Monine" target="_blank" class="author-name">Monine</a></h1>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Draggable from 'vuedraggable'
import TagsNav from './TagsNav'
import TagNav from './TagNav'
import TagNavHeader from './TagNavHeader'
import NewTagNameForm from './NewTagNameForm'
import TagCategorys from './TagCategorys'
import appConfig from '../config'

export default {
  name: 'Sidebar',
  components: { Draggable, TagNav, TagsNav, TagNavHeader, NewTagNameForm, TagCategorys },
  props: {
    defaultTags: { type: Array, required: true },
    languageTags: { type: Array, required: true },
  },
  data () {
    const { tagCategorys } = appConfig
    return {
      tagCategorys,
      activeTagCategory: tagCategorys.custom,
      tagNameFormVisible: false,
    }
  },
  computed: {
    ...mapState(['isEditingTags']),
    customTags: {
      get () {
        return this.$store.state.customTags
      },
      set (value) {
        this.$store.commit('initCustomTags', value)
      },
    },
    dragOptions () {
      return { disabled: !this.isEditingTags }
    },
  },
}
</script>

<style scoped>
#sidebar {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 0 0 250px;
  height: 100%;
  color: #d9d9d9;
  background-color: #28343d;
}

@media (min-width: 1500px) {
  #sidebar {
    flex: 0 0 290px;
  }
}

.app-name-img {
  width: 100%;
  padding: 10px 0;
}

.default-tags {
  display: flex;
  flex-direction: column;
  flex: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tag-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: auto;
}

.edit-tag-tip {
  overflow: hidden;
  height: 24px;
  font-size: 12px;
  line-height: 2;
  text-align: center;
  color: #919191;
  background-color: rgba(255, 255, 255, 0.1);
}

.tag-list__group {
  overflow-y: auto;
  overflow-x: hidden;
  flex: auto;
  position: relative;
}

.nav-tags {
  padding-left: 0;
  margin: 0;
  list-style: none;
}

.language-tags,
.custom-tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.tag-list-enter,
.tag-list-leave-active {
  transform: translateX(-100%);
}

.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s;
}

.sidebar-footer {
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 29px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  text-align: center;
  font-weight: 700;
  color: #919191;
  background-color: #28343d;
}

.author {
  font-size: inherit;
}

.author-name {
  color: inherit;
}
</style>
