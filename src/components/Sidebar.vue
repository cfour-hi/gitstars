<template>
  <div id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank" rel="noopener noreferrer">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <TagsNav :tags="defaultTags" :isEditingTags="isEditingTags" class="default-tags" />
    <div class="tag-nav">
      <TagNavHeader
        :activeTagCategory="activeTagCategory"
        :tagNameFormVisible="tagNameFormVisible"
        :isEditingTags.sync="isEditingTags"
        @onToggleTagNameFormVisible="handleToggleTagNameFormVisible"
        @onEditTagsComplete="handleEditTagsComplete"
      />
      <NewTagNameForm
        :visible="tagNameFormVisible"
        @onToggleTagNameFormVisible="handleToggleTagNameFormVisible"
      />
      <transition name="slide-down">
        <div v-show="isEditingTags" class="edit-tag-tip">{{ $t('tips.editTag') }}</div>
      </transition>
      <div class="tag-list__group">
        <transition name="slide-to-left">
          <Draggable
            v-show="activeTagCategory.id === tagCategorys.custom.id"
            :list="customTags"
            :options="dragOptions"
            :class="{ edit: isEditingTags }"
            class="draggable-tags">
            <transition-group name="tag-list" tag="ul" class="nav-tag tag-list custom-tags">
              <TagNav v-for="tag of customTags" :key="tag.id" :tag="tag" :isEditingTags="isEditingTags" editable />
            </transition-group>
          </Draggable>
        </transition>
        <TagsNav
          v-show="activeTagCategory.id === tagCategorys.language.id"
          :tags="languageTags"
          :isEditingTags="isEditingTags"
          class="language-tags"
        />
      </div>
      <transition name="slide-up">
        <TagCategorys
          :visible="!isEditingTags && !tagNameFormVisible"
          :categorys="Object.values(tagCategorys)"
          :activeTagCategory="activeTagCategory"
          @onSwitchActiveTagCategory="handleSwitchActiveTagCategory"
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
import Draggable from 'vuedraggable'
import TagsNav from './TagsNav'
import TagNav from './TagNav'
import TagNavHeader from './TagNavHeader'
import NewTagNameForm from './NewTagNameForm'
import TagCategorys from './TagCategorys'
import appConfig from '../config'

// let customTagsClone = null

export default {
  name: 'Sidebar',
  components: { Draggable, TagNav, TagsNav, TagNavHeader, NewTagNameForm, TagCategorys },
  props: {
    defaultTags: { type: Array, required: true },
    languageTags: { type: Array, required: true }
  },
  data () {
    const { tagCategorys } = appConfig
    return {
      tagCategorys,
      activeTagCategory: tagCategorys.custom,
      tagNameFormVisible: false,
      isEditingTags: false
    }
  },
  computed: {
    customTags: {
      get () {
        return this.$store.state.customTags
      },
      set (value) {
        this.$store.commit('initCustomTags', value)
      }
    },
    // dragTags () {
    //   return this.$store.state.customTags.map((tag, index) => Object.assign({}, tag, {
    //     _isEdit: false,
    //     _ref: `tagNameEditInput${tag.id}`,
    //     _preName: ''
    //   }))
    // },
    dragOptions () {
      return { disabled: !this.isEditingTags }
    }
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
    handleSwitchActiveTagCategory (category) {
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

.edit-tag-tip {
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

.nav-tag {
  display: flex;
  flex-direction: column;
  flex: none;
  padding-left: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
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
