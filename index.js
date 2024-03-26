module.exports = {
  outbound: {
    token_authenticated: require('./lib/authjson'),
    json: require('./lib/json')
  },
  ui: require('./lib/ui')
};
