<template>
  <div id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank" rel="noopener noreferrer">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <tags-nav :tags="defaultTags" class="default-tags"></tags-nav>
    <div class="tag-nav">
      <tag-nav-header
        :activeTagCategory="activeTagCategory"
        :tagNameFormVisible="tagNameFormVisible"
        :isEditingTags="isEditingTags"
        @onToggleTagNameFormVisible="handleToggleTagNameFormVisible"
        @onEditTags="handleEditTags"
        @onEditTagsComplete="handleEditTagsComplete"
      ></tag-nav-header>
      <new-tag-name-form
        :visible="tagNameFormVisible"
        @onToggleTagNameFormVisible="handleToggleTagNameFormVisible"
      ></new-tag-name-form>
      <transition name="slide-down">
        <div v-show="isEditingTags" class="edit-tag-tip">{{ $t('tips.editTag') }}</div>
      </transition>
      <div class="tag-list__group">
        <tags-nav
          v-show="activeTagCategory.id === tagCategorys.custom.id"
          :tags="customTags"
          class="custom-tags"
        ></tags-nav>
        <tags-nav
          v-show="activeTagCategory.id === tagCategorys.language.id"
          :tags="languageTags"
          class="language-tags"
        ></tags-nav>
      </div>
      <transition name="slide-up">
        <tag-categorys
          :visible="!isEditingTags && !tagNameFormVisible"
          :categorys="Object.values(tagCategorys)"
          :activeCategory="activeTagCategory"
          @onSwitchTagCategory="handleSwitchTagCategory"
        ></tag-categorys>
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
import TagsNav from './TagsNav'
import TagNavHeader from './TagNavHeader'
import NewTagNameForm from './NewTagNameForm'
import tagCategorys from './TagCategorys'
import config from '../config'

// let customTagsClone = null

export default {
  name: 'Sidebar',
  components: {
    TagsNav,
    TagNavHeader,
    NewTagNameForm,
    tagCategorys
  },
  props: {
    defaultTags: { type: Array, required: true },
    languageTags: { type: Array, required: true }
  },
  data () {
    return {
      tagCategorys: config.tagCategorys,
      activeTagCategory: config.tagCategorys.custom,
      tagNameFormVisible: false,
      isEditingTags: false
    }
  },
  computed: {
    ...mapState(['customTags'])
  },
  methods: {
    handleToggleTagNameFormVisible () {
      this.tagNameFormVisible = !this.tagNameFormVisible
      // this.$nextTick(() => this.$refs.tagFormNameInput.focus())
    },
    handleEditTags () {
      this.isEditingTags = true
      // customTagsClone = this.customTags
    },
    handleEditTagsComplete () {
      this.isEditingTags = false

      // let isChanged = false
      // for (const [index, { id, name }] of customTagsClone.entries()) {
      //   const tag = this.customTags[index]
      //   if (!tag || id !== tag.id || name !== tag.name) {
      //     isChanged = true
      //     break
      //   }
      // }
      // if (!isChanged) return

      // const tags = this.dragTags.map(({ id, name, repos }) => ({ id, name, repos }))
      // this.$emit('completeEditTags', tags)
    },
    handleSwitchTagCategory (category) {
      this.activeTagCategory = category
    }
  }
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

.tag-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: auto;
}

.tag-list__group {
  overflow-y: auto;
  overflow-x: hidden;
  flex: auto;
  position: relative;
}

.tag-list__group .tag-list,
.tag-list__group .draggable-tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
