<template>
  <div>
    <header>Set up JSON Delivery</header>
    <section>
      <h5>URL</h5>
      <input v-model="url" type="text">

      <h5>Data</h5>
      <textarea rows="5" v-model="rawJson"></textarea>
      <p>If you have an example JSON body, copy+paste it here.</p>
      <p>If not, you can switch to dot notation field mapping.</p>

      <ul>
        <li v-for="field in extraFields" :key="field.name">
          <input v-model="field.value" type="text"> <input v-model="field.property" type="text"> <button v-on:click="addProperty">+</button>
        </li>
      </ul>
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
        errors: false,
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
      addProperty() {
        this.extraFields.push({ value: '', property: '' });
      },
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
          this.errors = false;
          return Object.keys(parsed);
        }
        catch (e) {
          this.errors = true;
          return undefined
        }
      }
    }
  }
</script>
