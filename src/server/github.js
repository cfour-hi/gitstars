import { httpRequestGithub } from './http-request';

const RANKING_BASE_URL =
  'https://raw.githubusercontent.com/cfour-hi/github-ranking/main';

async function getRankingJson(fileName) {
  const res = await fetch(`${RANKING_BASE_URL}/${fileName}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to load ${fileName}: ${res.status}`);
  }
  return res.json();
}

export async function getUserInfo() {
  return httpRequestGithub.get('/user');
}

export async function getStarredRepositories(params) {
  return httpRequestGithub.get('/user/starred', { params });
}

export async function getRepositoryReadme(params) {
  return httpRequestGithub.get(`/repos/${params.owner}/${params.name}/readme`);
}

export async function getReadmeByMarkdown(content) {
  return httpRequestGithub.post('/markdown', {
    text: content,
  });
}

export async function getGithubRankingLanguageList() {
  return getRankingJson('languages.json');
}

export async function getGithubRankingLanguageMap() {
  return getRankingJson('ranking.json');
}
