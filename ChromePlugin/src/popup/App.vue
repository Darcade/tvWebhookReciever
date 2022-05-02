<template>
  <AppFrame ref="frame" />
</template>

<script>
/**
 * TODO:
 * Add stoploss,
 *
 */
import AppFrame from '../components/AppFrame.vue';

export default {
  name: 'App',
  components: {AppFrame},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Lato:400,700");

body {
  width: 400px;
}

</style>
