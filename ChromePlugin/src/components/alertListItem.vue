<template>
  <v-list-item>
    <template #default="">
      <v-dialog
        v-model="deleteDialog"
        width="500"
      >
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Deleting alert
          </v-card-title>

          <v-card-text>
            Do you really want to delete Alert with ID: {{ toDeleteAlertID }}
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click="clearDeleteDialog"
            >
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn
              color="red"
              text
              @click="clickDeleteAlertDialog"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-list-item-content @click="editAlert(alert)">
        <v-list-item-subtitle
          class="text--primary"
          v-text="alert.hookType"
        />
        <v-list-item-title
          id="alertName"
          v-text="alert.name"
        />

        <v-list-item-subtitle
          id="alertDescription"
          class="text--primary"
          v-text="alert.description"
        />

        <v-list-item-subtitle style="overflow:visible;display:contents;">
          <v-chip
            v-if="alert.side"
            id="alertSide"
            :color="alert.side == 'Buy' ? 'green' : 'red'"
          >
            {{
              alert.side
            }}
          </v-chip>
          <v-chip

            v-if="alert.orderType"
            id="alertOrderType"
            :color="alert.orderType == 'Market' ? 'lime' : 'blue'"
          >
            {{ alert.orderType }}
          </v-chip>
          <v-chip
            v-if="alert.takeProfit"
            id="alertTakeProfitPercent"
            color="cyan"
            v-text="alert.takeProfitPercent?'Close at '+alert.takeProfit+'% profit':'Takeprofit price '+alert.takeProfit"
          />
          <v-chip
            v-if="alert.minimalPercentBalance"
            id="alertMinimalPercentBalance"
            color="cyan"
            v-text="'Minimal percent balance:  '+alert.minimalPercentBalance+'%'"
          />
          <v-chip
            v-if="alert.onlyCloseOnProfit"
            id="alertOnlyCloseOnProfit"
            color="green lighten-3"
          >
            OnlyCloseOnProfit
          </v-chip>
          <v-chip
            v-if="alert.reduceOnly"
            id="alertOrderType"
          >
            ReduceOnly
          </v-chip>

          <v-chip id="alertSymbol">
            {{ alert.symbol }}
          </v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        {{ alert.ID }}
        <v-list-item-action-text
          v-if="alert.orderPrice == 0 || alert.orderType == 'Market'"
          id="alertPrice"
        >
          Market Order
        </v-list-item-action-text>
        <v-list-item-action-text
          v-else
          id="alertPrice"
          v-text="'Limit order price: ' + alert.orderPrice"
        />
        <v-list-item-action-text
          v-if="alert.triggerPrice"
          id="alertTriggerPrice"
          v-text="'Trigger price: ' + alert.triggerPrice"
        />
        <v-list-item-action-text
          v-if="alert.offset"
          id="alertOffset"
          v-text="'Offset: ' + alert.offset"
        />
        <v-list-item-action-text
          v-if="alert.percent > 0"
          id="positionPercent"
          v-text="alert.percent + '% of Position'"
        />
        <v-list-item-action-text
          v-if="alert.orderQuantity"
          id="alertQuantity"
          v-text="'Quantity: ' + alert.orderQuantity"
        />
        <v-btn
          id="triggerAlert"
          color="orange"
          icon
          @click="triggerAlert(alert.ID)"
        >
          <v-icon>mdi-play</v-icon>
        </v-btn>
        <v-tooltip
          v-if="isBrowserExtension"
          top
        >
          <template #activator="{ on: tooltip }">
            <v-btn
              id="injectIntoTradingviewAlertForm"
              color="blue"
              icon
              v-on="{ ...tooltip }"
              @click="injectIntoTradingviewAlertForm(alert)"
            >
              <v-icon>mdi-needle</v-icon>
            </v-btn>
          </template>
          <span>Will inject data into Tradingview Alert Form.</span>
        </v-tooltip>
        <v-btn
          id="deleteAlert"
          color="red"
          icon
          @click="showDeleteDialog(alert)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <!--<v-btn color="orange" icon @click="editAlert(alert)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>-->
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script>
import settings from '../settings';
import {mapState, mapActions} from 'vuex';

export default {
  props: ['alert'],
  data() {
    return { // TODO add ref to element
      appRef: this.$root.$children[0].$refs.frame,
      selected: null,
      deleteDialog: false,
      toDeleteAlertID: null,
    };
  },
  computed: {
    ...mapState(['events', 'alerts', 'networkStatus', 'error']),
    isBrowserExtension() {
      return chrome && chrome.extension;
    },
  },
  mounted() {
    console.log('this.$root:', this.$root);
  },

  methods: {
    ...mapActions(['triggerAlert', 'deleteAlert',
    ]),
    injectIntoTradingviewAlertForm(cAlert) {
    // this.submitAlert();
    // console.log('Submitted!');
      if (chrome && chrome.extension) {
        this.serverUrl = settings.getServerUrl();
        console.log('🚀 ~ file: Main.vue ~ line 415 ~ onSubmit ~ serverUrl', this.serverUrl);
        // https://hookapi.darcade.de/api/alert/:alertid
        this.generatedURL = `${this.serverUrl}/api/alert/${cAlert.ID}`;
        this.generatedBody = {
          authKey: settings.getApiKey(),
          ID: cAlert.ID,
        };
        const stringifiedBody = JSON.stringify(this.generatedBody);


        const setBodyScript =
        'document.getElementsByName("description")[1].value = "' +
        // this.generatedBody +
        stringifiedBody.replaceAll('"', '\\"') +
        '"';

        const setWebhookUrl =
        'document.getElementsByName("webhook-url")[0].value = "' +
        this.generatedURL +
        '";';
        console.log('setBodyScript', setBodyScript);
        browser.tabs
            .executeScript({
              code: setWebhookUrl,
            }).then( function onExecuted(result) {
              console.log(`Inserted alert`);
            }, function onError(error) {
              console.log(`Error: ${error}`);
            });

        browser.tabs
            .executeScript({
              code: setBodyScript,
            })
            .then( function onExecuted(result) {
              console.log(`Inserted alert`);
            }, function onError(error) {
              console.log(`Error: ${error}`);
            });
      }
    },
    showDeleteDialog(alert) {
      this.deleteDialog = true;
      this.toDeleteAlertID = alert.ID;
    },
    clearDeleteDialog() {
      this.deleteDialog = false;
      this.toDeleteAlertID = null;
    },
    clickDeleteAlertDialog() {
      this.deleteAlert(this.toDeleteAlertID);
      this.clearDeleteDialog();
    },
    editAlert(alert) {
      console.log('Editing alert', alert);

      console.log('🚀 ~ file: alertListItem.vue ~ line 148 ~ editAlert ~ this.appRef', this.appRef);
      this.$store.commit('setAlertForm', alert);
      this.appRef.tab=0;
    },

  },
};
</script>

<style>
</style>
