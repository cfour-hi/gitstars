<template>
  <div class="flex items-center justify-between font-bold text-[#948aec]">
    <h2>
      <span
        v-if="medalMap[repository.ranking]"
        v-html="medalMap[repository.ranking]"
        class="mr-1"
      ></span>
      <a
        :href="`https://github.com/${repository.owner.login}/${repository.name}`"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        {{ repository.owner.login }} / {{ repository.name }}
      </a>
      <svg-icon name="share" class="ml-1 text-xs" />
    </h2>

    <a
      v-if="repository.homepage"
      :href="repository.homepage"
      class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#948aec] hover:text-white"
      rel="noopener noreferrer"
    >
      <svg-icon name="link" />
    </a>
  </div>

  <ul
    class="flex flex-wrap text-xs text-gray-300"
    :class="{ disabled: disableTopic }"
    @click="handleClickTopic"
  >
    <li
      v-for="topic in repository.topics"
      :key="topic"
      :data-topic="topic"
      :class="{
        'selected-tag':
          !disableTopic &&
          tagStore.selectedTagType === TAG_TYPE.topic &&
          tagStore.selectedTag === topic,
      }"
      class="tag-topic mr-1 mt-1 rounded-full border border-solid border-gray-300 px-2 hover:border-[#948aec] hover:bg-[#948aec] hover:!text-white"
    >
      {{ topic }}
    </li>
  </ul>

  <div class="my-3 text-xs text-[#666]">{{ repository.description }}</div>

  <div class="flex justify-between text-xs font-bold text-[#76d0a3]">
    <div>
      <span class="inline-flex items-center">
        <svg-icon name="star-fill" class="mr-1" />
        <span>{{ repository.stargazers_count }}</span>
      </span>

      <span class="ml-3 inline-flex items-center">
        <svg-icon name="branch" class="mr-1" />
        <span>{{ repository.forks_count }}</span>
      </span>
    </div>

    <span>{{ repository.language }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTagStore } from '@/store/tag';
import { TAG_SRC, TAG_TYPE } from '@/constants';

defineProps({
  repository: {
    type: Object,
    required: true,
  },
});

const medalMap = {
  1: '&#129351;',
  2: '&#129352;',
  3: '&#129353;',
};
const tagStore = useTagStore();
const disableTopic = computed(() => tagStore.tagSrc !== TAG_SRC.self);

function handleClickTopic(e) {
  if (disableTopic.value) return;

  let elTag = e.target;
  while (!elTag.dataset.topic) {
    elTag = elTag.parentElement;
    if (!elTag) return;
  }
  tagStore.$patch({
    selectedTagTypeNav: TAG_TYPE.topic,
    selectedTagType: TAG_TYPE.topic,
    selectedTag: elTag.dataset.topic,
  });
}
</script>

<style scoped>
.selected-tag {
  border-color: var(--primary);
  color: var(--primary);
}

.disabled .tag-topic {
  cursor: not-allowed;
}
</style>
