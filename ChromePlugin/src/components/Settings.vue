<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-text-field
      id="serverUrl"
      v-model="form.serverUrl"
      label="ServerURL"
      placeholder="Enter URL of the server"
      required
    />

    <v-text-field
      id="apiKey"
      v-model="form.apiKey"
      placeholder="Enter API Key"
      label="API-Key"
      required
    />

    <v-btn

      id="saveSettingsBtn"
      :disabled="!valid"
      color="success"
      class="mr-4"
      @click="onSubmit"
    >
      Save
    </v-btn>


    <v-btn
      color="warning"
      @click="subscribe"
    >
      Subscribe push messages
    </v-btn>
  </v-form>
</template>
<script>
import Settings from '../settings.js';

export default {
  name: 'App',
  components: {},
  data() {
    return {
      form: {
        serverUrl: '',
        apiKey: '',
      },
      appRef: this.$root.$children[0].$refs.frame,
    };
  },
  mounted() {
    console.log('Loading settings');
    this.form.serverUrl = Settings.getServerUrl();
    this.form.apiKey = Settings.getApiKey();
  },
  methods: {
    onSubmit() {
      console.log('Saving settings');
      Settings.setServerUrl(this.form.serverUrl);
      Settings.setApiKey(this.form.apiKey);
      this.appRef.tab = 0;
      window.location.reload();

      this.appRef.loadServerData();
    },
    subscribe() {
      window.open(Settings.getServerUrl() + '/');
    },
  },
};
</script>

