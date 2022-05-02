const plugins = [];
// if (process.env.NODE_ENV === 'test') {
console.log('Loading babel istanbul for vue | current CYPRESS_TESTING='+process.env.CYPRESS_TESTING);
plugins.push([
  'babel-plugin-istanbul', {
    // specify some options for NYC instrumentation here
    // like tell it to instrument both JavaScript and Vue files
    extension: ['.js', '.vue'],
  },
]);
// }
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  plugins,
  /* plugins: [[
    'babel-plugin-istanbul', {
      // specify some options for NYC instrumentation here
      // like tell it to instrument both JavaScript and Vue files
      extension: ['.js', '.vue'],
    },
  ]],*/
};
