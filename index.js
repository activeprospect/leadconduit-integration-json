module.exports = {
  outbound: {
    authenticated_json: require('./lib/authjson'),
    json: require('./lib/json')
  },
  ui: require('./lib/ui')
};
