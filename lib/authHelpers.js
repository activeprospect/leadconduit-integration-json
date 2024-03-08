const { capitalize } = require('lodash');

const ignoreCredentialAttributes = [
  "_id",
  "package",
  "type",
  "name",
  "version",
  "account_id",
  "created_at",
  "updated_at"
];

// return all non-metadata attributes (i.e., those that could have real data) from the given credential object
const getTokenAttributes = (credential) => {
  return Object.keys(credential).filter(key => !ignoreCredentialAttributes.includes(key));
};

// replace auth token names with their credential values in the given vars.headers object
// e.g., headers: {"Authorization": "Bearer token"} -> {"Authorization": "Bearer abc123"}
const substituteHeaderTokens = (headers, credential) => {
  const tokenAttributes = getTokenAttributes(credential);

  if (headers && tokenAttributes) {
    // iterate over each header value (e.g., 'Bearer TOKEN')
    Object.keys(headers).forEach(property => {
      // looking for each tokenAttribute (e.g., 'token')
      tokenAttributes.forEach(tokenAttribute => {
        const re = new RegExp(`\\b${tokenAttribute}\\b`, "i"); // \b -> word boundary check
        headers[property] = headers[property].replace(re, credential[tokenAttribute]);
      });
    });
  }
  return headers;
};

// shift the authentication-specific mappings to the standard JSON integration ones, excluding all others
const convertAuthConfig = (vars) => {
  return {
    url: vars.authentication_url,
    method: vars.authentication_method || 'POST',
    header: vars.authentication_header,
    json_property: vars.authentication_property,
  };
};

const normalizeHeaders = (headers) => {
  const normalHeaders = {};

  Object.keys(headers).forEach(key => {
    const normalizePart = (part) => capitalize(part);
    const normalField = key.split('-').map(normalizePart).join('-');
    normalHeaders[normalField] = headers[key];
  });
  return normalHeaders;
};

module.exports = {
  convertAuthConfig,
  getTokenAttributes,
  normalizeHeaders,
  substituteHeaderTokens
};
