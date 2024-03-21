const {assert} = require('chai');
const nock = require('nock');
const integration = require('../lib/authjson');
const {requestVariables, validate} = require('../lib/authjson');
const parser = require('leadconduit-integration').test.types.parser(requestVariables());

const baseApiUrl = 'https://api.example.com';
const baseAuthUrl = 'https://auth.example.com';

describe('Token Authenticated', function () {

  describe('Request variables', () => {
    it('makes credential_id required', function () {
      const variables = requestVariables();
      const credentials = variables.filter(variable => variable.name === 'credential_id');
      assert.equal(credentials.length, 1);
      assert.isTrue(credentials[0].required);
    });
  });

  describe('Validate', () => {
    let vars;
    beforeEach(function () {
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

  describe('Handle', () => {
    const successEvent = {
      outcome: 'success',
      price: 0,
      score: 99
    };

    afterEach(function() {
      nock.cleanAll();
    });

    it('works in one transaction (as with valid token)', (done) => {
      nock(baseApiUrl)
        .post('/api/examples/42', {campaign_id: 'zzz123'})
        .reply(200, {score: 99});

      nock(baseAuthUrl)
        .post('/login')
        .reply(200);

      integration.handle(baseVars(), (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, successEvent);

        // ensure the auth URL wasn't used
        const pending = nock.pendingMocks();
        assert.equal(pending.length, 1);
        assert.isTrue(pending.includes(`POST ${baseAuthUrl}:443/login`));
        done();
      });
    });

    it('refreshes the token when it\'s expired', (done) => {
      nock(baseApiUrl)
        .post('/api/examples/42', {campaign_id: 'zzz123'})
        .reply(401);

      nock(baseAuthUrl)
        .post('/login', { scope: 'mint' })
        .matchHeader('authorization', 'Bearer old-token-xyz-789')
        .reply(200, { access_token: 'new-token-abc-123' });

      nock(baseApiUrl)
        .post('/api/examples/42', {campaign_id: 'zzz123'})
        .reply(200, {score: 99});

      const vars = baseVars();
      integration.handle(vars, (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, successEvent);
        assert.equal(vars.credential.access_token, 'new-token-abc-123');
        assert.equal(nock.pendingMocks().length, 0);
        done();
      });
    });

    it('only tries to refresh the token once', (done) => {
      const errorEvent = {
        outcome: 'error',
        reason: 'Unable to authenticate after attempting to refresh token'
      };

      nock(baseApiUrl)
        .post('/api/examples/42', {campaign_id: 'zzz123'})
        .reply(401);

      nock(baseAuthUrl)
        .post('/login', { scope: 'mint' })
        .matchHeader('authorization', 'Bearer old-token-xyz-789')
        .reply(403, { message: 'nope' });

      nock(baseApiUrl)
        .post('/api/examples/42', {campaign_id: 'zzz123'})
        .reply(401);

      const vars = baseVars();
      integration.handle(vars, (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, errorEvent);
        assert.isUndefined(vars.credential.access_token);
        assert.equal(nock.pendingMocks().length, 0);
        done();
      });
    });
  });
});

const baseVars = (custom = {}) => {
  const vars = {
    lead: {
      email: 'test@activeprospect.com',
      phone_1: '5125557777',
    },
    credential: {
      token: 'a-long-lived-api-token',
      access_token: 'old-token-xyz-789'
    },
    url: 'https://api.example.com/api/examples/42',
    method: 'post',
    json_property: {
      campaign_id: 'zzz123'
    },
    authentication_url: 'https://auth.example.com/login',
    authentication_header: {
      Authorization: 'Bearer ACCESS_TOKEN'
    },
    authentication_token_path: 'access_token',
    authentication_property: {
      scope: 'mint'
    }
  };
  return parser(Object.assign(vars, custom));
};
