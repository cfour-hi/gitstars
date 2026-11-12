<template>
  <div class="relative flex-auto bg-white" style="width: calc(100% - 24rem)">
    <header
      v-if="selectedRepository"
      class="flex h-9 items-center border-b border-solid border-b-gray-300 px-4"
    >
      <a
        :href="toRepositoryHref(selectedRepository)"
        class="inline-flex items-center hover:underline"
        rel="noopener noreferrer"
        target="_blank"
      >
        <h2 class="text-lg font-bold">
          <svg-icon name="github" class="text-xl" />
          {{ selectedRepository.owner.login }} / {{ selectedRepository.name }}
          <svg-icon name="share" class="text-sm" />
        </h2>
      </a>
    </header>

    <div
      v-show="!selectedRepository || !readme"
      class="relative top-1/3 mx-auto w-60 text-center text-gray-300"
    >
      <p class="mb-2 text-3xl font-bold">README.md</p>
      <template v-if="readmeStatus === 'error'">
        <p class="text-sm">{{ $t('readmeLoadFailed') }}</p>
        <button class="mt-3 text-xs underline" @click="retry">
          {{ $t('retry') }}
        </button>
      </template>
      <p v-else-if="readmeStatus === 'unavailable'" class="text-sm">
        {{ $t('readmeUnavailable') }}
      </p>
      <p
        v-else-if="!selectedRepository"
        class="flex items-center justify-center text-sm"
      >
        <svg-icon name="hand-left" class="mr-1 text-base" />{{
          $t('readmeTip')
        }}
      </p>
      <svg-icon v-show="loading" name="loading" class="animate-spin text-2xl" />
    </div>

    <article
      v-show="selectedRepository && readme"
      v-html="readme"
      ref="refReadme"
      class="markdown-body overflow-y-auto p-5 text-sm"
      style="height: calc(100% - 2.25rem)"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useRepositoryStore } from '@/store/repository';
import { getRepositoryReadme, getReadmeByMarkdown } from '@/server/github';
import { rewriteReadmeHtml } from './tool';

const { selectedRepository } = storeToRefs(useRepositoryStore());
const readme = ref('');
const readmeStatus = ref('');
const refReadme = ref(null);
const loading = ref(false);

let readmeRequestId = 0;
let loadedRepositoryId = null;

/**
 * GitHub API 返回的 README 内容是 base64 编码的 UTF-8 文本
 *
 * @param {string} content
 * @returns {string}
 */
function decodeBase64(content) {
  const binary = atob(content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function loadReadme({ owner, name }) {
  const requestId = (readmeRequestId += 1);
  readme.value = '';
  readmeStatus.value = '';
  loading.value = true;

  try {
    const { content, html_url } = await getRepositoryReadme({
      owner: owner.login,
      name,
    });
    const result = await getReadmeByMarkdown(decodeBase64(content));
    if (requestId !== readmeRequestId) return;

    readme.value = rewriteReadmeHtml(result, html_url);
    await nextTick();
    if (requestId !== readmeRequestId) return;
    refReadme.value?.scrollTo({ top: 0 });
  } catch (error) {
    if (requestId !== readmeRequestId) return;
    readmeStatus.value =
      error.response?.status === 404 ? 'unavailable' : 'error';
    console.error('Failed to load repository README:', error);
  } finally {
    if (requestId === readmeRequestId) loading.value = false;
  }
}

function retry() {
  const repository = selectedRepository.value;
  if (repository) loadReadme(repository);
}

function clearReadme() {
  readmeRequestId += 1;
  readme.value = '';
  readmeStatus.value = '';
  loading.value = false;
  loadedRepositoryId = null;
}

watch(
  // 只跟踪 id：刷新时列表会被整体替换，同一个仓库不应重复请求 README
  () => selectedRepository.value?.id,
  (id) => {
    if (!id) {
      clearReadme();
      return;
    }

    if (id === loadedRepositoryId) return;

    loadedRepositoryId = id;
    loadReadme(selectedRepository.value);
  },
  { immediate: true },
);

const toRepositoryHref = (repository) =>
  `https://github.com/${repository.owner.login}/${repository.name}`;
</script>

<style src="github-markdown-css/github-markdown-light.css"></style>

<style>
.markdown-body {
  font-size: 14px;
}

.markdown-body img {
  display: inline;
}
</style>
