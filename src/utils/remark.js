export const REMARK_GIST_FILENAME = 'gitstars-remarks.json';
export const REMARK_GIST_DESCRIPTION = 'Gitstars remarks';

export function normalizeRemarkPayload(payload) {
  if (!payload || typeof payload !== 'object' || !payload.remarks) {
    return { version: 1, remarks: {} };
  }

  const remarks = Object.entries(payload.remarks).reduce(
    (result, [key, entry]) => {
      if (!entry || typeof entry !== 'object') return result;

      const repositoryId = Number(entry.repositoryId || key);
      const remark = `${entry.remark || ''}`.trim();
      if (!repositoryId || !remark) return result;

      result[repositoryId] = {
        repositoryId,
        fullName: entry.fullName || '',
        remark,
        updatedAt: entry.updatedAt || new Date().toISOString(),
      };
      return result;
    },
    {},
  );

  return { version: 1, remarks };
}

export function setRepositoryRemark(remarks, repository, value) {
  const nextRemarks = { ...remarks };
  const remark = `${value || ''}`.trim();

  if (!remark) {
    delete nextRemarks[repository.id];
    return nextRemarks;
  }

  nextRemarks[repository.id] = {
    repositoryId: repository.id,
    fullName: `${repository.owner.login}/${repository.name}`,
    remark,
    updatedAt: new Date().toISOString(),
  };
  return nextRemarks;
}

export function getRepositoryRemark(remarks, repositoryId) {
  return remarks[repositoryId]?.remark || '';
}

export function repositoryMatchesRemark(repository, remarks, filterText) {
  const remark = getRepositoryRemark(remarks, repository.id).toLowerCase();
  return Boolean(filterText && remark.includes(filterText.toLowerCase()));
}

export function toRemarkGistPayload(remarks) {
  return {
    description: REMARK_GIST_DESCRIPTION,
    public: false,
    files: {
      [REMARK_GIST_FILENAME]: {
        content: JSON.stringify({ version: 1, remarks }, null, 2),
      },
    },
  };
}

export function findRemarkGist(gists) {
  return gists.find(
    (gist) =>
      gist.description === REMARK_GIST_DESCRIPTION &&
      gist.files?.[REMARK_GIST_FILENAME],
  );
}

export function toRemarkTagList(repositories, remarks, filterText = '') {
  const lowerFilterText = filterText.toLowerCase();

  return repositories
    .map((repository) => ({
      repository,
      remark: getRepositoryRemark(remarks, repository.id),
    }))
    .filter(({ repository, remark }) => {
      if (!remark) return false;

      const label = `${repository.owner.login}/${repository.name}`;
      return (
        !lowerFilterText ||
        label.toLowerCase().includes(lowerFilterText) ||
        remark.toLowerCase().includes(lowerFilterText)
      );
    })
    .map(({ repository, remark }) => ({
      label: `${repository.owner.login}/${repository.name}`,
      count: 1,
      repositoryId: repository.id,
      remark,
    }));
}
