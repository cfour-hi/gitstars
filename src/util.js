export function parseURLSearch () {
  const search = {}
  const kvs = window.location.search.slice(1).split('&')
  for (const kv of kvs) {
    const skv = kv.split('=')
    search[skv[0]] = decodeURIComponent(search[skv[1]])
  }
  return search
}
