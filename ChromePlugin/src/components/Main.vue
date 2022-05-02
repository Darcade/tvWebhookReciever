<template>
  <v-form
    ref="mainForm"
    v-model="valid"
    lazy-validation
  >
    <v-text-field
      v-if="alertForm.ID"
      id="alertID"
      v-model="alertForm.ID"
      label="AlertID:"
      placeholder="Gets generated"
      disabled
    />
    <v-text-field
      id="name"
      v-model="alertForm.name"
      :rules="[
        (v) => !!v || 'Name is required',
        (v) => (v && v.length <= 255) || 'Name must be less than 10 characters',
      ]"
      label="Alert Name:"
      required
      placeholder="Enter Name of the alert"
    />
    <v-text-field
      id="description"

      v-model="alertForm.description"
      :rules="[
        (v) => !!v || 'Description is required',
        (v) => (v && v.length <= 255) || 'Description must be less than 10 characters',
      ]"
      required
      label="Alert Description:"
      placeholder="Enter Description of the alert"
    />
    <v-select
      id="account"

      v-model="alertForm.account"
      :rules="[v => !!v || 'Account is required']"
      required
      :items="accounts_options"
      label="Available Accounts"
      @change="loadAccountsMarkets"
    />

    <v-select
      id="symbol"
      v-model="alertForm.symbol"
      :items="currAccSymbols"
      required
      :rules="[v => !!v || 'Symbol is required']"
      label="Available Symbols"
    />
    <v-switch
      v-model="useMinimalPercentBalance"
      label="Use minimal percent balance"
      @change="clearUseMinimalPercentBalance"
    />
    <v-slider
      v-if="useMinimalPercentBalance || alertForm.minimalPercentBalance"
      id="minimalPercentBalanceSlider"
      v-model="alertForm.minimalPercentBalance"
      required
      :rules="[
        (v) => !!v || 'Minimal percent balance is required',
        (v) => (v && v > 0) || 'Minimal percent balance must be greater than 0',
      ]"
      class="align-center"
      max="100"
      min="0"
      label="Minimal percent balance:"
      hide-details
    >
      <template #append>
        <v-text-field

          id="minimalPercentBalanceTextField"
          v-model="alertForm.minimalPercentBalance"
          class="mt-0 pt-0"
          hide-details
          single-line
          type="number"
          style="width: 60px"
        />
      </template>
    </v-slider>


    <v-select
      id="orderType"


      v-model="alertForm.orderType"
      required
      :rules="[v => !!v || 'Order type is required']"
      :items="orderTypes"
      label="Order Type:"
    />
    <v-text-field
      v-if="alertForm.orderType!=='Market'"
      id="orderPrice"
      v-model="alertForm.orderPrice"
      required
      :rules="[v => !!v || 'Price is required']"
      label="Order price:"
      placeholder="Enter Order Price"
    />
    <v-select
      id="hookTypes"
      v-model="alertForm.hookType"
      :items="hookTypes"
      label="Hook API type:"

      required
      :rules="[v => !!v || 'HookType is required']"
    />
    <!--createOrder(req.params.symbol, req.body.side, req.body.price, req.body.quantity, req.body.reduceOnly)-->
    <div v-if="alertForm.hookType == 'createOrder'">
      <v-select
        id="orderSide"
        v-model="alertForm.side"
        :items="availableSides"

        required
        :rules="[v => !!v || 'Side is required']"
        label="Available Sides"
      />

      <v-text-field
        id="orderQuantity"

        v-model="alertForm.orderQuantity"
        required
        :rules="[v => !!v || 'Quantity is required']"
        label="Order quantity:"
        placeholder="Enter Order quantity"
      />

      <v-switch
        v-model="alertForm.reduceOnly"
        label="Reduce only"
      />
      <!-- <v-text-field
      v-if="form.hookType == 'setStopLoss'"
      label="Stop loss:"
      id="stopLoss"
      v-model="alertForm.stopLoss"
    ></v-text-field>-->
      <v-switch
        v-model="alertForm.useTakeProfit"
        label="Use Take Profit"
      />
      <!-- takeProfitPercent: true if percent gain should be used -->
      <v-switch
        v-if="alertForm.useTakeProfit"
        v-model="alertForm.takeProfitPercent"
        label="Use %Gain for Takeprofit"
      />
      <v-text-field
        v-if="
          alertForm.useTakeProfit
        "
        id="takeProfit"
        v-model="alertForm.takeProfit"
        :label="alertForm.takeProfitPercent?'Take profit at % gain':'Take profit at price'"
      />
    </div>
    <div v-else-if="alertForm.hookType == 'closePosition'">
      <v-slider

        id="positionPercentSlider"
        v-model="alertForm.percent"
        required
        :rules="[
          (v) => !!v || 'Percent is required',
          (v) => (v && v > 0) || 'Percent must be greater than 0',
        ]"
        class="align-center"
        max="100"
        min="0"
        label="Percent quantity of position:"
        hide-details
      >
        <template #append>
          <v-text-field

            id="positionPercentTextField"
            v-model="alertForm.percent"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 60px"
          />
        </template>
      </v-slider>
      <v-switch
        v-model="alertForm.onlyCloseOnProfit"
        label="Only close on profit"
      />
    </div>
    <div v-else-if="alertForm.hookType == 'setStopLoss'">
      <v-text-
        id="orderPrice"
        v-model="alertForm.orderPrice"
        label="Order price:"
        placeholder="Enter limit Price"
      />
      <v-text-field
        id="triggerPrice"
        v-model="alertForm.triggerPrice"
        label="Trigger price:"
        placeholder="Enter Trigger Price"
      />
      <v-slider
        id="positionPercentSlider"
        v-model="alertForm.percent"
        class="align-center"
        max="100"
        min="0"
        label="Percent quantity of position:"
        hide-details
      >
        <template #append>
          <v-text-field
            id="positionPercentTextField"
            v-model="alertForm.percent"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 60px"
          />
        </template>
      </v-slider>
    </div>
    <div v-else-if="alertForm.hookType == 'setTakeProfit'">
      <v-text-field
        id="orderPrice"
        v-model="alertForm.orderPrice"
        label="Order price:"
        placeholder="Enter Order Price"
      />
      <v-text-field
        id="triggerPrice"
        v-model="alertForm.triggerPrice"
        label="Trigger price:"
        placeholder="Enter Order Price"
      />
      <v-slider
        v-model="alertForm.percent"
        class="align-center"
        max="100"
        min="0"
        label="Percent quantity of position:"
        hide-details
      >
        <template #append>
          <v-text-field
            v-model="alertForm.percent"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 60px"
          />
        </template>
      </v-slider>
    </div>

    <div v-else-if="alertForm.hookType == 'setTrailingStopLoss'">
      <v-text-field
        id="offset"
        v-model="alertForm.offset"
        label="Offset:"
        placeholder="Enter Order Price"
      />
      <v-text-field
        id="triggerPrice"
        v-model="alertForm.triggerPrice"
        label="Trigger price:"
        placeholder="Enter Order Price"
      />
      <v-slider
        v-model="alertForm.percent"
        class="align-center"
        max="100"
        min="0"
        label="Quantity % of position:"
        hide-details
      >
        <template #append>
          <v-text-field
            v-model="alertForm.percent"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 60px"
          />
        </template>
      </v-slider>
    </div>
    <div>
      <v-tooltip top>
        <template #activator="{ on: tooltip }">
          <v-btn
            id="saveAlertButton"
            color="success"
            @click="saveAlertButtonPressed"
            v-on="{ ...tooltip }"
          >
            Save Alert
          </v-btn>
        </template>
        <span>Will save Alert.</span>
      </v-tooltip>&nbsp;
      <v-tooltip top>
        <template #activator="{ on: tooltip }">
          <v-btn
            color="warning"
            @click="resetButtonClicked"
            v-on="{ ...tooltip }"
          >
            Reset
          </v-btn>
        </template>
        <span>Will reset this form.</span>
      </v-tooltip>&nbsp;
    </div>
  </v-form>
