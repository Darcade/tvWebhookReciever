<template>
  <div>
    <v-container style="max-width: 600px">
      <h3 v-if="events && events.length == 0 && networkStatus == 'CONNECTED'">
        No events found.
      </h3>
      <h3 v-else-if="networkStatus =='ERROR' && error && error.events">
        {{ error.events }}
      </h3>
      <div v-else>
        <v-select
          v-model="alertFilter"
          :items="getAlertsSelectItems"
          label="Filter Alerts:"
        />
        <v-menu
          ref="dateFilterMenu"
          v-model="dateFilterMenu"
          :close-on-content-click="false"
          :return-value.sync="dateFilter"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="dateFilter"
              label="Date filter"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="dateFilter"
            no-title
            scrollable
            range
          >
            <v-spacer />
            <v-btn
              text
              color="primary"
              @click="dateFilterMenu = false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="$refs.dateFilterMenu.save(dateFilter)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
        <v-btn @click="resetFilters">
          Reset all filters
        </v-btn>
        <v-timeline
          v-if="getFilteredEvents && getFilteredEvents.length > 0"
          dense
          clipped
        >
          <v-timeline-item
            v-for="event in getFilteredEvents"
            :key="event.timestamp"
            :color="
              event && event.eventType && event.eventType.includes('Error') ? 'red' : 'green'
            "
            small
          >
            <v-row
              v-if="event && event.alertObj"
              justify="space-between"
            >
              <v-col cols="12">
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <h2 v-on="on">
                      #{{ event.alertObj.ID }} | {{ event.alertObj.hookType }}
                    </h2>
                  </template>

                  <div v-if="event.alertObj">
                    <span
                      v-for="alertKey of Object.keys(event.alertObj)"
                      :key="alertKey"
                    >
                      {{ alertKey }} : <strong> {{ event.alertObj[alertKey] }}</strong><br>
                    </span>
                  </div>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row
              justify="space-between"
              style="margin-top: 0;"
            >
              <v-col
                cols="8"
                style="padding-bottom: 0; padding-top: 0;"
              >
                <v-tooltip
                  top
                  :disabled="!event.message"
                >
                  <template #activator="{ on }">
                    <span v-on="on">
                      {{ event.name }}
                    </span><br>
                  </template>
                  <span>{{ event.message }}</span><br>
                  <span v-if="event.exchangeResponse == 'NotInProfit'">Not in profit</span><br>
                </v-tooltip>
              <!-- TODO ADD TOOLTIP FOR  FULL MESSAGE {{ event.m }}-->
              </v-col>
              <!--<v-col v-if="event && event.r && event.r.data" cols="6">
                <v-chip small>{{event.r.data.price}}</v-chip>
                <v-chip small>{{event.r.data.orderQty}}</v-chip>
                <v-chip small>{{event.r.data.side}}</v-chip>
                <v-chip small>{{event.r.data.orderType}}</v-chip>
                <v-chip small>{{event.r.data.symbol}}</v-chip>
            </v-col>-->
              <v-col
                class="text-right"
                cols="4"
                style="padding-bottom: 0;padding-top: 0;"
              >
                <small>{{ new Date(event.timestamp).toLocaleDateString("de-DE") }} <br>
                  {{ new Date(event.timestamp).toLocaleTimeString("de-DE") }}</small>
              </v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col
                v-if="event && event.alertObj"
                cols="12"
                style="padding-top: 0; "
              >
                <v-chip small>
                  {{ event.alertObj.symbol }}
                </v-chip>
                <v-chip
                  v-if="event.alertObj.percent"
                  small
                >
                  {{ event.alertObj.percent }}%
                </v-chip>
                <v-chip
                  v-if="event.alertObj.orderPrice"
                  small
                >
                  Price:{{ event.alertObj.orderPrice }}
                </v-chip>
                <v-chip
                  v-if="event.alertObj.orderQuantity"
                  small
                >
                  Quantity:{{ event.alertObj.orderQuantity }}
                </v-chip>
                <v-chip
                  v-if="event.alertObj.orderType"
                  small
                >
                  {{
                    event.alertObj.orderType
                  }}
                </v-chip>
                <v-chip
                  v-if="event.alertObj.triggerPrice"
                  small
                >
                  Trigger:{{ event.alertObj.triggerPrice }}
                </v-chip>
                <v-chip
                  v-if="event.exchangeResponse && event.exchangeResponse.data && event.exchangeResponse.data.price"
                  :color="event.exchangeResponse.data.side == 'Buy' ? 'green' : 'red'"
                  small
                >
                  at price {{ event.exchangeResponse.data.price }}
                </v-chip>
              </v-col>
            </v-row>
          </v-timeline-item>
        </v-timeline>
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

    ...mapState(['events', 'alerts', 'error', 'networkStatus']),
    getAlertsSelectItems() {
      const alertOptions = [
        {
          value: null,
          text: `All`,
        },
      ];
      for (const alert of this.alerts) {
        alertOptions.push({
          value: alert.ID,
          text: `#${alert.ID} - ${alert.name}`,
        });
      }
      return alertOptions;
    },

    getFilteredEvents() {
      const filteredEvents = this.events
          .filter(
              function(event) {
                let alertMatching = true;
                let dateMatching = true;
                if (this.alertFilter) {
                  alertMatching = false;
                  if (event && event.a && event.a.ID == this.alertFilter) {
                    alertMatching = true;
                  }
                }
                if (this.dateFilter && this.dateFilter.length == 2) {
                  console.log('Checking date for filter');
                  const dateRange = this.dateFilter;
                  let low = +new Date(dateRange[0]);
                  let high = +new Date(dateRange[1]);
                  if (+new Date(low) > +new Date(high)) {
                    (low = +new Date(dateRange[1])),
                    (high = +new Date(dateRange[0]));
                  }
                  dateMatching = false;
                  if (event && event.t) {
                    if (event.t > low && event.t < high) dateMatching = true;
                  }
                }
                return alertMatching && dateMatching;
              }.bind(this),
          )
          .sort(function(a, b) {
            return b.t - a.t;
          });

      // Order by date
      // TODO order selected by user
      filteredEvents.sort(function(a, b) {
        const keyA = new Date(a.timestamp);
        const keyB = new Date(b.timestamp);
        // Compare the 2 dates

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      });

      console.log('Returning filteredEvents', filteredEvents);
      return filteredEvents;
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
  },
};
</script>

<style>
</style>
