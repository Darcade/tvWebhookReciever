
// support for testing web extensions
import chrome from 'sinon-chrome';

// simulate localStorage of browser

import 'mock-local-storage';
global.window = {};
window.localStorage = global.localStorage;

// import {expect} from 'chai';
import {createLocalVue, mount} from '@vue/test-utils';
import App from '@/App.vue';
import Vuex from 'vuex';
import vuetify from '@/plugins/vuetify';
import store from '@/store';

describe('App', () => {
  before(() => {
    global.chrome = chrome;
  });
  it('should work', () => {
    const localVue = createLocalVue();
    localVue.use(Vuex);
    // localVue.use(vuetify);

    // eslint-disable-next-line no-unused-vars
    const wrapper = mount(App, {
      localVue, store, vuetify,
    });
    console.log('test');
    // console.log(wrapper.text());
    // expect(wrapper.text()).to.include(`Welcome to Your Vue.js App`);
  });
  after(() => {
    chrome.flush();
  });
});
