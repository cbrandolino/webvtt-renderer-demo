const path = require('path');
const { alias } = require('react-app-rewire-alias')

const aliasMap = {
  vttjs: 'lib',
}

module.exports = {
  paths: function (paths, env) {
    const entryPoint = (env === 'production') ? 'lib/index.ts' : 'demo/index.tsx';
    paths.appIndexJs = path.resolve(__dirname, 'src', entryPoint);
    return paths;
  },
  ...alias(aliasMap)
}