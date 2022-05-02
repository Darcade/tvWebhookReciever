<template>
  <v-app
    ref="app"
    class="appBox"
  >
    <div class="topNavBar">
      <span style="display: none">{{ networkStatus }}</span>
      <div class="connectionStatus">
        <v-progress-circular
          v-if="networkStatus == 'CONNECTING'"
          indeterminate
          color="blue"
        />
        <v-tooltip
          v-else-if="networkStatus == 'CONNECTED'"
          bottom
        >
          <template #activator="{ on: tooltip }">
            <v-icon
              color="green"
              @click="loadServerData"
              v-on="{ ...tooltip }"
            >
              mdi-network
            </v-icon>
          </template>
          <span>Connected to Server - {{ serverUrl }}</span>
        </v-tooltip>
        <v-tooltip
          v-else
          bottom
        >
          <template #activator="{ on: tooltip }">
            <v-icon
              color="red"
              @click="loadServerData"
              v-on="{ ...tooltip }"
            >
              mdi-network-off
            </v-icon>
          </template>
          <span>Problem with connection to Server - {{ errorStatusCode }}</span>
        </v-tooltip>
      </div>
      <!--<v-system-bar></v-system-bar>-->
      <v-tabs
        v-model="tab"
        content-class="mt-3"
      >
        <v-tab
          id="mainTab"
          active
        >
          Main
        </v-tab>
        <v-tab id="alertsTab">
          Alerts
        </v-tab>
        <v-tab id="eventsTab">
          Events
        </v-tab>
        <v-tab id="positionsTab">
          Positions
        </v-tab>
        <v-tab id="accountsTab">
          Accounts
        </v-tab>
        <v-tab id="settingsTab">
          Settings
        </v-tab>
      </v-tabs>
    </div>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Main

          ref="main"
          class="inTabContent"
        />
        <!--<center
          v-else-if="networkStatus == 'CONNECTING'"
          class="inTabContent"
        >
          <v-progress-circular
            size="128"
            color="blue"
            indeterminate
            style="margin-top: 20px"
          />
          <br><span>Connecting...</span>
        </center>
        <h3
          v-else
          class="inTabContent"
        />-->
      </v-tab-item>
      <v-tab-item>
        <Alerts />
      </v-tab-item>
      <v-tab-item>
        <Events />
      </v-tab-item><v-tab-item>
        <Positions />
      </v-tab-item><v-tab-item>
        <Accounts />
      </v-tab-item>
      <v-tab-item>
        <SettingsComp class="inTabContent" />
      </v-tab-item>
    </v-tabs-items>
  </v-app>
</template>

<script>
/**
 * TODO:
 * Add stoploss,
 *
 */
import Main from '../components/Main.vue';
import Alerts from '../components/Alerts.vue';
import Events from '../components/Events.vue';

import Accounts from '../components/Accounts.vue';
import Positions from '../components/Positions.vue';
import SettingsComp from '../components/Settings.vue';


import {mapState, mapActions} from 'vuex';


export default {
  name: 'App',
  components: {Main, Events, SettingsComp, Alerts, Positions, Accounts},
  data() {
    return {
      tab: null,
      serverUrl: '',
      availableAccounts: [],
      availableSymbols: [],
      nextAlertID: null,
    };
  },
  computed: {
    ...mapState(['events', 'alerts', 'networkStatus', 'errorStatusCode', 'accounts']),
  },
  mounted() {
    setTimeout(this.loadServerData, 500);
    console.log('APP THIS', this);
  },

  methods: {
    ...mapActions(['loadEntity',
    ]),

    loadServerData() {
      console.log('🚀 ~ file: AppFrame.vue ~ line 230 ~ loadServerData');


      this.loadEntity('accounts');
      this.loadEntity('events');
      this.loadEntity('alerts');
      this.loadEntity('positions');
      this.$store.dispatch('loadTicker', 'BTC/USD');
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Lato:400,700");

body {
  background: #eef1f4 !important;
  font-family: "Lato", sans-serif !important;
  margin: 5px;
}

.nav-background {
  background: #353535;
}

.connectionStatus {
  position: absolute;
  z-index: 2;
  right: 0;
  margin: 8px;
}

.inTabContent {
  margin: 14px;
}

.topNavBar{
    position:fixed;
    top:0;
    width:100%;
    z-index:100;
}

.appBox{
  padding-top:48px;
}
</style>
