<template>
  <div>
    <header>Set up JSON Delivery</header>
    <section>
      <h4>Response Parsing</h4>
      <h5>Outcome Search Path</h5>
      <input v-model="opts.outcomePath" type="text">
      <p>Narrow the search scope using dot-notation path (for JSON responses), XPath (for XML responses), or CSS selector (for HTML responses).</p>

      <h5>Outcome Search Term</h5>
      <input v-model="opts.outcomeTerm" type="text">
      <p>The text to search for in the response. When found outcome will be "success", Regular expressions are allowed.</p>

      <h5>Reason Path</h5>
      <input v-model="opts.reasonPath" type="text">
      <p>Find the failure reason using dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group.</p>

      <p>Additional options are available in the field mapping section after completing the initial configuration.</p>
    </section>
    <Navigation :onNext="next"/>
  </div>
</template>
<script>
  import { Navigation } from '@activeprospect/integration-components';
  export default {
    data() {
      return {
        opts: {
          outcomePath: '',
          outcomeTerm: '',
          reasonPath: ''
        }
      }
    },
    methods: {
      next() {
        this.$store.commit('setResponseOpts', this.opts);
        this.$router.push('/3');
      }
    },
    mounted () {
      this.opts.outcomePath = this.$store.state.outcomePath;
      this.opts.outcomeTerm = this.$store.state.outcomeTerm;
      this.opts.reasonPath = this.$store.state.reasonPath;
    },
    components: { Navigation }
  }
</script>
