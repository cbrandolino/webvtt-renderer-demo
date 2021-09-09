const path = require('path');
const { alias } = require('react-app-rewire-alias')

const aliasMap = {
  vttjs: 'lib',
}

module.exports = {
  paths: function (paths, env) {        
    console.log(paths);
    paths.appIndexJs = path.resolve(__dirname, 'src/demo/index.tsx');
    return paths;
  },
  ...alias(aliasMap)
}