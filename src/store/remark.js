import { defineStore } from 'pinia';
import { debounce } from 'lodash';
import { REMARKS } from '@/constants';
import { createGist, getGist, getGists, updateGist } from '@/server/github';
import {
  findRemarkGist,
  getRepositoryRemark,
  normalizeRemarkPayload,
  REMARK_GIST_FILENAME,
  setRepositoryRemark,
  toRemarkGistPayload,
} from '@/utils/remark';

const SAVE_DELAY = 800;

const persistRemarks = debounce(async (store) => {
  await store.saveRemarks();
}, SAVE_DELAY);

export const useRemarkStore = defineStore('remark', {
  state: () => ({
    remarks: {},
    gistId: '',
    loading: false,
    saving: false,
    savedAt: '',
    error: '',
  }),

  actions: {
    loadLocalRemarks() {
      const cached = localStorage.getItem(REMARKS);
      if (!cached) return;

      try {
        this.remarks = normalizeRemarkPayload(JSON.parse(cached)).remarks;
      } catch {
        this.error = 'remark.loadFailed';
      }
    },

    cacheRemarks() {
      localStorage.setItem(
        REMARKS,
        JSON.stringify({ version: 1, remarks: this.remarks }),
      );
    },

    async resolveRemarks() {
      this.loadLocalRemarks();
      this.loading = true;
      this.error = '';

      try {
        const gists = await getGists({ per_page: 100 });
        const gist = findRemarkGist(gists);
        if (!gist) return;

        const fullGist = await getGist(gist.id);
        const content =
          fullGist.files?.[REMARK_GIST_FILENAME]?.content || '';

        this.gistId = fullGist.id;
        this.remarks = normalizeRemarkPayload(JSON.parse(content)).remarks;
        this.cacheRemarks();
      } catch {
        this.error = 'remark.loadFailed';
      } finally {
        this.loading = false;
      }
    },

    async saveRemarks() {
      if (!this.gistId && Object.keys(this.remarks).length === 0) return;

      this.saving = true;
      this.error = '';

      try {
        const payload = toRemarkGistPayload(this.remarks);
        const gist = this.gistId
          ? await updateGist(this.gistId, payload)
          : await createGist(payload);

        this.gistId = gist.id;
        this.savedAt = new Date().toISOString();
      } catch {
        this.error = 'remark.saveFailed';
      } finally {
        this.saving = false;
      }
    },

    updateRemark(repository, value) {
      this.remarks = setRepositoryRemark(this.remarks, repository, value);
      this.cacheRemarks();
      persistRemarks(this);
    },

    toRemark(repositoryId) {
      return getRepositoryRemark(this.remarks, repositoryId);
    },
  },
});
