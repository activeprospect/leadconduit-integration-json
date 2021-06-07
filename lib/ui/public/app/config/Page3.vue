<template>
  <div>
    <header>Set up JSON Delivery</header>
    <section>
      <p>When the response is a Failure:</p>
      <form>
        <ul>
          <li>
            <label>
              <input type="radio" v-model="action" value="stop">
              Stop processing the lead and mark the lead a Failure (Recommended)
            </label>
          </li>
          <li>
            <label>
              <input type="radio" v-model="action" value="continue">
              Continue processing the lead regardless of what's matched
            </label>
          </li>
        </ul>
      </form>
    </section>
    <Navigation :onFinish="finish"/>
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components';
export default {
  data() {
    return {
      action: 'stop'
    }
  },
  methods: {
    finish() {
      this.$store.dispatch('setAction', this.action);
      this.$store.dispatch('finish');
    }
  },
  components: {
    Navigation
  }
}
</script>
