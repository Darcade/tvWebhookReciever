<template>
  <div>
    <v-container style="max-width: 600px">
      <h3 v-if="positions && positions.length == 0 && networkStatus == 'CONNECTED'">
        No positions found.
      </h3>
      <h3 v-else-if="networkStatus =='ERROR' && error && error.positions">
        {{ error.positions }}
      </h3>
      <div v-else>
        <v-btn
          style="width:100%"
          @click="refreshPositions"
        >
          Refresh
        </v-btn>
        <v-card
          v-for="posAcc of getFilteredItems"
          :key="posAcc.localAccountID"
          style="margin-top: 30px;"
        >
          <v-card-title>{{ posAcc.accName }}</v-card-title>        <v-card-text>
            <div
              v-for="(item, index) in posAcc.positions"
              :key="index"
            >
              <v-list three-line>
                <template v-for="position in item">
                  <v-subheader
                    v-if="index && position.valueEv !== '0'"
                    :key="position"
                    v-text="index"
                  />
                  <p
                    v-if="index && position.valueEv !== '0'"
                    :key="position"
                  >
                    Available Balance: <strong>{{ getAvailBalance(posAcc, index) }} %</strong>
                  </p>
                  <!--
          <v-divider
            v-else-if="item.divider"
            :key="index"
            :inset="item.inset"
          ></v-divider>-->

                  <v-list-item
                    v-if="position.valueEv !== '0'"
                    :key="position"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{
                          position.symbol
                        }}
                      </v-list-item-title>
                      <v-list-item-subtitle />
                      <v-simple-table>
                        <template #default>
                          <tbody>
                            <tr
                              v-for="(posItem, posKey) in position"
                              :key="posKey"
                            >
                              <td v-if="posItem && posKeyNotIgnored(posKey)">
                                {{ posKey }}
                              </td>
                              <td v-if="posItem && posKeyNotIgnored(posKey)">
                                {{ posItem }}
                              </td>
                            </tr>
                            <tr :class="getGainLoss(position) < 0 ? 'red':'green'">
                              <td>Gain/Loss </td>
                              <td>{{ (getGainLoss(position) * 100).toPrecision(4) }} %</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script>

import {mapState} from 'vuex';
export default {
  props: [],
  data() {
    return {
      alertFilter: null,
      dateFilter: null,
      dateFilterMenu: false,
    };
  },
  computed: {

    ...mapState(['events', 'alerts', 'positions', 'error', 'networkStatus']),
    getFilteredItems() {
      console.log('returning filtered items', this.$store.state.positions);
      return this.$store.state.positions;
      /* .filter(
          function (event) {
            var alertMatching = true,
              dateMatching = true;
            if (this.alertFilter) {
              alertMatching = false;
              if (event && event.a && event.a.ID == this.alertFilter) {
                alertMatching = true;
              }
            }
            if (this.dateFilter && this.dateFilter.length == 2) {
              console.log("Checking date for filter");
              var dateRange = this.dateFilter;
              var low = +new Date(dateRange[0]),
                high = +new Date(dateRange[1]);
              if (+new Date(low) > +new Date(high))
                (low = +new Date(dateRange[1])),
                  (high = +new Date(dateRange[0]));
              dateMatching = false;
              if (event && event.t) {
                if (event.t > low && event.t < high) dateMatching = true;
              }
            }
            return alertMatching && dateMatching;
          }.bind(this)
        )
        .sort(function (a, b) {
          return b.t - a.t;
        });*/
    },
  },
  mounted() {
    console.log('this.$root:', this.$root);
  },
  methods: {
    formatDateInput(dateRange) {
      console.log('Formatting date', dateRange);
      let low = dateRange[0];
      let high = dateRange[1];
      if (+new Date(low) > +new Date(high)) {
        (low = dateRange[1]), (high = dateRange[0]);
      }
      return low + ' to ' + high;
    },
    resetFilters() {
      console.log('Resetting filters');
      this.alertFilter = null;
      this.dateFilter = null;
    },
    posKeyNotIgnored(posKey) {
      if (posKey.endsWith('Er') || posKey.endsWith('Eq') || posKey.endsWith('Ev') || posKey.endsWith('Ep')) {
        return false;
      }
      const allowedKeys = ['leverage', 'currency', 'side', 'value', 'size', 'markPrice', 'avgEntryPrice', 'liquidationPrice', 'takeProfit', 'stopLoss'];
      if (allowedKeys.indexOf(posKey) !== -1) return true;

      return false;
    },
    getGainLoss(position) {
      const gainLoss = (Number(position.markPrice) / Number(position.avgEntryPrice) ) - 1;
      if (gainLoss > 0) return gainLoss;
      return gainLoss;
    },
    getAvailBalance(posAcc, currency) {
      const balancePercent = (posAcc.accounts[currency].totalUsedBalanceEv / posAcc.accounts[currency].accountBalanceEv);
      return ((1-balancePercent)*100).toPrecision(3);
    },
    refreshPositions() {
      this.$store.dispatch('loadEntity', 'positions');
    },
  },
};
</script>

<style>
</style>
