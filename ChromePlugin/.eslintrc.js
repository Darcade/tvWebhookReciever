module.exports = {
  'extends': [
    'plugin:vue/recommended',
    'google',
  ],

  'rules': {
    'linebreak-style': ['off'],

    'max-len': ['off'], // ['error', { 'comments': 100, 'code': 120 }],
    'vue/multi-word-component-names': ['off'],
  },

  'overrides': [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
