import { useTagStore } from '@/store/tag';

export const useTag = () => {
  const tagStore = useTagStore();

  const toTagList = (tagMap) => {
    const filterText = tagStore.filterText.toLowerCase();
    return Object.keys(tagMap)
      .filter((key) => key.toLowerCase().includes(filterText))
      .map((key) => ({
        label: key,
        count: tagMap[key].length,
      }))
      .sort((a, b) => {
        if (tagStore.sortType === 'ascend') {
          return a.count - b.count;
        }
        return b.count - a.count;
      });
  };

  const onSelectTag = (tagType) => {
    return (e) => {
      let elTag = e.target;
      while (!elTag.dataset[tagType]) {
        elTag = elTag.parentElement;
        if (!elTag) return;
      }
      tagStore.$patch({
        selectedTag: elTag.dataset[tagType],
        selectedTagType: tagType,
      });
    };
  };

  return {
    toTagList,
    onSelectTag,
  };
};
