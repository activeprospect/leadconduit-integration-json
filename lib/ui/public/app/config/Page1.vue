<template>
  <div>
    <header>Set up JSON Delivery</header>
    <section>
      <h5>URL</h5>
      <input v-model="url" type="text">

      <h5>Data</h5>
      <p>If you have an example JSON body, copy+paste it here.</p>
      <textarea rows="10" v-model="rawJson" v-bind:class="{ error: error }" style="font-family: monospace;"></textarea>
      <p v-if="!rawJson">No JSON entered</p>

      <p v-if="parsedFields && parsedFields.length">{{parsedFields.length}} field<span v-if="parsedFields.length > 1">s</span> found:</p>
      <pre v-if="parsedFields && parsedFields.length">{{parsedFields.join(', ')}}</pre>

      <p v-if="error">Invalid JSON</p>
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
        url: ''
      };
    },
    methods: {
      next() {
        this.$store.commit('setUrl', this.url);
        this.$store.commit('setFields', this.parsedFields);
        this.$store.commit('setJson', this.rawJson);
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
    },
    mounted () {
      this.url = this.$store.state.url;
      this.rawJson = this.$store.state.rawJson;
    },
    components: { Navigation }
  }
</script>
