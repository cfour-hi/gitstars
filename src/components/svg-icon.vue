<template>
  <svg aria-hidden="true" class="svg-icon" :class="[`svg-icon__${name}`]">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const symbolId = computed(() => `#icon-${props.name}`);
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>
