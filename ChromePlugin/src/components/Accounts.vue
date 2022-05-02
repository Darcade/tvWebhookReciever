<template>
  <div>
    <v-container style="max-width: 600px">
      <h3 v-if="alerts && alerts.length == 0 && networkStatus == 'CONNECTED'">
        No accounts found.
      </h3>
      <h3 v-else-if="networkStatus =='ERROR' && error && error.accounts">
        {{ error.accounts }}
      </h3>
      <v-form
        v-model="valid"
        lazy-validation
      >
        <v-text-field
          v-if="accountForm.ID"
          id="accountID"
          v-model="accountForm.ID"
          label="AccountID:"
          placeholder="Gets generated"
          disabled
        />
        <v-text-field
          id="accountName"
          v-model="accountForm.name"
          :rules="[
            (v) => !!v || 'Name is required',
            (v) => (v && v.length <= 255) || 'Name must be less than 10 characters',
          ]"
          label="Account Name:"
          required
          placeholder="Enter Name of the alert"
        />
        <v-text-field
          id="comment"

          v-model="accountForm.comment"
          :rules="[
            (v) => !!v || 'Comment is required',
          ]"
          required
          label="Account comment:"
          placeholder="Enter Comment of the account"
        />
        <v-select
          id="accountExchange"

          v-model="accountForm.exchange"
          :rules="[v => !!v || 'Exchange is required']"
          required
          :items="exchanges"
          label="Available Exchanges"
        />
        <v-text-field
          id="apiKey"
          v-model="accountForm.apiKey"
          :disabled="accountForm.apiKey=='*'"
          :rules="[
            (v) => !!v || 'Comment is required',
          ]"
          required
          label="Account apiKey:"
          placeholder="Enter apiKey of the account"
        />
        <v-text-field
          id="secret"
          v-model="accountForm.secret"
          :disabled="accountForm.secret=='*'"
          :rules="[
            (v) => !!v || accountForm.secret=='*' || 'Secret is required',
          ]"
          required
          label="Account secret:"
          placeholder="Enter Secret of the account"
        />
        <div>
          <v-tooltip
            top
            class="col s4"
          >
            <template #activator="{ on: tooltip }">
              <v-btn
                id="saveAccountButton"
                color="success"
                @click="saveAccount"
                v-on="{ ...tooltip }"
              >
                Save Account
              </v-btn>
            </template>
            <span>Will save Account.</span>
          </v-tooltip>&nbsp;
          <v-tooltip
            top
            class="col s4"
          >
            <template #activator="{ on: tooltip }">
              <v-btn
                id="clearAccountForm"
                color="orange"
                @click="clearForm"
                v-on="{ ...tooltip }"
              >
                Clear Form
              </v-btn>
            </template>
            <span>Will clear for to allow creation of new Account</span>
          </v-tooltip>&nbsp;
          <v-tooltip
            v-if="accountForm.apiKey=='*' && accountForm.secret=='*'"
            top
            class="col s4"
          >
            <template #activator="{ on: tooltip }">
              <v-btn
                id="changeApiKeyBtn"
                color="blue"
                @click="changeApiKey"
                v-on="{ ...tooltip }"
              >
                Change update key
              </v-btn>
            </template>
            <span>Will allow you to change apiKey</span>
          </v-tooltip>&nbsp;
        </div>
      </v-form>
      <div v-if="accounts && accounts.length > 0">
        <v-list
          id="accountsList"
          two-line
        >
          <v-list-item-group
            v-model="selected"
            active-class="pink--text"
          >
            <template
              v-for="(account, index) in accounts"
            >
              <div
                :id="'account'+account.ID"
                :key="account.ID"
                :data-index="index"
              >
                <v-list-item>
                  <v-list-item-content
                    class="row"
                    @click="editAccount(account)"
                  >
                    <div class="col s11">
                      <strong>{{ account.name }} | {{ account.exchange }}</strong><br>  {{ account.comment }}
                    </div>
                    <div class="col s1">
                      <v-tooltip
                        v-if="account.ccxtConnected"
                        bottom
                      >
                        <template #activator="{ on: tooltip }">
                          <v-icon
                            color="green"
                            v-on="{ ...tooltip }"
                          >
                            mdi-account-network
                          </v-icon>
                        </template>
                        <span>Authenthication at {{ account.exchange }} was successfull</span>
                      </v-tooltip>
                      <v-tooltip
                        v-else
                        bottom
                      >
                        <template #activator="{ on: tooltip }">
                          <v-icon
                            color="red"
                            v-on="{ ...tooltip }"
                          >
                            mdi-close-network
                          </v-icon>
                        </template>
                        <span>Authenthication at {{ account.exchange }} failed</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      id="deleteAccountBtn"
                      color="orange"
                      icon
                      @click="deleteEntity({entityKey:'account', entityID: account.ID})"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-divider
                  v-if="index < accounts.length - 1"
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
import {mapState, mapActions} from 'vuex';


export default {
  components: {
  },

  data() {
    return {
      valid: false,
      selected: null,
      accountForm: {ID: null,
        name: '',
        comment: '',
        apiKey: '',
        secret: ''},
      exchanges: [{text: 'Phemex', value: 'phemex'}, {text: 'Phemex testnet', value: 'phemexTestnet'}],
      // TODO add ref to element
      appRef: this.$root.$children[0].$refs.frame,
    };
  },
  computed: {
    ...mapState(['events', 'accounts', 'networkStatus', 'error']),
  },
  mounted() {
    console.log('this.$root:', this.$root);
    this.loadEntity('accounts');
  },

  methods: {
    ...mapActions(['triggerAlert', 'submitEntity', 'loadEntity', 'deleteEntity',
    ]),
    saveAccount() {
      const formCopy = JSON.parse(JSON.stringify(this.accountForm));
      if (formCopy.apiKey=='*' && formCopy.secret=='*') {
        // clear masked out values so they do not get overwritten
        delete formCopy.apiKey;
        delete formCopy.secret;
      }
      this.submitEntity({entityKey: 'account', entity: formCopy});
      this.clearForm();
    },
    editAccount(account) {
      this.accountForm = account;
    },
    changeApiKey() {
      this.accountForm.apiKey = '';
      this.accountForm.secret = '';
    },
    clearForm() {
      this.accountForm={ID: null,
        name: '',
        comment: '',
        apiKey: '',
        secret: ''};
    },
  },
};
</script>

<style>
</style>
