<template>
  <form class="tag-form" onsubmit="return false">
    <input
      v-model="name"
      :class="inputState"
      :placeholder="`${$t('tagName')}`"
      ref="nameInput"
      type="text"
      class="tag-form__input--name"
      @input="handleInputTagName"
      @focus="handleFocusTagName"
      @blur="handleBlurTagName"
      @keyup.enter.prevent="handleAddTag"
      @keyup.esc="handleCancelAddTag">
      <div class="tag-form__operate" :class="btnState">
        <button type="button" class="tag-form__operate-btn save" @click="handleAddTag">{{ $t('save') }}</button>
        <button type="button" class="tag-form__operate-btn cancel" @click="handleCancelAddTag">{{ $t('cancel') }}</button>
      </div>
  </form>
</template>

<script>
const SAVE = 'save'
const CANCEL = 'cancel'
const FOCUS = 'focus'
const BLUR = 'blur'

export default {
  name: 'new-tag-name-form',
  props: {
    visible: { type: Boolean, default: false },
  },
  data () {
    return {
      name: '',
      inputState: FOCUS,
      btnState: CANCEL,
    }
  },
  watch: {
    visible (newValue) {
      if (newValue) this.$refs.nameInput.focus()
    },
  },
  methods: {
    handleInputTagName () {
      this.btnState = this.name.trim().length ? SAVE : CANCEL
    },
    handleFocusTagName () {
      this.inputState = FOCUS
    },
    handleBlurTagName () {
      this.inputState = BLUR
    },
    handleAddTag () {
      this.$store.dispatch('tag/addTag', this.name.trim())
        .then(() => this.handleCancelAddTag())
        .catch(() => this.$refs.nameInput.focus())
    },
    handleCancelAddTag () {
      this.btnState = CANCEL
      this.name = ''
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style scoped>
.tag-form {
  display: flex;
  flex: none;
  height: 38px;
  font-size: 12px;
}

.tag-form__input--name {
  flex: auto;
  box-sizing: border-box;
  padding: 0 15px;
  border: none;
  line-height: 1.5;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tag-form__input--name:focus {
  color: #28343d;
  background-color: #fff;
}

.tag-form__input--name.blur {
  color: #d9d9d9;
}

.tag-form__operate {
  flex: 0 0 70px;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.tag-form__operate-btn {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  text-align: center;
  text-transform: uppercase;
  color: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease-out 0.1s;
}

.tag-form__operate-btn.save {
  background-color: #3dbd7d;
}

.tag-form__operate-btn.save:active {
  background-color: #39b175;
}

.tag-form__operate.save .save {
  margin-left: 0;
}

.tag-form__operate.save .cancel {
  margin-left: 100%;
}

.tag-form__operate-btn.cancel {
  background-color: #697178;
}

.tag-form__operate-btn.cancel:active {
  background-color: #616970;
}

.tag-form__operate.cancel .save {
  margin-left: -100%;
}

.tag-form__operate.cancel .cancel {
  margin-left: 0;
}
</style>
