const isProduction = process.env.NODE_ENV === 'production'
const clientId = isProduction ? '75cf00b02deb33e63424' : 'bf9d4f20def51dbd5c5c'
const clientSecret = isProduction ? '6fa564cbd46f6bdfa1fb81ddce5503dcbe4ab4c4' : 'e8f5bc4369f64b05d052819047ca9d5e1d8b2e8f'

export default {
  clientId,
  clientSecret,
  filename: 'gitstars.json',
  description: `github stars manager for ${process.env.NODE_ENV}`,
  norifyPosition: 'bottom-right'
}
