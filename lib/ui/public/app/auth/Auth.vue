<template>
  <div>
    <header>Authentication</header>
    <section>
      <form>
        <p v-if="!originalType">What type of authentication should be used?</p>
        <ul>
          <li v-if="!originalType">
            <label>
              <input type="radio" v-model="credential.type" value="none" id="none"> <b>None</b> - The server doesn't require any authentication
            </label>
          </li>
          <li v-if="originalType === 'user' || !originalType">
            <label>
              <input type="radio" v-model="credential.type" value="user" id="user"> <b>Username &amp; Password</b> - The server requires a username and password ("Basic" authentication)
            </label>
            <section v-if="credential.type === 'user'" style="margin-top: 2px;">
              <ul>
                <li style="margin-bottom: 2px;">
                  <label>Username</label>
                  <input type="text" v-model="credential.username">
                </li>
                <li style="margin-bottom: 2px;">
                  <label>Password</label>
                  <input type="text" v-model="credential.password">
                </li>
              </ul>
            </section>
          </li>
          <li v-if="originalType === 'token' || !originalType">
            <label>
              <input type="radio" v-model="credential.type" value="token" id="token"> <b>Bearer Token</b> - The server uses token-based authentication
            </label>
            <section v-if="credential.type === 'token'" style="margin-top: 2px;">
              <ul>
                <li style="margin-bottom: 2px;">
                  <label>Token</label>
                  <input type="text" v-model="credential.token">
                </li>
              </ul>
            </section>
          </li>
        </ul>
      </form>
    </section>
    <Navigation :onNext="next" :disableNext="disableNextButton" />
  </div>
</template>

<script>
import { Navigation } from '@activeprospect/integration-components';
export default {
  data() {
    // this isn't a "real" credential, which wouldn't have `type: none` or both password & token
    const credentialTemplate = {
      username: '',
      password: '',
      token: '',
      package: 'leadconduit-json',
      type: 'none'
    };
    const existingCredential = this.$store.getters.getCredential;
    return {
      originalType: existingCredential?.type, // used to keep user from changing type when editing
      credential: existingCredential || credentialTemplate,
    };
  },
  computed: {
    disableNextButton() {
      if(this.credential.type === 'token') {
        return !this.credential.token;
      }
      else if(this.credential.type === 'user') {
        return !this.credential.username || !this.credential.password;
      }
      else {
        return false;
      }
    }
  },
  methods: {
    next() {
      if (this.credential.type === 'user') {
        delete this.credential.token;
        this.$store.dispatch('saveCredential', this.credential);
      } else if (this.credential.type === 'token') {
        delete this.credential.username;
        delete this.credential.password;
        this.$store.dispatch('saveCredential', this.credential);
      } else {
        // must be 'none'
        this.$store.state.ui.create({'redirect': 'config'});
      }
    },
  },
  components: { Navigation }
};
</script>

<style>
label {
  font-weight: normal !important;
}
input[type=text] {
  width: 50%
}
</style>
