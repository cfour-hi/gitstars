/**
 * 将 README 中的相对地址转换为 GitHub 上的绝对地址
 *
 * @param {string} str href 或 src 的原始值
 * @param {object} options
 * @param {string} options.repoUrlPrefix 仓库根目录（含分支）地址
 * @param {string} options.readmeUrlPrefix README 所在目录地址
 * @returns {string}
 */
export const toRepositoryReadmeHref = (
  str,
  { repoUrlPrefix = '', readmeUrlPrefix = '' } = {},
) => {
  if (!str) return str;
  // 绝对地址、协议地址（mailto: 等）和页内锚点保持原样
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(str)) return str;
  // 以 / 开头的是仓库根目录相对地址
  if (str.startsWith('/')) return `${repoUrlPrefix}${str.slice(1)}`;
  if (str.startsWith('./')) return `${readmeUrlPrefix}${str.slice(2)}`;
  return `${readmeUrlPrefix}${str}`;
};

/**
 * GitHub 渲染 Markdown 时会为标题和页内锚点加上 `user-content-` 前缀，
 * 但作者写的链接仍然是 `#foo`，需要转换成能命中的 id。
 *
 * @param {string} str
 * @returns {string}
 */
export const toReadmeAnchor = (str) => {
  if (!str?.startsWith('#')) return str;

  const id = str.slice(1);
  if (!id || id.startsWith('user-content-')) return str;

  return `#user-content-${id}`;
};

/**
 * 替换 HTML 中指定属性的值
 *
 * @param {string} html
 * @param {string} attribute href 或 src
 * @param {(value: string) => string} replacer
 * @returns {string}
 */
export const replaceHtmlAttribute = (html, attribute, replacer) => {
  const pattern = new RegExp(`(<[^>]+\\s${attribute}=")([^"]*)(")`, 'g');
  return html.replace(
    pattern,
    (match, start, value, end) => start + replacer(value) + end,
  );
};

/**
 * README 中的页内锚点需要留在当前标签页滚动，
 * 否则会被 <base target="_blank"> 带到新标签页。
 *
 * @param {string} html
 * @returns {string}
 */
export const markLocalAnchors = (html) =>
  html.replace(/<a\s+[^>]*>/g, (tag) => {
    if (!/\shref="#/.test(tag) || /\starget=/.test(tag)) return tag;
    return tag.replace('<a ', '<a target="_self" ');
  });

/**
 * https://github.com/coder/code-server/blob/main/docs/README.md
 * => readmeUrlPrefix: https://github.com/coder/code-server/blob/main/docs/
 * => repoUrlPrefix: https://github.com/coder/code-server/blob/main/
 */
const REPOSITORY_URL_PREFIX =
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\//;

/**
 * 将 README HTML 中的链接、图片和页内锚点改写为可用的地址
 *
 * @param {string} html GitHub /markdown 返回的 HTML
 * @param {string} htmlURL README 在 GitHub 上的 html_url
 * @returns {string}
 */
export const rewriteReadmeHtml = (html, htmlURL) => {
  const readmeUrlPrefix = htmlURL.slice(0, htmlURL.lastIndexOf('/') + 1);
  const repoUrlPrefix =
    htmlURL.match(REPOSITORY_URL_PREFIX)?.[0] ?? readmeUrlPrefix;
  const rewriteHref = (value) => {
    if (value.startsWith('#')) return toReadmeAnchor(value);
    return toRepositoryReadmeHref(value, { repoUrlPrefix, readmeUrlPrefix });
  };

  const rewritten = replaceHtmlAttribute(
    replaceHtmlAttribute(html, 'href', rewriteHref),
    'src',
    (value) => rewriteHref(value).replace('/blob/', '/raw/'),
  );

  return markLocalAnchors(rewritten);
};
