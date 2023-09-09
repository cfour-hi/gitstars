export const AUTHOR = 'cfour-hi';
export const BRAND = 'gitstars';
export const GITHUB_COM = 'https://github.com';
export const BRAND_URI = `${GITHUB_COM}/${AUTHOR}/${BRAND}`;
export const TOKEN_KEY = `${BRAND}_access_token`;
export const LOCAL_KEY_USERINFO = `${BRAND}_userinfo`;
export const STARRED_REPOS = `${BRAND}_starred_repos`;
export const TAG_SRC = {
  self: 'self',
  github: 'github',
};
export const TAG_TYPE = {
  topic: 'topic',
  language: 'language',
};
export const REPO_SORT_TYPE = {
  time: {
    value: 'time',
    label: '按时间排序',
  },
  star: {
    value: 'star',
    label: '按 Star 数量排序',
  },
};
export const TAG_SORT_TYPE = {
  amountDown: {
    icon: 'sort-amount-down',
    label: '降序排序',
    value: 'amountDown',
  },
  amountUp: {
    icon: 'sort-amount-up',
    label: '升序排序',
    value: 'amountUp',
  },
};
