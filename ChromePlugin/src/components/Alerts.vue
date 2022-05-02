<template>
  <div>
    <v-container style="max-width: 600px">
      <h3 v-if="alerts && alerts.length == 0 && networkStatus == 'CONNECTED'">
        No alerts found.
      </h3>
      <h3 v-else-if="networkStatus =='ERROR' && error && error.alerts">
        {{ error.alerts }}
      </h3>

      <div v-if="alerts && alerts.length > 0">
        <v-list two-line>
          <v-list-item-group
            v-model="selected"
            active-class="pink--text"
          >
            <template
              v-for="(alert, index) in alerts"
            >
              <div
                :id="'alert'+alert.ID"
                :key="alert.ID"
                :data-index="index"
              >
                <alert-list-item
                  :alert="alert"
                />

                <v-divider
                  v-if="index < alerts.length - 1"
                />
              </div>
            </template>
          </v-list-item-group>
        </v-list>
      </div>
    </v-container>
  </div>
</template>

<script>
import alertListItem from './alertListItem.vue';
import {mapState, mapActions} from 'vuex';


export default {
  components: {
    alertListItem,
  },
  props: ['status', 'accounts'],
  data() {
    return {
      valid: false,
      selected: null,
      // TODO add ref to element
      appRef: this.$root.$children[0].$refs.frame,
    };
  },
  computed: {
    ...mapState(['events', 'alerts', 'networkStatus', 'error']),
  },
  mounted() {
    console.log('this.$root:', this.$root);
  },

  methods: {
    ...mapActions(['triggerAlert',
    ]),

  },
};
</script>

<style>
</style>
