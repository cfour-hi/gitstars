import test from 'node:test';
import assert from 'node:assert/strict';
import {
  markLocalAnchors,
  replaceHtmlAttribute,
  rewriteReadmeHtml,
  toReadmeAnchor,
  toRepositoryReadmeHref,
} from '../src/components/repository-content/tool.js';

const README_URL =
  'https://github.com/coder/code-server/blob/main/docs/README.md';
const README_PREFIX = 'https://github.com/coder/code-server/blob/main/docs/';
const REPO_PREFIX = 'https://github.com/coder/code-server/blob/main/';

test('toReadmeAnchor prefixes GitHub user-content anchors', () => {
  assert.equal(toReadmeAnchor('#install'), '#user-content-install');
  assert.equal(toReadmeAnchor('#fn-1'), '#user-content-fn-1');
  assert.equal(
    toReadmeAnchor('#hello-%E4%B8%AD%E6%96%87'),
    '#user-content-hello-%E4%B8%AD%E6%96%87',
  );
});

test('toReadmeAnchor leaves non-anchors and prefixed anchors untouched', () => {
  assert.equal(toReadmeAnchor('#'), '#');
  assert.equal(
    toReadmeAnchor('#user-content-install'),
    '#user-content-install',
  );
  assert.equal(toReadmeAnchor('https://example.com'), 'https://example.com');
});

test('toRepositoryReadmeHref resolves relative paths against the README location', () => {
  const options = {
    repoUrlPrefix: REPO_PREFIX,
    readmeUrlPrefix: README_PREFIX,
  };

  assert.equal(
    toRepositoryReadmeHref('./other.md', options),
    `${README_PREFIX}other.md`,
  );
  assert.equal(
    toRepositoryReadmeHref('other.md', options),
    `${README_PREFIX}other.md`,
  );
  // Root-relative paths resolve from the repository root, not the README folder
  assert.equal(
    toRepositoryReadmeHref('/img/logo.png', options),
    `${REPO_PREFIX}img/logo.png`,
  );
});

test('toRepositoryReadmeHref keeps absolute and protocol links untouched', () => {
  const options = {
    repoUrlPrefix: REPO_PREFIX,
    readmeUrlPrefix: README_PREFIX,
  };

  for (const value of [
    'https://example.com/a',
    'mailto:dev@example.com',
    '//cdn.example.com/a.png',
    '#install',
  ]) {
    assert.equal(toRepositoryReadmeHref(value, options), value);
  }
});

test('replaceHtmlAttribute only rewrites the requested attribute', () => {
  const html =
    '<a href="./a.md" data-href="keep">a</a><img src="./a.png"><img data-src="./b.png">';
  const result = replaceHtmlAttribute(html, 'href', (value) => `X${value}`);

  assert.match(result, /href="X\.\/a\.md"/);
  assert.match(result, /data-href="keep"/);
  assert.match(result, /src="\.\/a\.png"/);
});

test('replaceHtmlAttribute does not corrupt attributes inside code blocks', () => {
  const html =
    '<pre><code>&lt;a href="./x"&gt;</code></pre><a href="./y">y</a>';
  const result = replaceHtmlAttribute(html, 'href', (value) => `X${value}`);

  assert.match(result, /&lt;a href="\.\/x"&gt;/);
  assert.match(result, /href="X\.\/y"/);
});

test('markLocalAnchors adds target=_self to same-page anchors once', () => {
  const html = '<a href="#user-content-install">a</a><a href="./b.md">b</a>';
  const result = markLocalAnchors(html);

  assert.match(result, /<a target="_self" href="#user-content-install">a<\/a>/);
  assert.match(result, /<a href="\.\/b\.md">b<\/a>/);
  assert.equal(markLocalAnchors(result), result);
});

test('markLocalAnchors keeps existing target attributes', () => {
  const html = '<a target="_blank" href="#section">a</a>';
  assert.equal(markLocalAnchors(html), html);
});

test('rewriteReadmeHtml rewrites links, images and anchors for the app', () => {
  const html = [
    '<div class="markdown-heading"><h2>Install</h2>',
    '<a id="user-content-install" class="anchor" href="#install"></a></div>',
    '<p><a href="#install">go</a>',
    '<a href="./other.md">other</a>',
    '<a href="/root.md">root</a>',
    '<a href="https://example.com">external</a>',
    '<img src="./a.png"></p>',
  ].join('');

  const result = rewriteReadmeHtml(html, README_URL);

  assert.match(result, /href="#user-content-install"/);
  assert.match(result, /target="_self"/);
  assert.match(
    result,
    /href="https:\/\/github\.com\/coder\/code-server\/blob\/main\/docs\/other\.md"/,
  );
  assert.match(
    result,
    /href="https:\/\/github\.com\/coder\/code-server\/blob\/main\/root\.md"/,
  );
  assert.match(result, /href="https:\/\/example\.com"/);
  assert.match(
    result,
    /src="https:\/\/github\.com\/coder\/code-server\/raw\/main\/docs\/a\.png"/,
  );
});
