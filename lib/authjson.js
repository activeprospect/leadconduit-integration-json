const { get } = require("lodash");
const request = require('request');
const json = require('leadconduit-custom').outbound.json;
const { substituteHeaderTokens, convertAuthConfig, normalizeHeaders} = require('./authHelpers');

const validate = (vars) => {
  const baseValidation = json.validate(vars);
  if (baseValidation) {
    return baseValidation;
  }
  if (!vars.credential_id || vars.credential?.type !== 'token') return 'ID of token credential is required';
  if (!vars.authentication_url) return 'authentication URL is required';
};

const refreshToken = (vars, callback) => {
  vars.authentication_header = substituteHeaderTokens(vars.authentication_header, vars.credential);
  const opts = json.request(convertAuthConfig(vars));

  request(opts, (err, response, body) => {
    if (err) return callback(`Error while fetching new token: ${err}`, null);

    let tokenResponse = {};
    try {
      tokenResponse = JSON.parse(body);
    }
    catch (err) {
      return callback(`Error while parsing refresh token: ${err}`);
    }

    return callback(null, tokenResponse);
  });
};

const parseResponse = (vars, requestOpts, response, body) => {
  const result = {
    status: response.statusCode,
    version: response.httpVersion || '1.1',
    headers: normalizeHeaders(response.headers),
    body
  };

  let event;
  try {
    event = json.response(vars, requestOpts, result);
  } catch (error) {
    event = {
      outcome: 'error',
      reason: `Error parsing response: ${error}`
    };
  }
  return event;
};

const handle = (vars, callback, retried = false) => {
  // save an un-substituted copy of the headers object in case it's needed for retry
  const originalVarsHeader = Object.assign({}, vars.header);

  vars.header = substituteHeaderTokens(vars.header, vars.credential);
  const requestOpts = json.request(vars);

  // make the request with the current access token
  request(requestOpts, (err, response, body) => {
    if (err) {
      return callback(null, { outcome: 'error', reason: err.message || `Unknown Error: ${response.statusCode}`});
    }

    // check for Unauthorized or Forbidden response
    if (response.statusCode === 401 || response.statusCode === 403) {
      // refresh token and try again
      if (retried) {
        return callback(null, { outcome: 'error', reason: 'Unable to authenticate after attempting to refresh token' });
      }
      else {
        refreshToken(vars, (err, tokenResponse) => {
          if(err) {
            return callback(null, { outcome: 'error', reason: err });
          }

          // update vars.credential with the new token, using the user-configured (or default) attribute
          const tokenPath = vars.authentication_token_path || 'accessToken';
          const tokenName = tokenPath.split('.').at(-1); // use the name after the final '.', if there are any
          vars.credential[tokenName] = get(tokenResponse, tokenPath);

          // retry
          vars.header = originalVarsHeader;
          return handle(vars, callback, true);
        });
      }
    } else {
      const event = parseResponse(vars, requestOpts, response, body);
      return callback(null, event);
    }
  });
};

const requestVariables = () => {
  const baseVariables = json.request.variables();

  // make credential_id required (probably at [0] but let's not assume)
  const credentialId = baseVariables.find(variable => variable.name === 'credential_id');
  credentialId.required = true;

  return [
    { name: 'authentication_url', type: 'string', description: 'URL to get access token from', required: true },
    { name: 'authentication_method', type: 'string', description: 'HTTP method (GET, or POST) for authentication request (default: POST)', required: false },
    { name: 'authentication_property.*',type: 'wildcard',  description: 'JSON property in dot notation for authentication request', required: false },
    { name: 'authentication_header.*', description: 'HTTP header to send in the authentication request. Include the name of a credential field (TOKEN, ACCESS_TOKEN) and it will be replaced by that value', type: 'wildcard', required: false },
    { name: 'authentication_token_path', description: 'The JSON dot-notation path used to find the access token. The final element will become the name of the credential field (default: accessToken)', type: 'string', required: false },
  ].concat(baseVariables);
};

module.exports = {
  handle,
  requestVariables,
  responseVariables: json.response.variables,
  validate
};
