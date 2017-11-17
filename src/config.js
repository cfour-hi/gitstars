const config = {
  development: {
    clientId: 'bf9d4f20def51dbd5c5c',
    clientSecret: 'e8f5bc4369f64b05d052819047ca9d5e1d8b2e8f'
  },
  production: {
    clientId: '75cf00b02deb33e63424',
    clientSecret: '6fa564cbd46f6bdfa1fb81ddce5503dcbe4ab4c4'
  }
}

const { clientId, clientSecret } = config[process.env.NODE_ENV]

export default {
  clientId,
  clientSecret,
  filename: 'gitstars.json',
  description: `github stars manager for ${process.env.NODE_ENV}`,
  norifyPosition: 'bottom-right'
}
