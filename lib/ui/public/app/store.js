import Vuex from 'vuex';
import Vue from 'vue';
import ObjectID from 'bson-objectid';

const initStore = (config, ui) => new Vuex.Store({
  state: {
    ui: ui,
    url: undefined,
    fields: {
      parsedFields: undefined,
      extraFields: undefined,
    },
    responseOpts: {
      outcomePath: undefined,
      outcomeTerm: undefined,
      reasonPath: undefined
    },
    action: 'stop'
  },
  mutations: {
    setUrl (state, url) {
      Vue.set(state, 'url', url);
    },
    setFields (state, fields) {
      Vue.set(state.fields, 'fields', fields);
    },
    setResponseOpts (state, { outcomePath, outcomeTerm, reasonPath }) {
      Vue.set(state.responseOpts, 'outcomePath', outcomePath);
      Vue.set(state.responseOpts, 'outcomeTerm', outcomeTerm);
      Vue.set(state.responseOpts, 'reasonPath', reasonPath);
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
      const entityName = config.entity.name
      const fields = context.state.fields.fields;

      let parsedMappings = []
      if (fields.parsedFields) {
        parsedMappings = fields.parsedFields.map((field) => { return { property: field, value: '' }});
      }

      const mappings = (fields.extraFields) ? parsedMappings.concat(fields.extraFields) : parsedMappings;

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
              property: 'url',
              value: context.state.url
            }]
          }
        }]
      };

      mappings.forEach((mapping) => {
        if (mapping.value && mapping.property) {
          flow.steps[0].integration.mappings.push({ property: `json_property.${mapping.property}`, value: mapping.value });
        }
        else if (mapping.property) {
         flow.fields.push({ name: `json_property.${mapping.property}`, required: false });
        }
      });

      if (context.state.action === 'stop') {
        flow.steps.push({
          type: 'filter',
          reason: `{{${entityName}.reason}}`,
          outcome: 'failure',
          rule_set: {
            op: 'and',
            rules: [{
              op: 'is',
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
