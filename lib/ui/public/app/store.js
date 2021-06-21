import Vuex from 'vuex';
import Vue from 'vue';
import ObjectID from 'bson-objectid';
import sanitizeName from 'leadconduit-sanitize-name';

const initStore = (config, ui) => new Vuex.Store({
  state: {
    ui: ui,
    url: undefined,
    parsedFields: undefined,
    outcomePath: undefined,
    outcomeTerm: undefined,
    reasonPath: undefined,
    action: 'stop'
  },
  mutations: {
    setUrl (state, url) {
      Vue.set(state, 'url', url);
    },
    setFields (state, fields) {
      Vue.set(state, 'parsedFields', fields);
    },
    setJson (state, json) {
      Vue.set(state, 'rawJson', json)
    },
    setResponseOpts (state, { outcomePath, outcomeTerm, reasonPath }) {
      Vue.set(state, 'outcomePath', outcomePath);
      Vue.set(state, 'outcomeTerm', outcomeTerm);
      Vue.set(state, 'reasonPath', reasonPath);
    },
    setAction(state, action) {
      Vue.set(state, 'action', action);
    }
  },
  getters: {
    getCredential: (state, getters) => {
      return config.credential;
    }
  },
  actions: {
    cancel (context) {
      context.state.ui.cancel();
    },
    createCredential(context, credential) {
      if (!credential.id) credential.id = new ObjectID().toHexString();
      context.state.ui.create({ credential });
    },
    finish (context) {
      const entityName = sanitizeName(config.entity.name);
      const { parsedFields } = context.state;

      const flow = {
        fields: [],
        steps: [{
          type: 'recipient',
          entity: {
            name: entityName,
            id: config.entity.id
          },
          integration: {
            module_id: config.integration,
            mappings: [{
              property: 'credential_id',
              value: (config.credential) ? config.credential.id : undefined
            },{
              property: 'url',
              value: context.state.url
            }, {
              property: 'outcome_search_term',
              value: context.state.outcomeTerm
            }, {
              property: 'outcome_search_path',
              value: context.state.outcomePath
            }, {
              property: 'reason_path',
              value: context.state.reasonPath
            }].filter((mapping) => { return mapping.value })
          }
        }]
      };

      if (parsedFields) {
        parsedFields.forEach((field) => {
          flow.fields.push({name: `json_property.${field}`, required: false});
        });
      }

      if (context.state.action === 'stop') {
        flow.steps.push({
          type: 'filter',
          reason: `{{${entityName}.reason}}`,
          outcome: 'failure',
          rule_set: {
            op: 'and',
            rules: [{
              op: 'is equal to',
              lhv: `${entityName}.outcome`,
              rhv: 'failure',
            }],
          },
          description: 'Catch failure responses',
          enabled: true,
        });
      }

      context.state.ui.create({ flow });
    }
  }

});

export default initStore;
