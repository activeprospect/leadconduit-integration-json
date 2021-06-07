<template>
  <div>
    <header>
      Basic Authentication
    </header>
    <section>
      <p>A username and password combo for standard HTTP authentication.
      <form>
        <ul>
          <li>
            <label>Username</label>
            <input type="text" v-model="credential.username">
          </li>
          <li>
            <label>Password</label>
            <input type="text" v-model="credential.password">
          </li>
        </ul>
      </form>
    </section>
    <footer>
      <button v-on:click="$store.dispatch('cancel')">Cancel</button>
      <button v-on:click="next" class="primary">{{ (token) ? 'Continue' : 'Skip' }}</button>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      credential: this.$store.getters.getCredential || {
        username: '',
        password: '',
        package: 'leadconduit-json',
        type: 'user'
      }
    };
  },
  methods: {
    next() {
      if (this.token) {
        return this.$store.dispatch('createCredential', this.credential);
      }
      this.$store.state.ui.create({ 'redirect': 'config'});
    },
  },
};
</script>
