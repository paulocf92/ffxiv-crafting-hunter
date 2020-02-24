module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/proposal-optional-chaining',
    '@babel/proposal-nullish-coalescing-operator',
    [
      'babel-plugin-root-import',
      {
        rootPathSuffix: 'src',
      },
    ],
  ],
};
