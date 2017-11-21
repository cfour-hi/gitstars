export const parseURLSearch = function parseURLSearch (searchStr = window.location.search) {
  const search = {}

  if (!searchStr.length) return search
  if (searchStr[0] === '?') searchStr = searchStr.slice(1)

  const kvs = searchStr.split('&')
  for (const kv of kvs) {
    const skv = kv.split('=')
    search[skv[0]] = decodeURIComponent(skv[1])
  }
  return search
}
