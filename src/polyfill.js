/* eslint-disable */
if (Promise && !Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    let P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    )
  }
}
