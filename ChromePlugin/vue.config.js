module.exports = {
  chainWebpack: (config) => {
    if (process.env.TEST_COVERAGE === 'true') {
      config.module
          .rule('js')
          .use('istanbul-instrumenter-loader')
          .loader('istanbul-instrumenter-loader')
          .options({
            esModules: true,
          })
          .after('babel-loader');
    }
  },
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup',
    },
    options: {
      template: 'public/browser-extension.html',
      entry: './src/options/main.js',
      title: 'Options',
    },
    override: {
      template: 'public/browser-extension.html',
      entry: './src/override/main.js',
      title: 'Override',
    },
    standalone: {
      template: 'public/browser-extension.html',
      entry: './src/standalone/main.js',
      title: 'Standalone',
      filename: 'index.html',
    },
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js',
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js',
            ],
          },
        },
      },
    },
  },

  transpileDependencies: [
    'vuetify',
  ],
};