</template>
<script>

import {mapState, mapActions} from 'vuex';


export default {
  name: 'App',
  components: {},
  data() {
    return {
      useMinimalPercentBalance: false,
      hookTypes: [
        'createOrder',
        'closePosition',
        'setStopLoss',
        'setTakeProfit',
        'setTrailingStopLoss',
      ],
      valid: false,
      availableSides: ['Buy', 'Sell'],
      orderTypes: ['Market', 'Limit'],
      generatedURL: '',
      generatedBody: '',
      appRef: this.$root.$children[0].$refs.frame,
    };
  },
  computed: {
    ...mapState(['events', 'alerts', 'networkStatus', 'errorStatusCode', 'accounts', 'symbols', 'error', 'alertForm', 'accounts_options', 'markets', 'marketAccounts_options']),
    currAccSymbols() {
      return this.marketAccounts_options[this.alertForm.account];
    },

  },
  mounted() {
    // this.loadEntity('markets');
    this.loadAccountsMarkets();
    console.log('🚀 ~ file: Main.vue ~ line 350 ~ mounted ~ this.markets', this.markets);
    console.log('🚀 ~ file: Main.vue ~ line 349 ~ mounted ~ this.currAccSymbols', this.currAccSymbols);
    /* if (browser && browser.runtime) {
      const makeItGreen = 'document.body.style.border = "5px solid green"';

      const executing = browser.tabs.executeScript({
        code: makeItGreen,
      });
      executing.then( function onExecuted(result) {
        console.log(`We made it green`);
      }, function onError(error) {
        console.log(`Error: ${error}`);
      });
    }*/
  },
  methods: {...mapActions(['submitAlert', 'loadEntity', 'loadAccountsMarkets',
  ]),
  saveAlertButtonPressed() {
    console.log('🚀 ~ file: Main.vue ~ line 361 ~ saveAlertButtonPressed ~ this.valid', this.valid);
    this.valid = this.$refs.mainForm.validate();
    if (this.valid) {
      this.submitAlert(this.alertForm);
      this.resetButtonClicked();
      this.appRef.tab = 1;
    }
  },


  resetButtonClicked() {
    this.$store.commit('resetAlertForm');
  },
  clearUseMinimalPercentBalance() {
    if (!this.useMinimalPercentBalance) this.alertForm.minimalPercentBalance = null;
  },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Lato:400,700");
</style>
