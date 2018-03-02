const custom = require('leadconduit-custom').outbound.json;

module.exports = {
  request: custom.request,
  response: custom.response,
  validate: custom.validate
};
