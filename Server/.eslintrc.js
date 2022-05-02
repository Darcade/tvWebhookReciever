module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['google'],
  parserOptions: {
    'ecmaVersion': 'latest',
    'ecmaFeatures': {
      'modules': true,
    },
    'sourceType': 'module',
  },

  rules: {
    'linebreak-style': ['off'],
    'object-curly-spacing': ['off'],
    'space-before-function-paren': ['off'],
    'new-cap': ['warn'],
    'require-jsdoc': ['warn'],
    'max-len': ['off'], // ['error', { 'comments': 100, 'code': 120 }],
  },
};
