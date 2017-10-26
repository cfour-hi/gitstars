export function parseURLSearch () {
  const search = {}
  const searchStr = window.location.search

  if (!searchStr.length) return search

  const kvs = searchStr.slice(1).split('&')
  for (const kv of kvs) {
    const skv = kv.split('=')
    search[skv[0]] = decodeURIComponent(skv[1])
  }
  return search
}
