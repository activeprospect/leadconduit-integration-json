const {assert} = require('chai');
const { convertAuthConfig, getTokenAttributes, substituteHeaderTokens } = require('../lib/authHelpers');

describe('Auth Helpers', function () {

  const credential = {
    "_id": "65e104ad228e27e6f9599999",
    "package": "leadconduit.custom",
    "type": "token",
    "name": "My First Token",
    "version": "14.12.13",
    "created_at": "2024-02-29T22:26:53.506Z",
    "updated_at": "2024-02-29T22:26:53.506Z",
    "token": "t0k3n",
    "accessToken": "foo",
    "aSeeminglyRandomAttribute": "bar",
  };

  it('gets tokens', function () {
    assert.deepEqual(getTokenAttributes(credential), ['token', 'accessToken', 'aSeeminglyRandomAttribute']);
  });

  it('substitutes header tokens', function () {
    const headers = {
      Authorization: "Bearer TOKEN",
      "X-Auth-Test-0": "Bearer token",
      "X-Auth-Test-1": "Bearer tokenizable", // no replacement; "token" isn't on a word boundary
      "X-Auth-Test-2": "Bearer version",     // no replacement; "version" is an ignored metadata attribute
      "X-Auth-Test-3": "What about aSeeminglyRandomAttribute"
    };

    const actual = substituteHeaderTokens(headers, credential);
    assert.equal(actual["Authorization"], "Bearer t0k3n");
    assert.equal(actual["X-Auth-Test-0"], "Bearer t0k3n");
    assert.equal(actual["X-Auth-Test-1"], "Bearer tokenizable");
    assert.equal(actual["X-Auth-Test-2"], "Bearer version");
    assert.equal(actual["X-Auth-Test-3"], "What about bar");
  });

  it('handles absence of credential token-ish values', function () {
    const headers = {
      Authorization: "Bearer TOKEN",
      "X-Auth-Test-0": "Bearer token"
    };

    const actual = substituteHeaderTokens(headers, {});
    assert.deepEqual(actual, headers);
  });

  it('converts auth config', function () {
    const vars = {
      authentication_url: 'https://auth.com',
      authentication_method: 'GET',
      authentication_header: {
        'Authorization': 'Bearer than-thou'
      },
      authentication_property: {
        'scopes[0]': 'contacts:read',
        'scopes[1]': 'contacts:manage'
      },
      // the values below here should be overwritten by the conversion
      url: 'https://endpoint.com',
      method: 'POST',
      header: {
        'Accept': 'application/xml'
      },
      json_property: {
        foo: 42
      },
      json_parameter: 'param',
      extra_parameter: {
        bar: 55
      }
    };

    const actual = convertAuthConfig(vars);
    assert.equal(actual.url, 'https://auth.com');
    assert.equal(actual.method, 'GET');
    assert.deepEqual(actual.header, { 'Authorization': 'Bearer than-thou' });
    assert.deepEqual(actual.json_property, { 'scopes[0]': 'contacts:read', 'scopes[1]': 'contacts:manage' });
    assert.isUndefined(actual.json_parameter);
    assert.isUndefined(actual.extra_parameter);
  });
});
