import Vue from 'vue';

import vuetify from './plugins/vuetify';

import store from './store';

import App from './App.vue';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  ref: 'main',
  vuetify,
  store,
  render: (h) => h(App),
});
