# GitHub Gist Remarks Design

## Goal

Add user-editable remarks to starred repositories in Gitstars. Remarks should persist across devices by syncing to a private GitHub Gist, while still using local browser storage for fast startup and offline-friendly fallback.

## Scope

- Add a remark field for each repository in `Your Stars`.
- Save remarks to GitHub Gist using the logged-in user's token.
- Cache remarks in `localStorage`.
- Show a `Remark` tab beside the existing `Languages` and `Topics` sidebar tabs.
- Let users filter to repositories that already have remarks.
- Include remark text in repository search.

Ranking repositories are read-only discovery data and do not receive editable remarks.

## Storage

Use one private Gist owned by the authenticated GitHub user. The Gist contains one JSON file:

```json
{
  "version": 1,
  "remarks": {
    "123456": {
      "repositoryId": 123456,
      "fullName": "owner/name",
      "remark": "Useful notes",
      "updatedAt": "2026-08-05T00:00:00.000Z"
    }
  }
}
```

Repository IDs are the primary key because they survive repository renames better than `owner/name`. `fullName` is stored as useful context for humans reading the Gist.

The Gist should be discoverable by a stable description such as `Gitstars remarks` and a stable filename such as `gitstars-remarks.json`.

## Auth

Update the GitHub OAuth URL to request `gist` scope in addition to the current scope. Existing users with older tokens may need to log in again before Gist writes can succeed.

## Data Flow

On startup:

1. Load cached remarks from `localStorage`.
2. Fetch the user's Gists and find the Gitstars remarks Gist.
3. If found, parse `gitstars-remarks.json`, update the remark store, and refresh local cache.
4. If not found, create a private remarks Gist when the first remark is saved.

On edit:

1. Update local store immediately.
2. Update `localStorage`.
3. Debounce remote save to GitHub Gist.
4. Show lightweight save state: saving, saved, or failed.

If remote save fails, keep the local value and expose a retry path on the next edit or app load.

## UI

Repository detail:

- Add a compact remark editor under the repository title and above the README content.
- Use a textarea so multi-line notes are possible.
- The editor is only shown for repositories from `Your Stars`.
- A clear or empty value removes that repository from the remark map.

Repository list:

- Show a short remark preview on cards that have a remark.
- Include remark text in the existing repository search filter.

Sidebar:

- Change bottom nav from `Languages / Topics` to `Languages / Topics / Remark`.
- In `Remark`, list repositories that have non-empty remarks.
- Selecting a remark item filters the repository list to that repository.

## Components And Stores

- Add a remark store for map state, save state, Gist id, load, and save actions.
- Add GitHub server helpers for listing Gists, creating the remarks Gist, and updating it.
- Extend the tag store with a `remark` selected type and a remark map/list source.
- Add a `TagListRemark` component following the existing language/topic list pattern.
- Update repository filtering to handle selected remark entries and text search over remarks.
- Update repository detail and cards to display/edit remarks.

## Error Handling

- Malformed Gist JSON is ignored with a failed state instead of breaking repository loading.
- HTTP 401 behavior remains centralized in the existing GitHub Axios interceptor.
- Other Gist failures should not clear local remarks.
- Empty remarks are trimmed before deciding whether to persist or delete them.

## Testing

Add focused unit tests for pure remark serialization/filtering helpers before implementation:

- Empty remarks are omitted.
- Repository ID is used as the stable key.
- Search matches remark text.
- Remark sidebar data only includes repositories with remarks.

Because the project currently has no test runner, add the smallest viable Vitest setup for these pure helpers, then verify with `pnpm test` and `pnpm build`.
