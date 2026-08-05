import { describe, expect, it } from 'vitest';
import {
  findRemarkGist,
  getRepositoryRemark,
  normalizeRemarkPayload,
  repositoryMatchesRemark,
  repositoryMatchesSelectedRemark,
  setRepositoryRemark,
  toRemarkGistPayload,
  toRemarkPreview,
  toRemarkTagList,
} from './remark';

const repo = {
  id: 123,
  name: 'gitstars',
  owner: { login: 'cfour-hi' },
};

describe('remark utilities', () => {
  it('stores remarks by repository id and preserves full name context', () => {
    const remarks = setRepositoryRemark({}, repo, '  Useful for star triage  ');

    expect(remarks).toEqual({
      123: {
        repositoryId: 123,
        fullName: 'cfour-hi/gitstars',
        remark: 'Useful for star triage',
        updatedAt: expect.any(String),
      },
    });
  });

  it('omits empty remarks from the payload', () => {
    const existing = setRepositoryRemark({}, repo, 'Useful');
    const remarks = setRepositoryRemark(existing, repo, '   ');

    expect(remarks).toEqual({});
    expect(getRepositoryRemark(remarks, repo.id)).toBe('');
  });

  it('normalizes malformed gist content to an empty versioned payload', () => {
    expect(normalizeRemarkPayload({ remarks: null })).toEqual({
      version: 1,
      remarks: {},
    });
  });

  it('matches repository search against remark text', () => {
    const remarks = setRepositoryRemark({}, repo, 'Pinia storage example');

    expect(repositoryMatchesRemark(repo, remarks, 'storage')).toBe(true);
    expect(repositoryMatchesRemark(repo, remarks, 'vite')).toBe(false);
  });

  it('lists only repositories with remarks for the remark sidebar', () => {
    const emptyRepo = {
      id: 456,
      name: 'empty',
      owner: { login: 'cfour-hi' },
    };
    const remarks = setRepositoryRemark({}, repo, 'Private notes');

    expect(toRemarkTagList([repo, emptyRepo], remarks)).toEqual([
      {
        label: 'cfour-hi/gitstars',
        count: 1,
        repositoryId: 123,
        remark: 'Private notes',
      },
    ]);
  });

  it('builds the private Gist payload with the stable remarks filename', () => {
    const remarks = setRepositoryRemark({}, repo, 'Synced note');

    expect(toRemarkGistPayload(remarks)).toEqual({
      description: 'Gitstars remarks',
      public: false,
      files: {
        'gitstars-remarks.json': {
          content: JSON.stringify({ version: 1, remarks }, null, 2),
        },
      },
    });
  });

  it('finds the Gitstars remarks Gist by description and filename', () => {
    const gists = [
      {
        id: 'other',
        description: 'Other data',
        files: { 'gitstars-remarks.json': {} },
      },
      {
        id: 'target',
        description: 'Gitstars remarks',
        files: { 'gitstars-remarks.json': { content: '{}' } },
      },
    ];

    expect(findRemarkGist(gists).id).toBe('target');
  });

  it('matches the selected remark repository by stable repository id', () => {
    expect(repositoryMatchesSelectedRemark(repo, '123')).toBe(true);
    expect(repositoryMatchesSelectedRemark(repo, '456')).toBe(false);
    expect(repositoryMatchesSelectedRemark(repo, '')).toBe(false);
  });

  it('clips long remark previews without changing short text', () => {
    expect(toRemarkPreview('Short note')).toBe('Short note');
    expect(toRemarkPreview('a'.repeat(90))).toBe(`${'a'.repeat(77)}...`);
  });
});
