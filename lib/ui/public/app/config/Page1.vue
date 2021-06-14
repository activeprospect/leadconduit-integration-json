<template>
  <div>
    <header>Set up JSON Delivery</header>
    <section>
      <h5>URL</h5>
      <input v-model="url" type="text">

      <h5>Data</h5>
      <p>If you have an example JSON body, copy+paste it here.</p>
      <textarea rows="10" v-model="rawJson" v-bind:class="{ error: error }"></textarea>
      <p v-if="parsedFields && parsedFields.length">{{parsedFields.length}} field<span v-if="parsedFields.length > 1">s</span> found: {{parsedFields.join(', ')}}</p>
      <p v-if="error">Error parsing JSON</p>
    </section>
    <Navigation :onNext="next" :disableNext="!url"/>
  </div>
</template>
<script>
  import { Navigation } from '@activeprospect/integration-components';
  import flatten from 'flat';
  export default {
    data() {
      return {
        rawJson: undefined,
        error: false,
        url: '',
        extraFields: [{
          value: '',
          property: ''
        }]
      };
    },
    components: {
      Navigation
    },
    methods: {
      next() {
        this.$store.commit('setUrl', this.url);
        this.$store.commit('setFields', { parsedFields: this.parsedFields, extraFields: this.extraFields });
        this.$router.push('/2');
      }
    },
    computed: {
      parsedFields() {
        if (!this.rawJson) return undefined;
        try {
          let parsed = JSON.parse(this.rawJson);
          parsed = flatten(parsed);
          this.error = false;
          return Object.keys(parsed);
        }
        catch (e) {
          this.error = true;
          return undefined
        }
      }
    }
  }
</script>
