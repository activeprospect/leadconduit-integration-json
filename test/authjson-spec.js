const { assert } = require('chai');
const { requestVariables, validate } = require('../lib/authjson');

describe('Token Authenticated', function () {

  describe('Request variables', function () {
    it('makes credential_id required', function () {
      const variables = requestVariables();
      const credentials = variables.filter(variable => variable.name === 'credential_id');
      assert.equal(credentials.length, 1);
      assert.isTrue(credentials[0].required);
    });
  });

  describe('Validate', function () {
    let vars;
    beforeEach(function() {
      vars = {
        url: 'https://example.com/deliver',
        credential_id: 'abc123',
        authentication_url: 'https://example.com/authenticate',
        credential: {
          type: 'token'
        }
      };
    });

    it('requires base JSON vars', function () {
      delete vars.url;
      assert.equal(validate(vars), 'URL is required');
    });

    it('passes validation with all required vars', function () {
      assert.isUndefined(validate(vars));
    });

    it('fails when missing credential ID', function () {
      delete vars.credential_id;
      assert.equal(validate(vars), 'ID of token credential is required');
    });

    it('fails when missing auth URL', function () {
      delete vars.authentication_url;
      assert.equal(validate(vars), 'authentication URL is required');
    });
  });
});
